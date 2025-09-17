import json
import uuid
from datetime import datetime
import os

class ConversationService:
    def __init__(self):
        # Simple file-based storage for demo
        # In production, use MongoDB or another database
        self.storage_file = 'conversations.json'
        self.conversations = self.load_conversations()

    def load_conversations(self):
        try:
            if os.path.exists(self.storage_file):
                with open(self.storage_file, 'r') as f:
                    return json.load(f)
        except:
            pass
        return {}

    def save_conversations(self):
        try:
            with open(self.storage_file, 'w') as f:
                json.dump(self.conversations, f, default=str, indent=2)
        except Exception as e:
            print(f"Error saving conversations: {e}")

    def create_session(self, user_id=None):
        session_id = str(uuid.uuid4())
        session_data = {
            'session_id': session_id,
            'user_id': user_id,
            'created_at': datetime.now().isoformat(),
            'messages': [],
            'context': {},
            'active': True
        }
        self.conversations[session_id] = session_data
        self.save_conversations()
        return session_id

    def add_message(self, session_id, message, message_type='user', intent=None, language=None):
        if session_id not in self.conversations:
            session_id = self.create_session()

        message_data = {
            'content': message,
            'type': message_type,
            'timestamp': datetime.now().isoformat(),
            'intent': intent,
            'language': language
        }

        self.conversations[session_id]['messages'].append(message_data)
        self.conversations[session_id]['last_activity'] = datetime.now().isoformat()
        self.save_conversations()

        return session_id

    def get_conversation_context(self, session_id, last_n_messages=5):
        if session_id in self.conversations:
            messages = self.conversations[session_id]['messages']
            return messages[-last_n_messages:] if messages else []
        return []

    def get_session_info(self, session_id):
        return self.conversations.get(session_id, None)
