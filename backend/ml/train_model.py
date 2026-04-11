#!/usr/bin/env python3
"""
ml/train_model.py — Train Fake News Detection Model
=====================================================
Based on your Fake_News_Detector.ipynb notebook.

DATASET SETUP — place these two files inside backend/ml/:
  • True.csv                (real news — columns: title, text, subject, date)
  • Fake News project.csv   (fake news — same columns)

MODEL RESULTS (from your notebook):
  Naive Bayes          93.04%
  Logistic Regression  98.36%
  Random Forest        98.53%
  SVM (LinearSVC)      99.27%  ← BEST → saved

RUN:
  cd backend
  python ml/train_model.py
"""
import os, sys, re, json, joblib
import pandas as pd
import numpy as np

import nltk
nltk.download('stopwords', quiet=True)
nltk.download('wordnet',   quiet=True)
from nltk.corpus import stopwords
from nltk.stem   import WordNetLemmatizer

from sklearn.model_selection     import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm                 import LinearSVC
from sklearn.linear_model        import LogisticRegression
from sklearn.naive_bayes         import MultinomialNB
from sklearn.ensemble            import RandomForestClassifier
from sklearn.metrics             import accuracy_score, classification_report
from sklearn.calibration         import CalibratedClassifierCV

BASE     = os.path.dirname(__file__)
TRUE_CSV = os.path.join(BASE, "True.csv")
FAKE_CSV = os.path.join(BASE, "Fake News project.csv")
MODEL    = os.path.join(BASE, "model.pkl")
VEC      = os.path.join(BASE, "vectorizer.pkl")
META     = os.path.join(BASE, "model_meta.json")

_stop = set(stopwords.words('english'))
_lem  = WordNetLemmatizer()

def preprocess(text):
    if not isinstance(text, str): return ""
    text = text.lower()
    text = re.sub(r'[^a-zA-Z]', ' ', text)
    return ' '.join(_lem.lemmatize(w) for w in text.split() if w not in _stop)

def train():
    print("=" * 60)
    print("  SimsVeriNews — ML Model Training")
    print("=" * 60)

    for path, name in [(TRUE_CSV, "True.csv"), (FAKE_CSV, "Fake News project.csv")]:
        if not os.path.exists(path):
            print(f"\n[ERROR] Missing: {path}")
            print(f"  Place '{name}' inside backend/ml/")
            sys.exit(1)

    print("\n[1/5] Loading datasets…")
    true_df = pd.read_csv(TRUE_CSV); true_df['label'] = 1
    fake_df = pd.read_csv(FAKE_CSV); fake_df['label'] = 0
    df = pd.concat([true_df, fake_df]).sample(frac=1, random_state=42).reset_index(drop=True)
    df.dropna(inplace=True)
    df['content'] = df['title'].astype(str) + " " + df['text'].astype(str)
    print(f"      Total rows: {len(df)}")

    print("\n[2/5] Preprocessing text…")
    df['clean'] = df['content'].apply(preprocess)
    X_train, X_test, y_train, y_test = train_test_split(
        df['clean'], df['label'], test_size=0.2, random_state=42, stratify=df['label'])
    print(f"      Train:{len(X_train)}  Test:{len(X_test)}")

    print("\n[3/5] Vectorizing (TF-IDF)…")
    vec = TfidfVectorizer(max_features=50000, max_df=0.7, min_df=5, stop_words='english')
    Xtr = vec.fit_transform(X_train)
    Xte = vec.transform(X_test)

    print("\n[4/5] Training all models…")
    nb = MultinomialNB(); nb.fit(Xtr, y_train)
    print(f"      Naive Bayes:         {accuracy_score(y_test, nb.predict(Xte))*100:.2f}%")

    lr = LogisticRegression(max_iter=1000, solver='saga', n_jobs=-1); lr.fit(Xtr, y_train)
    print(f"      Logistic Regression: {accuracy_score(y_test, lr.predict(Xte))*100:.2f}%")

    rf = RandomForestClassifier(n_estimators=100, max_depth=20, random_state=42, n_jobs=-1); rf.fit(Xtr, y_train)
    print(f"      Random Forest:       {accuracy_score(y_test, rf.predict(Xte))*100:.2f}%")

    svm = CalibratedClassifierCV(LinearSVC(max_iter=2000), cv=3); svm.fit(Xtr, y_train)
    acc = accuracy_score(y_test, svm.predict(Xte))
    print(f"      SVM (LinearSVC):     {acc*100:.2f}%  ← BEST → saving")

    print("\n[5/5] Saving model + vectorizer…")
    joblib.dump(svm, MODEL); joblib.dump(vec, VEC)
    json.dump({"accuracy": round(acc,4), "model": "LinearSVC+Calibrated",
               "train": len(X_train), "test": len(X_test)}, open(META,'w'), indent=2)

    print(f"\n  ✓ model.pkl       → {MODEL}")
    print(f"  ✓ vectorizer.pkl  → {VEC}")
    print(f"  ✓ Accuracy: {acc*100:.2f}%")
    print("=" * 60)

if __name__ == "__main__": train()
