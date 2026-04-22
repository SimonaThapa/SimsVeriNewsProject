
import os, sys
# Add parent dir to sys.path to import ml
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from ml.predictor import predict

test_claims = [
    "The world is ending tomorrow according to a Facebook post.",
    "Sher Bahadur Deuba has been seen in public today.",
    "Scientists at NASA reported that they have discovered a new exoplanet with Earth-like conditions.",
    "BREAKING: Pope Francis has endorsed Donald Trump for president!",
]

for claim in test_claims:
    print("-" * 50)
    print(f"Claim: {claim}")
    res = predict(claim)
    print(f"Classification: {res['classification']}")
    print(f"Confidence: {res['confidence_pct']}%")
    print(f"Real Prob: {res['real_probability']}%")
    print(f"Fake Prob: {res['fake_probability']}%")
    print(f"Explanation: {res['explanation']}")
