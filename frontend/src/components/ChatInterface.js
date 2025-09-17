import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import io from 'socket.io-client';
import './ChatInterface.css';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const API_URL = process.env.NODE_ENV === 'production' 
            ? window.location.origin 
            : 'http://localhost:5000';

        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from server');
        });

        newSocket.on('status', (data) => {
            console.log('Status:', data);
        });

        newSocket.on('chat_response', (response) => {
            setMessages(prev => [...prev, {
                type: 'bot',
                content: response.reply,
                timestamp: response.timestamp,
                language: response.language
            }]);
        });

        return () => newSocket.close();
    }, []);

    const sendMessage = async () => {
        if (inputMessage.trim() && socket && isConnected) {
            const messageData = {
                type: 'user',
                content: inputMessage,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, messageData]);

            socket.emit('chat_message', { 
                message: inputMessage,
                session_id: sessionId
            });

            setInputMessage('');
        }
    };

    const sendRestMessage = async () => {
        if (inputMessage.trim()) {
            const messageData = {
                type: 'user',
                content: inputMessage,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, messageData]);

            try {
                const API_URL = process.env.NODE_ENV === 'production' 
                    ? window.location.origin 
                    : 'http://localhost:5000';

                const response = await fetch(`${API_URL}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: inputMessage,
                        session_id: sessionId,
                        language: 'auto'
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setSessionId(data.session_id);
                    setMessages(prev => [...prev, {
                        type: 'bot',
                        content: data.reply,
                        timestamp: data.timestamp,
                        language: data.language
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        type: 'error',
                        content: 'Sorry, there was an error processing your message.',
                        timestamp: new Date().toISOString()
                    }]);
                }
            } catch (error) {
                console.error('Error:', error);
                setMessages(prev => [...prev, {
                    type: 'error',
                    content: 'Sorry, I could not connect to the server.',
                    timestamp: new Date().toISOString()
                }]);
            }

            setInputMessage('');
        }
    };

    const handleSendMessage = () => {
        if (isConnected) {
            sendMessage();
        } else {
            sendRestMessage();
        }
    };

    const onDrop = async (acceptedFiles) => {
        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const API_URL = process.env.NODE_ENV === 'production' 
                    ? window.location.origin 
                    : 'http://localhost:5000';

                const response = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (response.ok) {
                    setUploadedFiles(prev => [...prev, result.file_info]);
                    setMessages(prev => [...prev, {
                        type: 'system',
                        content: `File "${file.name}" uploaded successfully! (${(file.size / 1024).toFixed(1)} KB)`,
                        timestamp: new Date().toISOString()
                    }]);
                } else {
                    setMessages(prev => [...prev, {
                        type: 'error',
                        content: `Failed to upload ${file.name}: ${result.error}`,
                        timestamp: new Date().toISOString()
                    }]);
                }
            } catch (error) {
                console.error('Upload error:', error);
                setMessages(prev => [...prev, {
                    type: 'error',
                    content: `Failed to upload ${file.name}: Connection error`,
                    timestamp: new Date().toISOString()
                }]);
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/*': ['.txt'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        maxSize: 16 * 1024 * 1024 // 16MB
    });

    const downloadFile = async (fileId, fileName) => {
        try {
            const API_URL = process.env.NODE_ENV === 'production' 
                ? window.location.origin 
                : 'http://localhost:5000';

            const response = await fetch(`${API_URL}/download/${fileId}`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName || `download_${fileId}.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Failed to download file');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download file: Connection error');
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>🎓 College Assistant Chatbot</h2>
                <div className="connection-status">
                    <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                </div>
            </div>

            <div className="file-upload-section">
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>📁 Drop the files here...</p>
                    ) : (
                        <p>📎 Drag & drop files here, or click to select files</p>
                    )}
                </div>

                {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                        <h4>📋 Uploaded Files:</h4>
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                <span className="file-name">📄 {file.original_name}</span>
                                <span className="file-size">({(file.file_size / 1024).toFixed(1)} KB)</span>
                                <button 
                                    onClick={() => downloadFile(file.id, file.original_name)}
                                    className="download-btn"
                                >
                                    ⬇️ Download
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="messages-container">
                {messages.length === 0 && (
                    <div className="welcome-message">
                        <h3>👋 Welcome to College Assistant!</h3>
                        <p>I can help you with:</p>
                        <ul>
                            <li>📚 Course information</li>
                            <li>📅 Admission dates</li>
                            <li>🏛️ Library hours</li>
                            <li>📄 Document processing</li>
                            <li>🌍 Multi-language support</li>
                        </ul>
                        <p>Feel free to ask me anything or upload documents!</p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        <div className="message-content">
                            {message.content}
                        </div>
                        <div className="message-info">
                            <span className="message-timestamp">
                                {formatTimestamp(message.timestamp)}
                            </span>
                            {message.language && message.language !== 'en' && (
                                <span className="message-language">
                                    🌐 {message.language.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-section">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message in any language..."
                    className="message-input"
                    disabled={!inputMessage.trim()}
                />
                <button 
                    onClick={handleSendMessage} 
                    className="send-button"
                    disabled={!inputMessage.trim()}
                >
                    📤 Send
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;