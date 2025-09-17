from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime
import json
from services.language_service import LanguageService
from services.conversation_service import ConversationService
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['DOWNLOAD_FOLDER'] = 'downloads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

CORS(app, origins=["*"])
socketio = SocketIO(app, cors_allowed_origins="*")

# Ensure upload and download directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)

# Initialize services
language_service = LanguageService()
conversation_service = ConversationService()

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'docx', 'doc'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'College Chatbot API',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        language = data.get('language', 'auto')
        session_id = data.get('session_id', str(uuid.uuid4()))

        # Process with language service
        if language == 'auto':
            lang_result = language_service.process_multilingual_query(message)
            detected_lang = lang_result['detected_language']
            processed_message = lang_result['english_message']
        else:
            detected_lang = language
            processed_message = message

        # Simple response generation for now
        response_text = f"Hello! I received: {processed_message}"

        # Translate back if needed
        if detected_lang != 'en' and language == 'auto':
            response_text = language_service.translate_text(response_text, detected_lang, 'en')

        # Log conversation
        conversation_service.add_message(session_id, message, 'user', language=detected_lang)
        conversation_service.add_message(session_id, response_text, 'bot')

        response = {
            'reply': response_text,
            'language': detected_lang,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat()
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)

            file_info = {
                'id': str(uuid.uuid4()),
                'original_name': filename,
                'stored_name': unique_filename,
                'file_path': file_path,
                'upload_time': datetime.now().isoformat(),
                'file_size': os.path.getsize(file_path),
                'processed': False
            }

            return jsonify({
                'message': 'File uploaded successfully',
                'file_info': file_info
            })

        return jsonify({'error': 'File type not allowed'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<file_id>')
def download_file(file_id):
    try:
        # Simple implementation - in production, use database lookup
        file_path = os.path.join(app.config['DOWNLOAD_FOLDER'], f"{file_id}.txt")

        if not os.path.exists(file_path):
            # Create a sample file for demo
            with open(file_path, 'w') as f:
                f.write(f"Sample download file for ID: {file_id}\nGenerated at: {datetime.now()}")

        return send_file(file_path, as_attachment=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('status', {'msg': 'Connected to chatbot server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('chat_message')
def handle_message(data):
    try:
        start_time = time.time()
        message = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))

        # Process message
        lang_result = language_service.process_multilingual_query(message)

        # Simple response for now
        response_text = f"Echo: {lang_result['english_message']}"

        # Translate back if needed
        if lang_result['detected_language'] != 'en':
            response_text = language_service.translate_text(
                response_text, 
                lang_result['detected_language'], 
                'en'
            )

        response_time = time.time() - start_time

        emit('chat_response', {
            'reply': response_text,
            'session_id': session_id,
            'language': lang_result['detected_language'],
            'response_time': response_time,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        emit('chat_response', {
            'reply': 'Sorry, I encountered an error processing your message.',
            'error': str(e)
        })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, debug=False, host='0.0.0.0', port=port)
