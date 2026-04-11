"""routes/detection.py — Fake news detection endpoint + gamification logic."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from datetime import datetime
from db import get_collection
from middleware.auth import require_auth
from ml.predictor import predict as ml_predict

detection_bp = Blueprint('detection', __name__)

# ── Trusted source templates keyed by classification ─────────────────────────
SOURCES = {
    "Real": [
        {
            "source": "Reuters",
            "url": "https://www.reuters.com",
            "title": "Reuters — International News Agency",
            "summary": (
                "Reuters is one of the world's largest and most trusted international "
                "news agencies. It maintains strict editorial standards requiring "
                "multiple source verification before publication. Claims consistent "
                "with real news typically align with Reuters' impartial reporting "
                "style, which avoids sensational language and relies on named, "
                "verifiable sources."
            ),
            "icon": "📰",
        },
        {
            "source": "BBC News",
            "url": "https://www.bbc.com/news",
            "title": "BBC News — Editorial Standards & Fact-Checking",
            "summary": (
                "The BBC operates under a Royal Charter requiring impartiality, "
                "accuracy, and editorial independence. Its Reality Check unit "
                "actively investigates viral claims. Content classified as real by "
                "our AI model exhibits the structured, source-cited, balanced "
                "presentation characteristic of BBC journalism."
            ),
            "icon": "🔵",
        },
        {
            "source": "Associated Press (AP)",
            "url": "https://apnews.com",
            "title": "AP News — Independent Fact-Checking",
            "summary": (
                "The Associated Press is a not-for-profit news cooperative trusted "
                "by thousands of newsrooms worldwide. Its AP Fact Check team "
                "verifies claims in real time. Real news articles share the same "
                "measured, factual tone and citation practices upheld by the AP "
                "across 250+ bureaus globally."
            ),
            "icon": "📡",
        },
    ],
    "Fake": [
        {
            "source": "PolitiFact",
            "url": "https://www.politifact.com",
            "title": "PolitiFact — Fact-Checking Political Claims",
            "summary": (
                "PolitiFact is a Pulitzer Prize-winning fact-checking organisation "
                "that rates claims on a Truth-O-Meter from True to Pants on Fire. "
                "Content flagged as fake by our AI frequently shares linguistic "
                "patterns — sensational headlines, lack of citations, emotional "
                "framing — with claims rated False or Pants on Fire by PolitiFact."
            ),
            "icon": "🔍",
        },
        {
            "source": "Snopes",
            "url": "https://www.snopes.com",
            "title": "Snopes — Myth & Misinformation Debunking",
            "summary": (
                "Snopes has been debunking viral misinformation since 1994, making "
                "it one of the longest-running fact-checking resources on the "
                "internet. Claims detected as fake by our model often share "
                "structural and linguistic characteristics with content previously "
                "investigated and debunked by Snopes researchers."
            ),
            "icon": "🛡️",
        },
        {
            "source": "FactCheck.org",
            "url": "https://www.factcheck.org",
            "title": "FactCheck.org — Non-Partisan Fact Analysis",
            "summary": (
                "FactCheck.org is a project of the Annenberg Public Policy Center "
                "at the University of Pennsylvania. As a non-partisan, nonprofit "
                "organisation, it monitors the accuracy of claims made by public "
                "figures. Fake news often mimics the style of legitimate reporting "
                "while omitting the source verification FactCheck.org requires."
            ),
            "icon": "✅",
        },
    ],
    "Uncertain": [
        {
            "source": "AllSides",
            "url": "https://www.allsides.com",
            "title": "AllSides — Multi-Perspective News Coverage",
            "summary": (
                "AllSides exposes people to information and ideas from all sides of "
                "the political spectrum, helping readers understand how different "
                "outlets cover the same story. For uncertain claims, checking "
                "coverage across Left, Center, and Right sources on AllSides "
                "provides the broadest context for verification."
            ),
            "icon": "⚖️",
        },
        {
            "source": "Media Bias/Fact Check",
            "url": "https://mediabiasfactcheck.com",
            "title": "Media Bias/Fact Check — Source Reliability Ratings",
            "summary": (
                "Media Bias/Fact Check rates news sources for factual accuracy and "
                "political bias. When a claim is uncertain, identifying the "
                "reliability and bias of the original source is a critical first "
                "step. This resource rates over 4,000 news outlets with detailed "
                "methodology and documentation."
            ),
            "icon": "📊",
        },
        {
            "source": "Reuters Fact Check",
            "url": "https://www.reuters.com/fact-check",
            "title": "Reuters Fact Check — Dedicated Verification Team",
            "summary": (
                "Reuters Fact Check is a dedicated unit that investigates viral "
                "claims circulating on social media and news platforms. For "
                "uncertain claims, this is an excellent starting point for "
                "independent verification using Reuters' global network of "
                "journalists and primary source access."
            ),
            "icon": "🌐",
        },
    ],
}

def _award_badges(user, users_col):
    """Check conditions and award new badges. Returns list of newly earned badges."""
    points   = user.get('points', 0)
    total    = user.get('totalClaims', 0)
    streak   = user.get('streak', 0)
    existing = set(user.get('badges', []))
    new = []
    for badge, cond in [
        ("First Check",     total >= 1),
        ("Fact Finder",     total >= 10),
        ("Truth Seeker",    total >= 25),
        ("News Detective",  total >= 50),
        ("Point Collector", points >= 50),
        ("Century Club",    points >= 100),
        ("Streak Master",   streak >= 5),
    ]:
        if cond and badge not in existing:
            new.append(badge)
    if new:
        users_col.update_one({"_id": user['_id']},
                             {"$set": {"badges": list(existing) + new}})
    return new


@detection_bp.route('/analyze', methods=['POST'])
@require_auth
def analyze():
    """Main endpoint: receive claim + user guess → run ML → return full result."""
    data       = request.get_json() or {}
    claim_text = data.get('claim', '').strip()
    user_guess = data.get('userGuess', '').strip()   # "Real" or "Fake"

    if not claim_text:
        return jsonify({"error": "Claim text is required"}), 400
    if user_guess not in ('Real', 'Fake'):
        return jsonify({"error": "userGuess must be 'Real' or 'Fake'"}), 400

    # ── Run ML model ──────────────────────────────────────────────────────
    try:
        result = ml_predict(claim_text)
    except FileNotFoundError as e:
        return jsonify({"error": str(e),
                        "hint": "Train the model first: cd backend && python ml/train_model.py"}), 503
    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

    classification = result['classification']   # "Real" | "Fake" | "Uncertain"

    # ── Gamification ─────────────────────────────────────────────────────
    is_correct    = (user_guess == classification) and (classification != "Uncertain")
    points_earned = 10 if is_correct else 0

    uid   = get_jwt_identity()
    users = get_collection('users')
    user  = users.find_one({"_id": ObjectId(uid)})

    total_points = points_earned
    new_badges   = []

    if user:
        new_pts     = user.get('points', 0) + points_earned
        new_streak  = (user.get('streak', 0) + 1) if is_correct else 0
        new_total   = user.get('totalClaims', 0) + 1
        new_correct = user.get('correctGuesses', 0) + (1 if is_correct else 0)

        users.update_one({"_id": ObjectId(uid)}, {"$set": {
            "points":        new_pts,
            "streak":        new_streak,
            "totalClaims":   new_total,
            "correctGuesses": new_correct,
        }})
        updated    = users.find_one({"_id": ObjectId(uid)})
        new_badges = _award_badges(updated, users)
        total_points = new_pts

    # ── Save claim ────────────────────────────────────────────────────────
    claims = get_collection('claims')
    claim_doc = {
        "userId":           uid,
        "claimText":        claim_text,
        "userGuess":        user_guess,
        "actualResult":     classification,
        "isCorrect":        is_correct,
        "pointsEarned":     points_earned,
        "confidence":       result['confidence'],
        "realProbability":  result['real_probability'],
        "fakeProbability":  result['fake_probability'],
        "explanation":      result['explanation'],
        "createdAt":        datetime.utcnow(),
    }
    inserted = claims.insert_one(claim_doc)

    # ── Result & Badge notifications ───────────────────────────────────────────────
    notifs_to_send = []
    
    # 1. Result notification
    preview = (claim_text[:40] + '...') if len(claim_text) > 40 else claim_text
    if is_correct:
        notifs_to_send.append({
            "userId": uid, "type": "success",
            "title": "✅ Accurate Prediction!",
            "message": f"Great job! Your guess for '{preview}' matched the TruthGuard AI analysis.",
            "read": False, "createdAt": datetime.utcnow()
        })
    else:
        notifs_to_send.append({
            "userId": uid, "type": "warning",
            "title": "🚨 Analysis Correction",
            "message": f"Your guess was incorrect. The AI actually flagged '{preview}' as {classification}.",
            "read": False, "createdAt": datetime.utcnow()
        })

    # 2. Badge notifications
    if new_badges:
        for b in new_badges:
            notifs_to_send.append({
                "userId": uid, "type": "badge",
                "title":   f"🏆 New Badge: {b}",
                "message": f"Congratulations! You earned the '{b}' badge.",
                "read":    False, "createdAt": datetime.utcnow(),
            })

    if notifs_to_send:
        get_collection('notifications').insert_many(notifs_to_send)

    return jsonify({
        "claimId":         str(inserted.inserted_id),
        "classification":  classification,
        "confidence":      result['confidence_pct'],
        "fakeProbability": result['fake_probability'],
        "realProbability": result['real_probability'],
        "explanation":     result['explanation'],
        "modelAccuracy":   result.get('model_accuracy'),
        "userGuess":       user_guess,
        "isCorrect":       is_correct,
        "pointsEarned":    points_earned,
        "totalPoints":     total_points,
        "newBadges":       new_badges,
        "sources":         SOURCES.get(classification, SOURCES["Uncertain"]),
    }), 200


@detection_bp.route('/history', methods=['GET'])
@require_auth
def history():
    uid   = get_jwt_identity()
    page  = max(1, int(request.args.get('page', 1)))
    limit = min(50, int(request.args.get('limit', 10)))
    skip  = (page - 1) * limit
    claims = get_collection('claims')
    total  = claims.count_documents({"userId": uid})
    docs   = claims.find({"userId": uid}).sort("createdAt", -1).skip(skip).limit(limit)
    return jsonify({
        "claims": [{
            "id":           str(c['_id']),
            "claimText":    c.get('claimText', ''),
            "userGuess":    c.get('userGuess'),
            "actualResult": c.get('actualResult'),
            "isCorrect":    c.get('isCorrect'),
            "pointsEarned": c.get('pointsEarned', 0),
            "confidence":   c.get('confidence'),
            "createdAt":    c['createdAt'].isoformat() if c.get('createdAt') else '',
        } for c in docs],
        "total": total, "page": page, "limit": limit,
    }), 200
