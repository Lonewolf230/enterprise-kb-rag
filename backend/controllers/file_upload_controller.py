from flask import Blueprint,request,jsonify
from utils.file_index import index_file,index_image_caption
from utils.upload_to_bucket import upload_to_bucket
import os
from dotenv import load_dotenv
load_dotenv()

SUPABASE_BUCKET=os.getenv("SUPABASE_BUCKET")

file_handling_bp=Blueprint("file_handling",__name__)

allowed_extensions={"txt","pdf","mp3","mp4","wav","m4a","docx","doc"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in allowed_extensions

def allowed_image_file(filename):
    image_extensions={"png", "jpg", "jpeg", "gif"}
    return '.' in filename and filename.rsplit('.',1)[1].lower() in image_extensions



@file_handling_bp.route('/upload',methods=['POST'])
def upload_files():
    files= request.files.getlist('files')
    index_name=request.form.get('index_name','general')
    if not files:
        return jsonify({"error": "No file part in the request"}), 400
    results=[]
    for file in files:
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": f"File type of {file.filename} is not allowed"}), 400
        else:
            try:
                print(file.filename)
                file_bytes=file.read()
                res=upload_to_bucket(bucket_name=SUPABASE_BUCKET,file_obj=file_bytes,file_name=file.filename,index_name=index_name)
                print(res)
                filekey=res.full_path

                if filekey.startswith(f"{SUPABASE_BUCKET}"):
                    filekey=filekey[len(f"{SUPABASE_BUCKET}/"):]

                print("File key:",filekey)
                index_file(index_name=index_name,file=file,key=filekey)
                results.append({"filename": file.filename, "status": "File uploaded and indexed successfully", "filekey": filekey})
                print("File indexed successfully.")
            
            except Exception as e:
                results.append({"filename": file.filename, "status": f"Failed to index file: {str(e)}"})
                print(f"Error indexing file {file.filename}: {str(e)}")

    return jsonify({"results": results}), 200




@file_handling_bp.route('/upload_images',methods=['POST'])
def upload_images():
    files= request.files.getlist('images')
    captions=request.form.getlist('captions')
    index_name=request.form.get('index_name','general')
    if not files:
        return jsonify({"error": "No image part in the request"}), 400
    results=[]
    for i,file in enumerate(files):
        if file.filename == '':
            return jsonify({"error": "No selected image"}), 400
        if not allowed_image_file(file.filename):
            return jsonify({"error": f"File type of {file.filename} is not allowed"}), 400
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

    return jsonify({"results": results}), 200



@file_handling_bp.route('/get',methods=['GET'])
def get_file():
    return jsonify({"message": "File retrieval endpoint"}), 200
