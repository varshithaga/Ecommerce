import firebase_admin
from firebase_admin import credentials, messaging
import os
from django.conf import settings

def initialize_firebase():
    try:
        # Check if already initialized
        firebase_admin.get_app()
    except ValueError:
        cert_path = os.path.join(settings.BASE_DIR, 'firebase-key.json')
        if os.path.exists(cert_path):
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred)
        else:
            print(f"Firebase key not found at {cert_path}")

def send_push_notification(token, title, body, data=None):
    initialize_firebase()
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data or {},
        token=token,
    )
    try:
        response = messaging.send(message)
        return response
    except Exception as e:
        print(f"Error sending push notification: {e}")
        return None
