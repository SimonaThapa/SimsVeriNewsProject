"""routes/admin.py — Admin-only analytics and data management."""
from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from db import get_collection
from middleware.auth import require_admin

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/stats', methods=['GET'])
@require_admin
def stats():
    users  = get_collection('users')
    claims = get_collection('claims')
    week_ago = datetime.utcnow() - timedelta(days=7)

    top_users = list(
        users.find({"role": "user"}, {"name": 1, "points": 1, "totalClaims": 1})
        .sort("points", -1)
        .limit(5)
    )

    return jsonify({
        "totalUsers":     users.count_documents({"role": "user"}),
        "totalClaims":    claims.count_documents({}),
        "realCount":      claims.count_documents({"actualResult": "Real"}),
        "fakeCount":      claims.count_documents({"actualResult": "Fake"}),
        "uncertainCount": claims.count_documents({"actualResult": "Uncertain"}),
        "recentClaims":   claims.count_documents({"createdAt": {"$gte": week_ago}}),
        "recentUsers":    users.count_documents({"createdAt": {"$gte": week_ago}}),
        "topUsers": [{
            "name":        u.get('name'),
            "points":      u.get('points', 0),
            "totalClaims": u.get('totalClaims', 0),
        } for u in top_users],
    })


@admin_bp.route('/claims', methods=['GET'])
@require_admin
def list_claims():
    docs = list(
        get_collection('claims')
        .find({})
        .sort("createdAt", -1)
        .limit(200)
    )
    return jsonify([{
        "id":           str(c['_id']),
        "claimText":    (c.get('claimText', '')[:120] + '…') if len(c.get('claimText', '')) > 120 else c.get('claimText', ''),
        "actualResult": c.get('actualResult'),
        "confidence":   c.get('confidence'),
        "userId":       c.get('userId'),
        "createdAt":    c['createdAt'].isoformat() if c.get('createdAt') else '',
    } for c in docs])


@admin_bp.route('/contacts', methods=['GET'])
@require_admin
def list_contacts():
    docs = list(
        get_collection('contacts')
        .find({})
        .sort("createdAt", -1)
    )
    return jsonify([{
        "id":        str(c['_id']),
        "name":      c.get('name'),
        "email":     c.get('email'),
        "subject":   c.get('subject'),
        "message":   c.get('message'),
        "status":    c.get('status'),
        "createdAt": c['createdAt'].isoformat() if c.get('createdAt') else '',
    } for c in docs])


@admin_bp.route('/contacts/<cid>', methods=['DELETE'])
@require_admin
def delete_contact(cid):
    from bson import ObjectId
    get_collection('contacts').delete_one({"_id": ObjectId(cid)})
    return jsonify({"message": "Message deleted"})
