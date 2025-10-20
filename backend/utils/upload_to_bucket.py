from services.supabase import supabase


def upload_to_bucket(bucket_name: str, file_obj, file_name: str):

    try:
        response = supabase.storage.from_(bucket_name).upload(file_name, file_obj)
        print("File uploaded to bucket successfully:", response)
        return response
    except Exception as e:
        raise Exception(f"Failed to upload file to bucket: {str(e)}")