from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_jwt
from datetime import timedelta, datetime
import bcrypt
from bson import ObjectId
from db import get_collection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    d = request.get_json()
    name = d.get('name','').strip()
    email = d.get('email','').strip().lower()
    pw = d.get('password','')
    if not name or not email or not pw:
        return jsonify({"error": "All fields required"}), 400
    users = get_collection('users')
    if users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409
    hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
    doc = {"name": name, "email": email, "password": hashed, "role": "user",
           "points": 0, "badges": [], "streak": 0, "totalClaims": 0,
           "correctGuesses": 0, "createdAt": datetime.utcnow()}
    res = users.insert_one(doc)
    token = create_access_token(str(res.inserted_id),
        additional_claims={"role":"user","name":name,"email":email},
        expires_delta=timedelta(days=7))
    return jsonify({"token": token, "user": {"id": str(res.inserted_id), "name": name, "email": email, "role": "user"}}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    d = request.get_json()
    email = d.get('email','').strip().lower()
    pw    = d.get('password','')
    users = get_collection('users')
    user  = users.find_one({"email": email})
    if not user or not bcrypt.checkpw(pw.encode(), user['password'].encode()):
        return jsonify({"error": "Invalid email or password"}), 401
    token = create_access_token(str(user['_id']),
        additional_claims={"role": user.get('role','user'), "name": user.get('name',''), "email": email},
        expires_delta=timedelta(days=7))
    return jsonify({"token": token, "user": {
        "id": str(user['_id']), "name": user.get('name'), "email": email,
        "role": user.get('role','user'), "points": user.get('points',0), "badges": user.get('badges',[])
    }}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    uid  = get_jwt_identity()
    user = get_collection('users').find_one({"_id": ObjectId(uid)})
    if not user: return jsonify({"error": "Not found"}), 404
    return jsonify({"id": str(user['_id']), "name": user.get('name'), "email": user.get('email'),
                    "role": user.get('role','user'), "points": user.get('points',0),
                    "badges": user.get('badges',[]), "streak": user.get('streak',0),
                    "totalClaims": user.get('totalClaims',0), "correctGuesses": user.get('correctGuesses',0)})

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    d = request.get_json()
    email = d.get('email', '').strip().lower()
    new_pw = d.get('new_password', '')

    if not email or not new_pw:
        return jsonify({"error": "Email and new password are required"}), 400

    users = get_collection('users')
    user = users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User with this email not found"}), 404

    hashed = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode()
    users.update_one({"_id": user['_id']}, {"$set": {"password": hashed}})

    return jsonify({"message": "Password updated successfully"}), 200
