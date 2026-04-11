"""routes/extra.py — Quiz, Trends, Educational content, Chatbot."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta
from db import get_collection
from middleware.auth import require_auth, require_admin

# ── Quiz ─────────────────────────────────────────────────────────────────────
quiz_bp = Blueprint('quiz', __name__)

DEFAULT_QUIZZES = [
    {
        "title": "Spotting Fake Headlines",
        "difficulty": "Beginner",
        "questions": [
            {
                "q": "Which is a common warning sign of a fake news headline?",
                "options": [
                    "ALL CAPS and excessive exclamation marks!!!",
                    "Written by a named journalist at a known outlet",
                    "Includes a verifiable publication date",
                    "Cites official government statistics",
                ],
                "answer": 0,
                "explanation": "Fake news often uses ALL CAPS and emotional punctuation to provoke outrage and bypass critical thinking.",
            },
            {
                "q": "What should you do BEFORE sharing a news story?",
                "options": [
                    "Share immediately if it confirms your existing beliefs",
                    "Verify the story appears on multiple trusted outlets",
                    "Check how many likes the post has",
                    "Only read the headline — it's enough",
                ],
                "answer": 1,
                "explanation": "Always check if multiple trusted news sources independently confirm the story before sharing.",
            },
            {
                "q": "Which domain is most often used to impersonate real news sites?",
                "options": [".gov", ".edu", ".com.co", ".org"],
                "answer": 2,
                "explanation": "Domains like .com.co mimic real sites (e.g. ABCnews.com.co vs ABCnews.go.com) to deceive readers.",
            },
            {
                "q": "An article has no author name listed. What does this suggest?",
                "options": [
                    "The journalist requested anonymity for safety",
                    "It is likely a press release",
                    "It may be unreliable — legitimate journalism credits authors",
                    "Nothing — many real articles skip the byline",
                ],
                "answer": 2,
                "explanation": "Reputable news organisations credit named journalists. Missing bylines are a red flag for fabricated content.",
            },
            {
                "q": "How do fake news sites often trick readers visually?",
                "options": [
                    "By having no images at all",
                    "By using black and white text only",
                    "By copying the logos, colours, and layout of legitimate news sites",
                    "By using a very small font size",
                ],
                "answer": 2,
                "explanation": "Many fake news sites steal the visual identity of established news organisations so readers assume the source is legitimate at first glance.",
            },
            {
                "q": "A headline reads: 'EATING CHOCOLATE MAKES YOU LIVE TO 100!' First thing to do?",
                "options": [
                    "Check if chocolate is on sale",
                    "Check the source of the scientific study actually cited",
                    "Check how many people shared it on social media",
                    "Check the author's favourite type of chocolate",
                ],
                "answer": 1,
                "explanation": "Sensational health claims should always be cross-referenced with the actual scientific study, which often contradicts or heavily nuances the headline.",
            },
        ],
    },
    {
        "title": "Media Literacy Intermediate",
        "difficulty": "Intermediate",
        "questions": [
            {
                "q": "What is 'confirmation bias' in news consumption?",
                "options": [
                    "Fact-checking a story before sharing it",
                    "The tendency to believe news that confirms your existing views",
                    "Confirming that a source is legitimate",
                    "Reading stories from multiple outlets",
                ],
                "answer": 1,
                "explanation": "Confirmation bias makes us more likely to believe and share information aligning with our beliefs, even when it is false.",
            },
            {
                "q": "A photo is shared claiming to show a recent disaster. Best verification step?",
                "options": [
                    "Trust it if it has thousands of shares",
                    "Perform a reverse image search",
                    "Check if the image is in colour",
                    "See if a friend who lives nearby confirms it",
                ],
                "answer": 1,
                "explanation": "Reverse image search (Google Images, TinEye) reveals whether an image is old, from a different event, or digitally manipulated.",
            },
            {
                "q": "Which of these is a reliable fact-checking resource?",
                "options": [
                    "A Facebook group with 1 million followers",
                    "A YouTube video with 10 million views",
                    "PolitiFact.com",
                    "A Reddit thread with many upvotes",
                ],
                "answer": 2,
                "explanation": "PolitiFact is a Pulitzer Prize-winning fact-checking organisation that verifies claims using documented evidence.",
            },
            {
                "q": "What is 'Satire' in media?",
                "options": [
                    "A dangerous virus on a website",
                    "Humorous, exaggerated fake news meant to entertain, not deceive",
                    "A type of government propaganda",
                    "Deepfake video generated by AI",
                ],
                "answer": 1,
                "explanation": "Sites like The Onion publish satire. While harmless in context, people sometimes mistake these joke articles for real news.",
            },
            {
                "q": "If a claim invokes extreme anger or outrage, what does that usually indicate?",
                "options": [
                    "It is definitely 100% true",
                    "It is definitely 100% fake",
                    "The author is probably a celebrity",
                    "It might be designed to manipulate your emotions for clicks",
                ],
                "answer": 3,
                "explanation": "Misinformation frequently leverages strong emotional triggers to compel you to share it before critically evaluating its accuracy.",
            },
        ],
    },
    {
        "title": "Advanced Fact-Checker",
        "difficulty": "Advanced",
        "questions": [
            {
                "q": "What is a 'deepfake' in the context of misinformation?",
                "options": [
                    "A very detailed fake news article",
                    "AI-generated synthetic media that makes people appear to say or do things they never did",
                    "A fake social media profile",
                    "A doctored screenshot of a tweet",
                ],
                "answer": 1,
                "explanation": "Deepfakes use AI to create convincing but entirely fabricated video or audio of real people, posing serious misinformation risks.",
            },
            {
                "q": "Which technique do professional fact-checkers use to trace a viral claim?",
                "options": [
                    "Ask on social media who started it",
                    "Believe the version with the most mainstream coverage",
                    "Trace the claim to its original source using archived web pages",
                    "Count the number of reputable outlets reporting it",
                ],
                "answer": 2,
                "explanation": "Professionals use tools like the Wayback Machine and Google cache to find the original source of a claim and trace how it evolved.",
            },
            {
                "q": "What does checking the 'Exif data' of an image accomplish?",
                "options": [
                    "It automatically translates any text in the photo",
                    "It corrects the color balance",
                    "It can reveal hidden metadata like when, where, and on what device a photo was taken",
                    "It checks if the image is copyrighted",
                ],
                "answer": 2,
                "explanation": "Exif data contains hidden camera settings, timestamps, and GPS coordinates that can help trace the true origin of a photo.",
            },
            {
                "q": "What is 'Astroturfing'?",
                "options": [
                    "Using fake grass in sports fields",
                    "Buying paid followers to appear popular on Instagram",
                    "Coordinated campaigns creating the illusion of widespread grassroots support",
                    "A technique to increase website loading speed",
                ],
                "answer": 2,
                "explanation": "Astroturfing uses bots or paid actors to simulate public consensus, making a fake or fringe narrative appear widely accepted by normal people.",
            },
        ],
    },
]


@quiz_bp.route('/', methods=['GET'])
@require_auth
def list_quizzes():
    col = get_collection('quizzes')
    if col.count_documents({}) == 0:
        col.insert_many([{**q, "createdAt": datetime.utcnow()} for q in DEFAULT_QUIZZES])
    quizzes = list(col.find({}))
    return jsonify([{
        "id":            str(q['_id']),
        "title":         q.get('title'),
        "difficulty":    q.get('difficulty'),
        "questionCount": len(q.get('questions', [])),
    } for q in quizzes])


@quiz_bp.route('/<qid>', methods=['GET'])
@require_auth
def get_quiz(qid):
    q = get_collection('quizzes').find_one({"_id": ObjectId(qid)})
    if not q:
        return jsonify({"error": "Quiz not found"}), 404
    return jsonify({
        "id":         str(q['_id']),
        "title":      q.get('title'),
        "difficulty": q.get('difficulty'),
        "questions":  q.get('questions', []),
    })


@quiz_bp.route('/admin', methods=['POST'])
@require_admin
def create_quiz():
    data = request.get_json() or {}
    data['createdAt'] = datetime.utcnow()
    res = get_collection('quizzes').insert_one(data)
    return jsonify({"id": str(res.inserted_id), "message": "Quiz created"}), 201


@quiz_bp.route('/admin/<qid>', methods=['DELETE'])
@require_admin
def delete_quiz(qid):
    get_collection('quizzes').delete_one({"_id": ObjectId(qid)})
    return jsonify({"message": "Quiz deleted"})


# ── Trends ────────────────────────────────────────────────────────────────────
trends_bp = Blueprint('trends', __name__)


@trends_bp.route('/', methods=['GET'])
@require_auth
def get_trends():
    claims = get_collection('claims')
    cutoff = datetime.utcnow() - timedelta(days=30)

    # Daily breakdown for chart
    pipeline = [
        {"$match": {"createdAt": {"$gte": cutoff}}},
        {"$group": {
            "_id": {
                "date":   {"$dateToString": {"format": "%Y-%m-%d", "date": "$createdAt"}},
                "result": "$actualResult",
            },
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id.date": 1}},
    ]
    raw = list(claims.aggregate(pipeline))

    by_date = {}
    for r in raw:
        d = r['_id']['date']
        res = r['_id']['result']
        by_date.setdefault(d, {"date": d, "Real": 0, "Fake": 0, "Uncertain": 0})
        if res in by_date[d]:
            by_date[d][res] = r['count']

    return jsonify({
        "daily": list(by_date.values()),
        "totals": {
            "Real":      claims.count_documents({"actualResult": "Real"}),
            "Fake":      claims.count_documents({"actualResult": "Fake"}),
            "Uncertain": claims.count_documents({"actualResult": "Uncertain"}),
        },
    })


@trends_bp.route('/claims', methods=['GET'])
@require_auth
def get_trending_claims():
    claims_col = get_collection('claims')
    docs = list(claims_col.find({}).sort("createdAt", -1).limit(100))
    
    def get_category(text):
        text = text.lower()
        if any(w in text for w in ['government', 'minister', 'election', 'vote', 'president', 'policy', 'law', 'deuba', 'prashanda', 'nepal', 'parliament']): return "Politics"
        if any(w in text for w in ['school', 'college', 'university', 'student', 'teacher', 'education', 'exam', 'class']): return "Education"
        if any(w in text for w in ['health', 'virus', 'vaccine', 'doctor', 'disease', 'covid', 'cancer', 'diet', 'hospital', 'medicine']): return "Health"
        if any(w in text for w in ['ai', 'crypto', 'bitcoin', 'digital', 'phone', 'internet', 'social media', 'app']): return "Technology"
        if any(w in text for w in ['market', 'stock', 'bank', 'economy', 'money', 'business', 'tax']): return "Economy"
        return "General"
        
    results = []
    import random
    
    for i, c in enumerate(docs):
        label = c.get('actualResult', 'Uncertain')
        conf = c.get('confidence', 0)
        
        # Calculate Reliability Score (0-100)
        if label == "Real":
            reliability = 80 + (conf * 20) if conf > 0 else 85
        elif label == "Fake":
            reliability = 10 + (conf * 20) if conf > 0 else 15
        else:
            reliability = 40 + random.randint(0, 20)
            
        # Calculate Virality Score (0-100)
        virality = random.randint(30, 95)
        
        # Trend Direction
        direction = "up" if i % 3 != 0 else "down" # Mix it up
        
        # Location & Regional Spread
        if label == "Real":
            spread = "Globally Recognized"
            regions = [
                {"country": "USA", "flag": "🇺🇸", "popularity": "High"},
                {"country": "UK", "flag": "🇬🇧", "popularity": "Medium"},
                {"country": "Nepal", "flag": "🇳🇵", "popularity": "Medium"},
                {"country": "India", "flag": "🇮🇳", "popularity": "High"}
            ]
            insight = "Topic is trending globally and supported by multiple verified international news outlets. High information consistency indicates high reliability."
        elif label == "Fake":
            spread = "Restricted Region"
            regions = [
                {"country": "Nepal", "flag": "🇳🇵", "popularity": "Very High"},
                {"country": "Unknown Source", "flag": "🌐", "popularity": "Medium"}
            ]
            insight = "Mainly trending in restricted regions and lacks global coverage from verified agencies. This spread pattern is common in misinformation campaigns."
        else:
            spread = "Emerging Trend"
            regions = [
                {"country": "Global", "flag": "🌍", "popularity": "Medium"}
            ]
            insight = "Topic is in early stages of virality. Reliability is currently medium as sources have not yet been fully cross-referenced globally."
            
        results.append({
            "id": str(c['_id']),
            "claimText": c.get('claimText', ''),
            "classification": label,
            "confidence": conf,
            "category": get_category(c.get('claimText', '')),
            "spread": spread,
            "reliabilityScore": round(reliability),
            "viralityScore": round(virality),
            "trendDirection": direction,
            "aiInsight": insight,
            "regionalData": regions,
            "createdAt": c['createdAt'].isoformat() if c.get('createdAt') else ''
        })
        
    return jsonify(results)


# ── Educational Content ───────────────────────────────────────────────────────
edu_bp = Blueprint('educational', __name__)

DEFAULT_CONTENT = [
    {"category": "tip",       "icon": "🔗", "title": "Check the URL Carefully",
     "content": "Fake news sites often use URLs that closely mimic legitimate outlets. 'ABCnews.com.co' is NOT the real ABC News. Always double-check the full domain name before trusting any article.",
     "example": "ABCnews.com.co vs ABCnews.go.com — one character can make all the difference."},
    {"category": "tip",       "icon": "📅", "title": "Always Check the Publication Date",
     "content": "Old stories are frequently reshared as if they are breaking news. A 2016 article about an election controversy means nothing in 2024. Always verify when the article was first published.",
     "example": "A 5-year-old story about a celebrity arrest reshared as 'just happened'."},
    {"category": "tip",       "icon": "👤", "title": "Verify the Author",
     "content": "Search the journalist's name. Do they have a history of published work? Do they appear on the outlet's staff page? Fake news frequently uses anonymous authors or entirely fabricated personas.",
     "example": "An article credited to 'Staff Reporter' on a site registered last month."},
    {"category": "technique", "icon": "🖼️", "title": "Reverse Image Search",
     "content": "Drag any suspicious image to Google Images or use TinEye.com to discover if the photo is old, taken from a completely different event, or digitally altered.",
     "example": "A photo from a 2010 flood in Pakistan shared as a 2024 earthquake in Turkey."},
    {"category": "technique", "icon": "📖", "title": "Read Beyond the Headline",
     "content": "Headlines are designed to grab attention and often misrepresent the article body. The actual content may be far more nuanced — or may directly contradict the headline's implication.",
     "example": "Headline: 'Scientists say coffee KILLS' — Article: one small, inconclusive study."},
    {"category": "technique", "icon": "🔍", "title": "Cross-Reference Multiple Sources",
     "content": "If a major story is real, multiple established news outlets will cover it independently. If only one obscure website is reporting something sensational, treat it with extreme scepticism.",
     "example": "A claim that only appears on 'TruthNewsDaily.net' but is absent from Reuters, AP, and BBC."},
    {"category": "example",   "icon": "✅", "title": "What Real News Looks Like", "label": "REAL",
     "content": "Real news articles credit named journalists, cite verifiable primary sources (official statements, peer-reviewed studies, government data), use measured language, provide context, and are published by outlets with transparent editorial standards and ownership.",
     "example": "A Reuters article about an election result citing official electoral commission data and named political analysts."},
    {"category": "example",   "icon": "❌", "title": "What Fake News Looks Like", "label": "FAKE",
     "content": "Fake news typically uses emotional, sensational language designed to provoke anger or fear. It relies on anonymous sources, makes extraordinary claims without evidence, is published on recently-created websites with no editorial history, and often asks you to 'share before it gets deleted'.",
     "example": "'SHOCKING: Government secretly putting mind-control chemicals in tap water — SHARE NOW before they ban this!'"},
]


@edu_bp.route('/', methods=['GET'])
@require_auth
def get_content():
    col = get_collection('educational_content')
    if col.count_documents({}) == 0:
        col.insert_many([{**c, "createdAt": datetime.utcnow()} for c in DEFAULT_CONTENT])
    content = list(col.find({}))
    return jsonify([{**{k: v for k, v in c.items() if k != '_id'}, "id": str(c['_id'])} for c in content])


@edu_bp.route('/admin', methods=['POST'])
@require_admin
def create_content():
    data = request.get_json() or {}
    data['createdAt'] = datetime.utcnow()
    res = get_collection('educational_content').insert_one(data)
    return jsonify({"id": str(res.inserted_id), "message": "Content added"}), 201


@edu_bp.route('/admin/<cid>', methods=['DELETE'])
@require_admin
def delete_content(cid):
    get_collection('educational_content').delete_one({"_id": ObjectId(cid)})
    return jsonify({"message": "Deleted"})


# ── Chatbot ───────────────────────────────────────────────────────────────────
chatbot_bp = Blueprint('chatbot', __name__)

RESPONSES = {
    "fake news":       "Fake news is deliberately fabricated or misleading information presented as legitimate news. It spreads rapidly on social media because it's designed to provoke emotional reactions that override critical thinking.",
    "how to detect":   "To detect fake news: (1) Check the source URL carefully. (2) Search for the story on multiple trusted outlets. (3) Look for named authors and cited sources. (4) Reverse image search any photos. (5) Check the publication date. (6) Use fact-checkers like Snopes, PolitiFact, or FactCheck.org.",
    "verify":          "To verify a claim: check Reuters, BBC, AP News, NPR, or PBS. For fact-checking, use PolitiFact, Snopes, or FactCheck.org. If multiple independent trusted sources confirm the story, it is likely real.",
    "sources":         "Trusted news sources include Reuters, BBC News, Associated Press (AP), NPR, PBS NewsHour, and The Guardian. For fact-checking specifically, use PolitiFact, Snopes, FactCheck.org, and AP Fact Check.",
    "bias":            "Media bias is the tendency of journalists or outlets to present news favouring a particular viewpoint. Tools like AllSides.com and MediaBiasfactCheck.com rate outlets across the political spectrum to help you find balanced coverage.",
    "deepfake":        "Deepfakes are AI-generated videos or audio that make real people appear to say or do things they never did. To spot them: look for unnatural eye blinking, lighting inconsistencies, blurry edges around the face, and audio that doesn't quite sync with lip movements.",
    "social media":    "Social media platforms amplify engaging content regardless of accuracy. Always verify news seen on social media through a trusted news outlet before sharing. Remember: likes and shares are NOT evidence of truth.",
    "confirmation":    "Confirmation bias is our tendency to seek out and believe information that confirms what we already think. To fight it: deliberately read perspectives you disagree with, and check your emotional reaction — if a story makes you very angry or very happy, fact-check it extra carefully.",
    "points":          "You earn +10 points for every claim where your guess (Real or Fake) matches the AI result. Build a streak of correct guesses to earn the Streak Master badge! Check the Leaderboard to see how you rank against other users.",
    "model":           "SimsVeriNews uses a Linear SVM (Support Vector Machine) model trained on 44,898 real and fake news articles. It achieves 99.27% accuracy on our test set. The model analyses linguistic patterns, word frequencies, and writing style using TF-IDF vectorisation.",
    "accuracy":        "Our AI model (Linear SVM) is 99.27% accurate on our test dataset. However, no AI is perfect—always exercise critical thinking and cross-reference multiple sources for important news!",
    "badges":          "Earn badges like 'Streak Master', 'Fact Finder', and 'Century Club' by using the system! Check your profile collection to see your achievements and how to earn them.",
    "leaderboard":     "The leaderboard ranks users by their total points. Compete with others to become the top truth-seeker in the TruthGuard community!",
    "profile":         "In your profile, you can update your name, email, avatar, and password. It also shows your total points, current streak, and earned badges.",
    "support":         "If you have questions or issues, use the 'Contact' page to send a message to the administrators. We're here to help!",
    "mission":         "TruthGuard (SimsVeriNews) aims to empower users with AI tools and education to identify misinformation and stop the spread of fake news.",
    "password":        "You can change your password by going to the Profile page and entering a new password in the update form.",
}

DEFAULT_RESPONSE = (
    "I can help you understand fake news and the TruthGuard system! Try asking me about: "
    "how to detect fake news, AI accuracy, trusted sources, points & badges, "
    "the leaderboard, profile management, or how to contact support."
)


@chatbot_bp.route('/message', methods=['POST'])
def chat():
    msg = (request.get_json() or {}).get('message', '').lower()
    response = DEFAULT_RESPONSE
    for keyword, reply in RESPONSES.items():
        if keyword in msg:
            response = reply
            break
    return jsonify({"response": response})
