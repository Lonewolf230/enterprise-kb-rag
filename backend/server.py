from flask import Flask
from controllers.file_upload_controller import file_handling_bp
from controllers.image_captioning_controller import image_captioning_bp
from controllers.retrieval_controller import retrieval_bp
from flask_socketio import SocketIO,emit

app=Flask(__name__)
app.register_blueprint(file_handling_bp, url_prefix='/files')
app.register_blueprint(image_captioning_bp, url_prefix='/images')
app.register_blueprint(retrieval_bp, url_prefix='/retrieve')

socketio=SocketIO(app,cors_allowed_origins="*")


@app.route('/')
def home():
    return "Welcome to the Home Page!"

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('response', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    emit('response', {'message': 'Disconnected from server'})

@socketio.on('client_message')
def handle_message(data):
    print('Received message:', data)
    emit('server_message', {'message': data['message'],'group': data['message']}, broadcast=True,include_self=False)

@socketio.on('join_room')
def handle_join_room(data):
    room=data['room']
    if room:
        print(f'Client joined room: {room}')
        emit('server_message', {'message': f'Joined room: {room}'})


if __name__ == '__main__':
    socketio.run(app, debug=True,port=5000)