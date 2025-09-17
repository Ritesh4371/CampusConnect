# 🎓 College Assistant Chatbot

A multilingual, AI-powered chatbot system for college assistance with file upload/download capabilities, real-time chat, and smart features.

## ✨ Features

- 🌍 **Multilingual Support** - Automatic language detection and translation
- 💬 **Real-time Chat** - WebSocket-based instant messaging
- 📁 **File Management** - Drag & drop file upload and download
- 🧠 **Smart Responses** - Context-aware conversations
- 📱 **Responsive Design** - Works on desktop and mobile
- 🚀 **Easy Deployment** - Ready for Render, Docker, and local development

## 🏗️ Project Structure

```
college-chatbot-v1/
├── backend/                 # Flask backend server
│   ├── app.py              # Main application file
│   ├── services/           # Business logic services
│   ├── uploads/            # File upload directory
│   ├── downloads/          # File download directory
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile         # Backend Docker configuration
├── frontend/               # React frontend application
│   ├── src/               # React source code
│   ├── public/            # Static files
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile        # Frontend Docker configuration
├── docker-compose.yml     # Local development setup
├── render.yaml           # Render deployment configuration
└── README.md            # This file
```

## 🚀 Quick Start

### Option 1: Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd college-chatbot-v1
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.template .env
   # Edit .env with your configuration
   python app.py
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Option 2: Docker Development

1. **Run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## 🌐 Deployment on Render

### Method 1: Automatic Deployment (Recommended)

1. **Fork/Clone this repository to GitHub**
2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file and deploy both services

### Method 2: Manual Service Creation

#### Backend Deployment:
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT app:app`
   - **Environment:** Python 3
   - **Root Directory:** `backend`

#### Frontend Deployment:
1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
   - **Root Directory:** `frontend`

### Environment Variables for Production:

Set these in your Render service:

```env
SECRET_KEY=your-production-secret-key
FLASK_ENV=production
MONGODB_URI=your-mongodb-connection-string
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
PINECONE_API_KEY=your-pinecone-api-key
```

## 🔧 Configuration

### Backend Configuration (.env)

Copy `.env.template` to `.env` and configure:

```env
SECRET_KEY=your-secret-key
PORT=5000
MONGODB_URI=mongodb://localhost:27017/
GOOGLE_CLOUD_PROJECT_ID=your-project-id
PINECONE_API_KEY=your-api-key
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-app-password
```

### Frontend Configuration

The frontend automatically detects the environment:
- Development: Uses `http://localhost:5000`
- Production: Uses `window.location.origin`

## 📚 API Documentation

### Chat Endpoints

**POST /chat**
```json
{
  "message": "Hello, how are you?",
  "language": "auto",
  "session_id": "optional-session-id"
}
```

**WebSocket Events:**
- `chat_message` - Send a message
- `chat_response` - Receive a response

### File Management

**POST /upload**
- Upload files via multipart/form-data
- Supports: TXT, PDF, DOC, DOCX, images
- Max size: 16MB

**GET /download/<file_id>**
- Download files by ID

## 🎯 Features in Detail

### 🌍 Multilingual Support
- Automatic language detection using `langdetect`
- Translation support via Google Translate API
- Supports: English, Hindi, Spanish, French, German, Chinese, Japanese, Korean, Arabic

### 💬 Real-time Chat
- WebSocket connection with Socket.IO
- Fallback to REST API if WebSocket fails
- Session management and conversation history

### 📁 File Management
- Drag & drop interface with `react-dropzone`
- Secure file upload with validation
- File download with proper headers
- Support for multiple file formats

### 🧠 Smart Features
- Context-aware conversations
- Session persistence
- Error handling and recovery
- Responsive design for all devices

## 🔒 Security Features

- File type validation
- Secure filename handling
- CORS configuration
- Environment variable protection
- Input sanitization

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🛠️ Development

### Adding New Features

1. **Backend Services:** Add to `backend/services/`
2. **Frontend Components:** Add to `frontend/src/components/`
3. **API Endpoints:** Add to `backend/app.py`

### Testing Locally

```bash
# Test backend
cd backend
python -m pytest tests/

# Test frontend
cd frontend
npm test
```

## 📈 Scaling and Production

### Performance Optimization
- Use Redis for session storage
- Implement database connection pooling
- Add CDN for static assets
- Enable gzip compression

### Monitoring
- Add logging with proper levels
- Implement health check endpoints
- Use monitoring tools like Sentry
- Set up alerts for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-username/college-chatbot/issues) page
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

## 🚀 Next Steps

After deployment, consider adding:
- User authentication
- Database integration (MongoDB/PostgreSQL)
- Advanced NLP with Rasa
- Vector database for RAG (Pinecone/Weaviate)
- Email notifications
- Analytics dashboard
- Mobile app integration

---

**Happy Coding! 🎉**

Made with ❤️ for educational purposes.
