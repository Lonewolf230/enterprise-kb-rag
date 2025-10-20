from flask import Blueprint, request, jsonify
from services.gemini import client as gemini_client
from google.genai.types import Part,Content

image_captioning_bp=Blueprint("image_captioning", __name__)

allowed_extensions={"png", "jpg", "jpeg", "gif"}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in allowed_extensions


@image_captioning_bp.route('/caption', methods=['POST'])
def caption_image():
    file= request.files.get('image')
    if not file:
        return jsonify({"error": "No image part in the request"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    try:
        img_bytes=file.read()

        content=[
            Content(
                parts=[
                    Part.from_bytes(data=img_bytes,mime_type=file.mimetype),
                    Part.from_text(text="Generate a accurate and concise caption for this image which should capture the full meaning of the image.")
                ]
            )
        ]

        response=gemini_client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=content
        )

        caption=response.text.strip() if response.text else "No caption generated."
        return jsonify({"filename": file.filename, "caption": caption}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to caption image: {str(e)}"}), 500
    

