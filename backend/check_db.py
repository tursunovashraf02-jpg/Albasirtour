"""MongoDB ulanishini tekshirish. Ishlatish: python check_db.py"""
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).parent / ".env")

MONGO_URL = os.environ.get("MONGO_URL", "")
DB_NAME = os.environ.get("DB_NAME", "albasirtour")

if not MONGO_URL or "USER:PASSWORD" in MONGO_URL or "xxxxx" in MONGO_URL:
    print("XATO: backend/.env faylida MONGO_URL to'g'ri sozlanmagan.")
    print("MongoDB Atlas → Connect → connection string ni qo'ying.")
    sys.exit(1)

try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=8000)
    client.admin.command("ping")
    db = client[DB_NAME]
    collections = db.list_collection_names()
    print(f"OK: MongoDB ulandi — database: {DB_NAME}")
    print(f"Kolleksiyalar: {collections or '(bo'sh — seed startup da yaratiladi)'}")
    client.close()
except Exception as e:
    print(f"XATO: MongoDB ga ulanib bo'lmadi: {e}")
    print("Tekshiring: parol, IP whitelist (0.0.0.0/0), connection string")
    sys.exit(1)
