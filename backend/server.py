
from controllers.auth_controller import router as auth_router
from controllers.file_upload_controller import router as file_upload_router
from controllers.image_captioning_controller import router as image_captioning_router
from fastapi import FastAPI
app=FastAPI()

@app.get('/')
def home():
    return {"message":"API is working"}

app.include_router(auth_router)
app.include_router(file_upload_router)
app.include_router(image_captioning_router)

if __name__=='__main__':
    print("Server is running")