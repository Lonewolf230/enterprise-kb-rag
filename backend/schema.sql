CREATE TYPE conversation_type AS ENUM ('group', 'direct');

CREATE TYPE member_role AS ENUM ('admin', 'member');

CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');

CREATE TABLE public.conversations (
  id           bigserial PRIMARY KEY,
  type         conversation_type NOT NULL,
  name         text,
  created_by   uuid REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  is_archived  boolean NOT NULL DEFAULT false
);

CREATE TABLE public.conversation_members (
  id                    bigserial PRIMARY KEY,
  conversation_id       bigint NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
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
  id                   bigserial PRIMARY KEY,
  conversation_id      bigint NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id            uuid REFERENCES auth.users(id),
  type                 message_type NOT NULL DEFAULT 'text',
  content              text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  edited_at            timestamptz,
  deleted_at           timestamptz,
  reply_to_message_id  bigint REFERENCES public.messages(id),
  is_deleted           boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_messages_conv_created
  ON public.messages(conversation_id, created_at DESC);