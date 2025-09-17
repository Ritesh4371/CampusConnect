from langdetect import detect, LangDetectException
import os

class LanguageService:
    def __init__(self):
        # For production, set up Google Translate API credentials
        # os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'path/to/your/credentials.json'
        self.supported_languages = {
            'en': 'English',
            'hi': 'Hindi',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic'
        }

    def detect_language(self, text):
        try:
            detected = detect(text)
            return detected if detected in self.supported_languages else 'en'
        except LangDetectException:
            return 'en'

    def translate_text(self, text, target_language='en', source_language=None):
        # Simple implementation - in production, use Google Translate API
        if source_language == target_language:
            return text

        # For demo purposes, return the original text with language indicator
        if target_language != 'en':
            return f"[{target_language.upper()}] {text}"

        return text

    def process_multilingual_query(self, message):
        detected_lang = self.detect_language(message)

        # In production, translate to English for processing
        english_message = message
        if detected_lang != 'en':
            # english_message = self.translate_text(message, 'en', detected_lang)
            pass

        return {
            'original_message': message,
            'detected_language': detected_lang,
            'english_message': english_message
        }

    def get_language_name(self, lang_code):
        return self.supported_languages.get(lang_code, 'Unknown')
