"""
app.py — SimsVeriNews Flask Backend
===================================
Run:  python app.py
API:  http://localhost:5000/api
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ── CORS — allow React dev server ─────────────────────────────────────────────
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ── JWT ───────────────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-this-secret-in-production")
jwt = JWTManager(app)

# ── Register blueprints ───────────────────────────────────────────────────────
from routes.auth          import auth_bp
from routes.detection     import detection_bp
from routes.users         import users_bp
from routes.notifications import notif_bp
from routes.extra         import quiz_bp, trends_bp, edu_bp, chatbot_bp
from routes.admin         import admin_bp
from routes.contact       import contact_bp

app.register_blueprint(auth_bp,       url_prefix='/api/auth')
app.register_blueprint(detection_bp,  url_prefix='/api/detect')
app.register_blueprint(users_bp,      url_prefix='/api/users')
app.register_blueprint(notif_bp,      url_prefix='/api/notifications')
app.register_blueprint(quiz_bp,       url_prefix='/api/quiz')
app.register_blueprint(trends_bp,     url_prefix='/api/trends')
app.register_blueprint(edu_bp,        url_prefix='/api/educational')
app.register_blueprint(chatbot_bp,    url_prefix='/api/chatbot')
app.register_blueprint(admin_bp,      url_prefix='/api/admin')
app.register_blueprint(contact_bp,    url_prefix='/api/contact')

# ── Health check ──────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return "<h1>SimsVeriNews Backend is Running!</h1><p>API is available at <code>/api</code>.</p>"

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "message": "SimsVeriNews API is running ✓"})

# ── JWT error handlers ────────────────────────────────────────────────────────
@jwt.unauthorized_loader
def unauthorized(reason):
    return jsonify({"error": "Unauthorized", "message": reason}), 401

@jwt.expired_token_loader
def expired(header, payload):
    return jsonify({"error": "Token expired. Please log in again."}), 401

@jwt.invalid_token_loader
def invalid(reason):
    return jsonify({"error": "Invalid token", "message": reason}), 422

# ── Seed default admin account ────────────────────────────────────────────────
def seed_admin():
    """Create a default admin account if none exists in the database."""
    try:
        from db import get_collection
        import bcrypt
        from datetime import datetime
        users = get_collection('users')
        if not users.find_one({"role": "admin"}):
            hashed = bcrypt.hashpw(b"admin@123", bcrypt.gensalt()).decode()
            users.insert_one({
                "name":      "Admin",
                "email":     "admin@gmail.com",
                "password":  hashed,
                "role":      "admin",
                "points":    0,
                "badges":    [],
                "createdAt": datetime.utcnow(),
            })
            print("=" * 55)
            print("  [SEED] Default admin account created:")
            print("  Email:    admin@gmail.com")
            print("  Password: admin@123")
            
            print("=" * 55)
    except Exception as e:
        print(f"[SEED] Warning: could not seed admin — {e}")
        print("       (This is normal if MONGO_URI is not yet configured)")

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    seed_admin()
    port  = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    print(f"\n[APP] SimsVeriNews backend starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
