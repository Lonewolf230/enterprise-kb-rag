from services.gemini import client as gemini_client
from google.genai.types import Part,Content
from fastapi import APIRouter,UploadFile,File,Form,HTTPException,status

router=APIRouter(prefix="/images",tags=["image_captioning"])

allowed_extensions={"png", "jpg", "jpeg", "gif"}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in allowed_extensions


@router.post('/caption', status_code=status.HTTP_200_OK)
async def caption_image(
    image: UploadFile = File(...)
):
    if not image:
        raise HTTPException(status_code=400, detail="No image part in the request")
    if not allowed_file(image.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")

    try:
        img_bytes=await image.read()

        content=[
            Content(
                parts=[
                    Part.from_bytes(data=img_bytes,mime_type=image.content_type),
                    Part.from_text(text="Generate a accurate and concise caption for this image which should capture the full meaning of the image.")
                ]
            )
        ]

        response=gemini_client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=content
        )

        caption=response.text.strip() if response.text else "No caption generated."
        return {"filename": image.filename, "caption": caption}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to caption image: {str(e)}")   
    

