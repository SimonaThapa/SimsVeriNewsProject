"""routes/users.py — User profile, leaderboard, admin user management."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from db import get_collection
from middleware.auth import require_auth, require_admin

users_bp = Blueprint('users', __name__)


@users_bp.route('/profile', methods=['GET'])
@require_auth
def profile():
    uid  = get_jwt_identity()
    user = get_collection('users').find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    # Legacy compatibility
    name = user.get('name', '')
    first_name = user.get('firstName')
    last_name = user.get('lastName')
    
    if first_name is None and last_name is None:
        parts = name.split(' ', 1)
        first_name = parts[0] if parts else ''
        last_name = parts[1] if len(parts) > 1 else ''

    return jsonify({
        "id":             str(user['_id']),
        "name":           name,
        "firstName":      first_name,
        "lastName":       last_name,
        "email":          user.get('email'),
        "avatar":         user.get('avatar'),
        "phone":          user.get('phone', ''),
        "country":        user.get('country', ''),
        "city":           user.get('city', ''),
        "address":        user.get('address', ''),
        "zipCode":        user.get('zipCode', ''),
        "role":           user.get('role', 'user'),
        "points":         user.get('points', 0),
        "badges":         user.get('badges', []),
        "streak":         user.get('streak', 0),
        "totalClaims":    user.get('totalClaims', 0),
        "correctGuesses": user.get('correctGuesses', 0),
    })

@users_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    import bcrypt
    uid = get_jwt_identity()
    users = get_collection('users')
    user = users.find_one({"_id": ObjectId(uid)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    d = request.get_json()
    first_name = d.get('firstName', '').strip()
    last_name = d.get('lastName', '').strip()
    email = d.get('email', '').strip().lower()
    pw = d.get('password', '')
    avatar = d.get('avatar', d.get('userPicture', ''))
    
    phone = d.get('phone', '').strip()
    country = d.get('country', '').strip()
    city = d.get('city', '').strip()
    address = d.get('address', '').strip()
    zip_code = d.get('zipCode', '').strip()

    update_fields = {}
    
    if first_name or last_name:
        update_fields["firstName"] = first_name
        update_fields["lastName"] = last_name
        update_fields["name"] = f"{first_name} {last_name}".strip()
        
    if email and email != user.get('email'):
        if users.find_one({"email": email}):
            return jsonify({"error": "Email already in use"}), 409
        update_fields["email"] = email

    if pw:
        hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
        update_fields["password"] = hashed
        
    if avatar is not None:
        update_fields["avatar"] = avatar
        
    if phone: update_fields["phone"] = phone
    if country: update_fields["country"] = country
    if city: update_fields["city"] = city
    if address: update_fields["address"] = address
    if zip_code: update_fields["zipCode"] = zip_code

    if update_fields:
        users.update_one({"_id": ObjectId(uid)}, {"$set": update_fields})

    return jsonify({"message": "Profile updated successfully"})


@users_bp.route('/leaderboard', methods=['GET'])
@require_auth
def leaderboard():
    top = list(
        get_collection('users')
        .find({"role": "user"}, {"password": 0})
        .sort("points", -1)
        .limit(20)
    )
    return jsonify([{
        "rank":        i + 1,
        "name":        u.get('name'),
        "points":      u.get('points', 0),
        "badges":      u.get('badges', []),
        "totalClaims": u.get('totalClaims', 0),
    } for i, u in enumerate(top)])


# ── Admin endpoints ───────────────────────────────────────────────────────────

@users_bp.route('/admin/users', methods=['GET'])
@require_admin
def admin_list():
    users = list(get_collection('users').find({}, {"password": 0}))
    return jsonify([{
        "id":          str(u['_id']),
        "name":        u.get('name'),
        "email":       u.get('email'),
        "role":        u.get('role', 'user'),
        "points":      u.get('points', 0),
        "totalClaims": u.get('totalClaims', 0),
        "badges":      u.get('badges', []),
    } for u in users])


@users_bp.route('/admin/users/<uid>', methods=['DELETE'])
@require_admin
def admin_delete(uid):
    get_collection('users').delete_one({"_id": ObjectId(uid)})
    return jsonify({"message": "User deleted"})
