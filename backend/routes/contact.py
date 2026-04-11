"""routes/contact.py — Public contact form submission."""
from flask import Blueprint, request, jsonify
from datetime import datetime
from db import get_collection

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/', methods=['POST'])
def submit_contact():
    data = request.get_json() or {}
    name    = data.get('name', '').strip()
    email   = data.get('email', '').strip()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({"error": "Name, email and message are required"}), 400

    doc = {
        "name":      name,
        "email":     email,
        "subject":   subject,
        "message":   message,
        "status":    "pending",
        "createdAt": datetime.utcnow()
    }

    get_collection('contacts').insert_one(doc)
    return jsonify({"message": "Message sent successfully! We will get back to you soon."}), 201
