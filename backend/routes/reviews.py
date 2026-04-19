"""routes/reviews.py — User ratings and messages."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from datetime import datetime
from db import get_collection
from middleware.auth import require_auth, require_admin

reviews_bp = Blueprint('reviews', __name__)
reviews_bp.strict_slashes = False

@reviews_bp.route('/', methods=['POST'])
def create_review():
    uid = get_jwt_identity()
    data = request.get_json() or {}
    
    rating = data.get('rating')
    message = data.get('message', '').strip()
    guestName = data.get('userName', '').strip()
    
    if rating is None or not (1 <= int(rating) <= 5):
        return jsonify({"error": "Rating between 1 and 5 is required"}), 400
    
    if not message:
        return jsonify({"error": "Message is required"}), 400

    if uid:
        user = get_collection('users').find_one({"_id": ObjectId(uid)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        review_doc = {
            "userId": ObjectId(uid),
            "userName": user.get('name', 'Anonymous'),
            "userAvatar": user.get('avatar'),
            "rating": int(rating),
            "message": message,
            "likes": [],
            "comments": [],
            "createdAt": datetime.utcnow()
        }
    else:
        # Guest review
        review_doc = {
            "userId": None,
            "userName": guestName if guestName else "Guest User",
            "userAvatar": None,
            "rating": int(rating),
            "message": message,
            "likes": [],
            "comments": [],
            "createdAt": datetime.utcnow()
        }
    
    res = get_collection('reviews').insert_one(review_doc)
    return jsonify({"id": str(res.inserted_id), "message": "Review submitted successfully!"}), 201

@reviews_bp.route('/', methods=['GET'])
def list_reviews():
    col = get_collection('reviews')
    reviews = list(col.find().sort("createdAt", -1).limit(50))
    
    # Calculate summary stats
    pipeline = [
        {"$group": {
            "_id": "$rating",
            "count": {"$sum": 1}
        }}
    ]
    raw_stats = list(col.aggregate(pipeline))
    
    total_reviews = col.count_documents({})
    breakdown = {i: 0 for i in range(1, 6)}
    sum_ratings = 0
    
    for s in raw_stats:
        breakdown[s['_id']] = s['count']
        sum_ratings += s['_id'] * s['count']
        
    avg_rating = round(sum_ratings / total_reviews, 1) if total_reviews > 0 else 0
    
    # Format reviews for frontend
    formatted_reviews = []
    for r in reviews:
        formatted_reviews.append({
            "id": str(r['_id']),
            "userId": str(r.get('userId')),
            "userName": r.get('userName', 'Anonymous'),
            "userAvatar": r.get('userAvatar'),
            "rating": r.get('rating'),
            "message": r.get('message'),
            "likes": [str(l) for l in r.get('likes', [])],
            "comments": r.get('comments', []),
            "createdAt": r['createdAt'].isoformat() if r.get('createdAt') else None
        })
        
    return jsonify({
        "summary": {
            "total": total_reviews,
            "average": avg_rating,
            "breakdown": breakdown
        },
        "reviews": formatted_reviews
    })

@reviews_bp.route('/<rid>/like', methods=['POST'])
@require_auth
def toggle_like(rid):
    uid = get_jwt_identity()
    col = get_collection('reviews')
    rev = col.find_one({"_id": ObjectId(rid)})
    if not rev: return jsonify({"error": "Not found"}), 404
    
    likes = rev.get('likes', [])
    if ObjectId(uid) in likes:
        col.update_one({"_id": ObjectId(rid)}, {"$pull": {"likes": ObjectId(uid)}})
        liked = False
    else:
        col.update_one({"_id": ObjectId(rid)}, {"$addToSet": {"likes": ObjectId(uid)}})
        liked = True
    
    return jsonify({"liked": liked, "count": col.find_one({"_id": ObjectId(rid)}).get('likes', [])})

@reviews_bp.route('/<rid>/comment', methods=['POST'])
@require_auth
def add_comment(rid):
    uid = get_jwt_identity()
    data = request.get_json() or {}
    msg = data.get('message', '').strip()
    if not msg: return jsonify({"error": "Comment is required"}), 400
    
    user = get_collection('users').find_one({"_id": ObjectId(uid)})
    comment = {
        "id": str(ObjectId()),
        "userId": str(uid),
        "userName": user.get('name', 'Anonymous'),
        "userAvatar": user.get('avatar'),
        "message": msg,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    col = get_collection('reviews')
    col.update_one({"_id": ObjectId(rid)}, {"$push": {"comments": comment}})
    
    # Notify review author
    rev = col.find_one({"_id": ObjectId(rid)})
    if str(rev['userId']) != str(uid):
        get_collection('notifications').insert_one({
            "userId": str(rev['userId']),
            "type": "info",
            "title": "New Comment",
            "message": f"{user.get('name')} commented on your review.",
            "read": False,
            "createdAt": datetime.utcnow()
        })
    
    return jsonify({"comment": comment})

@reviews_bp.route('/<rid>/message', methods=['POST'])
@require_auth
def send_direct_notif(rid):
    uid = get_jwt_identity()
    data = request.get_json() or {}
    text = data.get('message', '').strip()
    if not text: return jsonify({"error": "Message content is required"}), 400
    
    rev = get_collection('reviews').find_one({"_id": ObjectId(rid)})
    sender = get_collection('users').find_one({"_id": ObjectId(uid)})
    
    if rev and str(rev['userId']) != str(uid):
        get_collection('notifications').insert_one({
            "userId": str(rev['userId']),
            "type": "admin",
            "title": f"Message from {sender.get('name')}",
            "message": text,
            "read": False,
            "createdAt": datetime.utcnow()
        })
        return jsonify({"message": "Message sent to reviewer"})
        
    return jsonify({"error": "Could not send message"}), 400

@reviews_bp.route('/admin', methods=['GET'])
@require_admin
def admin_list_reviews():
    col = get_collection('reviews')
    reviews = list(col.find().sort("createdAt", -1))
    
    formatted = []
    for r in reviews:
        # Get user details for admin
        user = get_collection('users').find_one({"_id": r['userId']}, {"email": 1})
        formatted.append({
            "id": str(r['_id']),
            "userId": str(r['userId']),
            "userEmail": user.get('email') if user else 'Unknown',
            "userName": r.get('userName'),
            "rating": r.get('rating'),
            "message": r.get('message'),
            "likes": len(r.get('likes', [])),
            "comments": len(r.get('comments', [])),
            "createdAt": r['createdAt'].isoformat() if r.get('createdAt') else None
        })
        
    return jsonify(formatted)

@reviews_bp.route('/<rid>', methods=['DELETE'])
@require_admin
def delete_review(rid):
    get_collection('reviews').delete_one({"_id": ObjectId(rid)})
    return jsonify({"message": "Review deleted successfully"})

