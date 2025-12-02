CREATE TYPE conversation_type AS ENUM ('group', 'direct');

CREATE TYPE member_role AS ENUM ('admin', 'member');

CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');

CREATE TABLE public.conversations (
  id           uuid PRIMARY KEY,
  type         conversation_type NOT NULL,
  name         text,
  created_by   uuid REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  is_archived  boolean NOT NULL DEFAULT false
);

CREATE TABLE public.conversation_members (
  id                    uuid PRIMARY KEY,
  conversation_id       uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id               uuid   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role                  member_role NOT NULL DEFAULT 'member',
  joined_at             timestamptz NOT NULL DEFAULT now(),
  is_muted              boolean NOT NULL DEFAULT false,
  last_read_message_id  bigint,
  last_read_at          timestamptz,
  UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_conv_members_user
  ON public.conversation_members(user_id);

CREATE INDEX idx_conv_members_conv
  ON public.conversation_members(conversation_id);

CREATE TABLE public.messages (
  id                   uuid PRIMARY KEY,
  conversation_id      uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id            uuid REFERENCES auth.users(id),
  type                 message_type NOT NULL DEFAULT 'text',
  content              text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  edited_at            timestamptz,
  deleted_at           timestamptz,
  reply_to_message_id  uuid REFERENCES public.messages(id),
  is_deleted           boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_messages_conv_created
  ON public.messages(conversation_id, created_at DESC);


CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'idx_profiles_username_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_profiles_username_unique
      ON public.profiles (username)
      WHERE username IS NOT NULL;
  END IF;
END;
$$;



CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',      
    NEW.raw_user_meta_data->>'username'   
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        username = EXCLUDED.username;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.create_profile_for_user();