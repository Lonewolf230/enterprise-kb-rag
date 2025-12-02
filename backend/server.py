
from controllers.auth_controller import router as auth_router
from controllers.file_upload_controller import router as file_upload_router
from controllers.image_captioning_controller import router as image_captioning_router
from controllers.user_controller import router as user_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from socketio import ASGIApp

sio=socketio.AsyncServer(
    cors_allowed_origins=[],
    cors_credentials=True,
    engineio_logger=True,
    async_mode='asgi'
)
app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@sio.event
async def connect(sid,environ):
    print(f"Client connected: {sid}")

@sio.event
async def join_room(sid,data):
    room=data.get('room')
    if room:
        await sio.enter_room(sid,room)
        print(f"Client {sid} joined room: {room}")

@sio.event
async def leave_room(sid,data):
    room=data.get('room')
    if room:
        await sio.leave_room(sid,room)
        print(f"Client {sid} left room: {room}")

@sio.event
async def message(sid,data):
    print(f"Message from {sid}: {data}")
    await sio.emit('message',data)

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")



@app.get('/')
def home():
    return {"message":"API is working"}

app.include_router(auth_router)
app.include_router(file_upload_router)
app.include_router(image_captioning_router)
app.include_router(user_router)

socket_app=ASGIApp(sio,other_asgi_app=app)

if __name__=='__main__':
    print("Server is running")