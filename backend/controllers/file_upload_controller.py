# from flask import Blueprint,request,jsonify
from fastapi import APIRouter,UploadFile,File,Form,HTTPException,status
from utils.file_index import index_file,index_image_caption
from utils.upload_to_bucket import upload_to_bucket
import os
from typing import List
from dotenv import load_dotenv
load_dotenv()

SUPABASE_BUCKET=os.getenv("SUPABASE_BUCKET")

router=APIRouter(prefix="/files",tags=["file_handling"])

allowed_extensions={"txt","pdf","mp3","mp4","wav","m4a","docx","doc"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in allowed_extensions

def allowed_image_file(filename):
    image_extensions={"png", "jpg", "jpeg", "gif"}
    return '.' in filename and filename.rsplit('.',1)[1].lower() in image_extensions



@router.post('/upload',status_code=status.HTTP_200_OK)
async def upload_files(
    files: List[UploadFile]=File(...),
    index_name: str = Form('general')
):

    if not files:
        raise HTTPException(status_code=400,detail="No files part in the request")
    
    results=[]
    for upload_file in files:

        if upload_file.filename == '':
            results.append({"filename": upload_file.filename, "status": "No selected file"})
            continue

        if not allowed_file(upload_file.filename):
            results.append({"filename": upload_file.filename, "status": "File type not allowed"})
            continue

        else:
            try:
                print(upload_file.filename)
                file_bytes=upload_file.read()
                res=upload_to_bucket(bucket_name=SUPABASE_BUCKET,file_obj=file_bytes,file_name=upload_file.filename,index_name=index_name)
                print(res)
                filekey=res.full_path

                if filekey.startswith(f"{SUPABASE_BUCKET}"):
                    filekey=filekey[len(f"{SUPABASE_BUCKET}/"):]

                print("File key:",filekey)
                index_file(index_name=index_name,file=upload_file,key=filekey)
                results.append({"filename": upload_file.filename, "status": "File uploaded and indexed successfully", "filekey": filekey})
                print("File indexed successfully.")
            
            except Exception as e:
                results.append({"filename": upload_file.filename, "status": f"Failed to index file: {str(e)}"})
                print(f"Error indexing file {upload_file.filename}: {str(e)}")

    return {"results": results}


@router.post('/upload_images',status_code=status.HTTP_200_OK)
def upload_images(
    files:List[UploadFile]=File(...),
    captions:List[str]=Form(...),
    index_name:str=Form('general')
):

    if not files:
        return {"error": "No image part in the request"}, 400
    results=[]
    for i,file in enumerate(files):

        if file.filename == '':
            results.append({"filename": file.filename, "status": "No selected file"})
            continue

        if not allowed_image_file(file.filename):
            results.append({"filename": file.filename, "status": "Image file type not allowed"})
            continue

        else:
            try:
                print(file.filename)
                img_bytes=file.read()
                res=upload_to_bucket(bucket_name="files_rag",file_obj=img_bytes,file_name=file.filename,index_name=index_name)
                filekey=res.full_path
                index_image_caption(index_name=index_name,filename=file.filename,caption=captions[i],key=filekey)
                results.append({"filename": file.filename, "status": "Image uploaded and indexed successfully"})
                print("Image indexed successfully.")
            
            except Exception as e:
                results.append({"filename": file.filename, "status": f"Failed to index image: {str(e)}"})
                print(f"Error indexing image {file.filename}: {str(e)}")

    return {"results": results}


# @router.get('/get')
# def get_file():
#     return {"message": "File retrieval endpoint"}, 200
