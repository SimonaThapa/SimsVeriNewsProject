"""routes/notifications.py — User notifications + admin broadcast."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from datetime import datetime
from db import get_collection
from middleware.auth import require_auth, require_admin

notif_bp = Blueprint('notifications', __name__)


@notif_bp.route('/', methods=['GET'])
@require_auth
def get_notifications():
    uid   = get_jwt_identity()
    notes = list(
        get_collection('notifications')
        .find({"userId": uid})
        .sort("createdAt", -1)
        .limit(50)
    )
    return jsonify([{
        "id":        str(n['_id']),
        "type":      n.get('type', 'info'),
        "title":     n.get('title', ''),
        "message":   n.get('message', ''),
        "read":      n.get('read', False),
        "createdAt": n['createdAt'].isoformat() if n.get('createdAt') else '',
    } for n in notes])


@notif_bp.route('/<nid>/read', methods=['PUT'])
@require_auth
def mark_read(nid):
    get_collection('notifications').update_one(
        {"_id": ObjectId(nid)}, {"$set": {"read": True}}
    )
    return jsonify({"message": "Marked as read"})


@notif_bp.route('/read-all', methods=['PUT'])
@require_auth
def mark_all_read():
    uid = get_jwt_identity()
    get_collection('notifications').update_many(
        {"userId": uid}, {"$set": {"read": True}}
    )
    return jsonify({"message": "All marked as read"})


@notif_bp.route('/admin/broadcast', methods=['POST'])
@require_admin
def broadcast():
    data    = request.get_json() or {}
    title   = data.get('title', '').strip()
    message = data.get('message', '').strip()
    if not title or not message:
        return jsonify({"error": "Title and message are required"}), 400

    users = list(get_collection('users').find({"role": "user"}, {"_id": 1}))
    if not users:
        return jsonify({"message": "No users to notify", "count": 0})

    docs = [{
        "userId":    str(u['_id']),
        "type":      "admin",
        "title":     title,
        "message":   message,
        "read":      False,
        "createdAt": datetime.utcnow(),
    } for u in users]

    get_collection('notifications').insert_many(docs)
    return jsonify({"message": f"Sent to {len(docs)} users", "count": len(docs)})
