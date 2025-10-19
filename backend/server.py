from flask import Flask
from controllers.file_upload_controller import file_handling_bp

app=Flask(__name__)
app.register_blueprint(file_handling_bp, url_prefix='/files')

@app.route('/')
def home():
    return "Welcome to the Home Page!"


if __name__ == '__main__':
    app.run(debug=True)