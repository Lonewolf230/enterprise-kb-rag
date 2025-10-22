from services.supabase import supabase
import mimetypes

def upload_to_bucket(bucket_name: str, file_obj, file_name: str,index_name:str):

    try:
        file_type=get_content_type(file_name)
        file_path=f"{index_name}/{file_name}"
        print("Uploading file to bucket at path:", file_path)
        response = supabase.storage.from_(bucket_name).upload(path=file_path, file=file_obj,file_options={
            "content-type": file_type
        })
        print("File uploaded to bucket successfully:", response)
        return response
    except Exception as e:
        raise Exception(f"Failed to upload file to bucket: {str(e)}")
    
def get_content_type(file_name: str) -> str:
    content_type, _ = mimetypes.guess_type(file_name)
    if content_type is None:
        content_type = "application/octet-stream"
    print(content_type)
    return content_type