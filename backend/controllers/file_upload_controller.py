from flask import Blueprint,request,jsonify
import os
from utils.file_index import index_file

file_handling_bp=Blueprint("file_handling",__name__)

allowed_extensions={"txt","pdf","png","jpg","jpeg","mp3","mp4"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in allowed_extensions

@file_handling_bp.route('/upload',methods=['POST'])
def upload_files():
    files= request.files.getlist('files')
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
                index_file(index_name="general",file=file)
                results.append({"filename": file.filename, "status": "File uploaded and indexed successfully"})
                print("File indexed successfully.")
            
            except Exception as e:
                results.append({"filename": file.filename, "status": f"Failed to index file: {str(e)}"})
                print(f"Error indexing file {file.filename}: {str(e)}")

    return jsonify({"results": results}), 200

@file_handling_bp.route('/get',methods=['GET'])
def get_file():
    return jsonify({"message": "File retrieval endpoint"}), 200
