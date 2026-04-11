import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

import certifi

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        uri = os.getenv("MONGO_URI")
        if not uri:
            raise ValueError("MONGO_URI not set. Add it to backend/.env")
        _client = MongoClient(
            uri, 
            tlsCAFile=certifi.where(), 
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000
        )
        _db = _client["Simsnewsdb"]
        print("[DB] Connected to MongoDB Atlas")
    return _db

def get_collection(name):
    return get_db()[name]
