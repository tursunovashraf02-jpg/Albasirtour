"""Albasirtour — FastAPI backend.

Modules:
- Auth (JWT email/password + Emergent Google OAuth)
- Users (roles: admin, operator, user)
- Tours, Countries, Packages, Reviews, Blog, FAQ, Partners, Testimonials
- Bookings + Payments (upload receipt)
- Chat (WebSocket real-time client <-> admin)
- Seed demo content on startup
"""

from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import json
import base64
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Literal

import bcrypt
import jwt
import httpx
from bson import ObjectId
from fastapi import (
    FastAPI, APIRouter, Request, Response, HTTPException, Depends,
    WebSocket, WebSocketDisconnect, UploadFile, File, Form
)
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@albasir.com")
ADMIN_PHONE = os.environ.get("ADMIN_PHONE", "+998900000001")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@2026")
DEMO_USER_EMAIL = os.environ.get("DEMO_USER_EMAIL", "user@albasir.com")
DEMO_USER_PHONE = os.environ.get("DEMO_USER_PHONE", "+998900000002")
DEMO_USER_PASSWORD = os.environ.get("DEMO_USER_PASSWORD", "User@2026")

client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=10000,
    connectTimeoutMS=10000,
)
db = client[DB_NAME]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("albasirtour")

app = FastAPI(title="Albasirtour API")
api = APIRouter(prefix="/api")

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def new_id(prefix: str = "id") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def normalize_phone(phone: str) -> str:
    """Normalize phone: strip spaces, dashes, parens; keep leading + and digits."""
    if not phone:
        return ""
    cleaned = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    return cleaned


def create_access_token(user_id: str, phone: str, role: str) -> str:
    payload = {
        "sub": user_id, "phone": phone, "role": role,
        "exp": now_utc() + timedelta(minutes=60 * 12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": now_utc() + timedelta(days=7),
        "type": "refresh",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie("access_token", access, httponly=True, secure=True,
                        samesite="none", max_age=60 * 60 * 12, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True,
                        samesite="none", max_age=60 * 60 * 24 * 7, path="/")


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("session_token", path="/")


def public_user(u: dict) -> dict:
    return {
        "id": u.get("user_id") or str(u.get("_id")),
        "phone": u.get("phone", ""),
        "email": u.get("email", ""),
        "name": u.get("name", ""),
        "role": u.get("role", "user"),
        "picture": u.get("picture", ""),
        "created_at": u.get("created_at").isoformat() if isinstance(u.get("created_at"), datetime) else u.get("created_at"),
        "favorites": u.get("favorites", []),
    }


# -----------------------------------------------------------------------------
# Auth dependency
# -----------------------------------------------------------------------------
async def get_current_user(request: Request) -> dict:
    # 1. JWT access_token cookie or Bearer
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if token:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
            if payload.get("type") == "access":
                user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
                if user:
                    return user
        except jwt.PyJWTError:
            pass

    # 2. Emergent Google session_token cookie
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            session_token = auth[7:]
    if session_token:
        sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if sess:
            expires = sess.get("expires_at")
            if isinstance(expires, str):
                expires = datetime.fromisoformat(expires)
            if expires and expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if expires and expires >= now_utc():
                user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
                if user:
                    return user

    raise HTTPException(status_code=401, detail="Not authenticated")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") not in ("admin", "operator"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def require_super_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# -----------------------------------------------------------------------------
# Pydantic Schemas
# -----------------------------------------------------------------------------
class RegisterIn(BaseModel):
    phone: str = Field(min_length=6)
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)
    email: Optional[EmailStr] = None


class LoginIn(BaseModel):
    phone: str
    password: str


class GoogleSessionIn(BaseModel):
    session_id: str


class TourIn(BaseModel):
    model_config = ConfigDict(extra="allow")
    slug: str
    country: str
    city: Optional[str] = ""
    hotel: Optional[str] = ""
    days: int = 5
    nights: int = 4
    meals: Optional[str] = "HB"
    transport: Optional[str] = "Bus"
    flight_included: bool = True
    insurance_included: bool = True
    visa_included: bool = False
    price: float
    old_price: Optional[float] = None
    currency: str = "USD"
    package: Literal["Bronze", "Silver", "Gold", "VIP"] = "Silver"
    featured: bool = False
    discount_percent: Optional[int] = None
    image: str
    gallery: List[str] = []
    translations: Dict[str, Dict[str, str]] = {}  # {lang: {title, description, highlights}}
    departure_dates: List[str] = []
    rating: float = 4.7
    reviews_count: int = 0


class CountryIn(BaseModel):
    slug: str
    image: str
    video: Optional[str] = ""
    gallery: List[str] = []
    translations: Dict[str, Dict[str, str]] = {}
    popular_spots: List[Dict[str, str]] = []


class BookingIn(BaseModel):
    tour_id: Optional[str] = None
    tour_slug: Optional[str] = None
    first_name: str
    last_name: str
    phone: str
    email: Optional[EmailStr] = None
    telegram: Optional[str] = ""
    destination: str
    date: str
    people: int = 1
    note: Optional[str] = ""


class BookingStatusIn(BaseModel):
    status: Literal["pending", "confirmed", "cancelled", "completed"]
    admin_note: Optional[str] = ""


class ReviewIn(BaseModel):
    name: str
    rating: int = Field(ge=1, le=5)
    text: str
    tour_slug: Optional[str] = ""


class BlogIn(BaseModel):
    slug: str
    image: str
    translations: Dict[str, Dict[str, str]] = {}
    published: bool = True


class FAQIn(BaseModel):
    translations: Dict[str, Dict[str, str]] = {}
    order: int = 0


class SettingsIn(BaseModel):
    payment_qr: Optional[str] = ""
    payment_link: Optional[str] = ""
    bank_details: Optional[str] = ""
    contact_phone: Optional[str] = ""
    contact_telegram: Optional[str] = ""
    contact_whatsapp: Optional[str] = ""
    contact_email: Optional[str] = ""
    contact_address: Optional[str] = ""
    contact_map: Optional[str] = ""
    about_translations: Optional[Dict[str, Dict[str, str]]] = {}
    about_image1: Optional[str] = ""
    about_image2: Optional[str] = ""
    about_stat_years: Optional[str] = "12+"
    about_stat_countries: Optional[str] = "8"
    about_stat_guests: Optional[str] = "10k+"


class RequisiteIn(BaseModel):
    title: str
    bank_name: str = ""
    account_holder: str = ""
    account_number: str = ""
    mfo: str = ""
    stir: str = ""
    currency: str = "UZS"
    details: str = ""
    is_active: bool = True
    order: int = 0


class PaymentReceiptIn(BaseModel):
    booking_id: str
    receipt_image: str  # data URL / URL
    amount: float
    method: str = "qr"


class UserRoleIn(BaseModel):
    role: Literal["admin", "operator", "user"]


# -----------------------------------------------------------------------------
# AUTH ROUTES
# -----------------------------------------------------------------------------
@api.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    phone = normalize_phone(body.phone)
    if not phone:
        raise HTTPException(status_code=400, detail="Phone required")
    if await db.users.find_one({"phone": phone}):
        raise HTTPException(status_code=400, detail="Phone already registered")
    user_id = new_id("user")
    doc = {
        "user_id": user_id,
        "phone": phone,
        "email": (body.email or "").lower().strip(),
        "password_hash": hash_password(body.password),
        "name": body.name.strip(),
        "role": "user",
        "picture": "",
        "favorites": [],
        "created_at": now_utc(),
    }
    await db.users.insert_one(doc)
    access = create_access_token(user_id, phone, "user")
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {"user": public_user(doc), "access_token": access, "refresh_token": refresh}


@api.post("/auth/login")
async def login(body: LoginIn, response: Response):
    phone = normalize_phone(body.phone)
    user = await db.users.find_one({"phone": phone}, {"_id": 0})
    if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access = create_access_token(user["user_id"], phone, user.get("role", "user"))
    refresh = create_refresh_token(user["user_id"])
    set_auth_cookies(response, access, refresh)
    return {"user": public_user(user), "access_token": access, "refresh_token": refresh}


@api.post("/auth/logout")
async def logout(response: Response, request: Request):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    clear_auth_cookies(response)
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


# -----------------------------------------------------------------------------
# TOURS
# -----------------------------------------------------------------------------
@api.get("/tours")
async def list_tours(country: Optional[str] = None, featured: Optional[bool] = None,
                     package: Optional[str] = None, limit: int = 100):
    q: Dict[str, Any] = {}
    if country: q["country"] = country
    if featured is not None: q["featured"] = featured
    if package: q["package"] = package
    items = await db.tours.find(q, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return items


@api.get("/tours/{slug}")
async def get_tour(slug: str):
    t = await db.tours.find_one({"slug": slug}, {"_id": 0})
    if not t:
        raise HTTPException(404, "Tour not found")
    return t


@api.post("/tours")
async def create_tour(body: TourIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    if await db.tours.find_one({"slug": doc["slug"]}):
        raise HTTPException(400, "Slug already exists")
    doc["tour_id"] = new_id("tour")
    doc["created_at"] = now_utc()
    await db.tours.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/tours/{slug}")
async def update_tour(slug: str, body: TourIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["updated_at"] = now_utc()
    r = await db.tours.update_one({"slug": slug}, {"$set": doc})
    if r.matched_count == 0:
        raise HTTPException(404, "Tour not found")
    return await db.tours.find_one({"slug": doc["slug"]}, {"_id": 0})


@api.delete("/tours/{slug}")
async def delete_tour(slug: str, _admin: dict = Depends(require_admin)):
    await db.tours.delete_one({"slug": slug})
    return {"ok": True}


# -----------------------------------------------------------------------------
# COUNTRIES
# -----------------------------------------------------------------------------
@api.get("/countries")
async def list_countries():
    return await db.countries.find({}, {"_id": 0}).to_list(100)


@api.get("/countries/{slug}")
async def get_country(slug: str):
    c = await db.countries.find_one({"slug": slug}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Country not found")
    return c


@api.post("/countries")
async def create_country(body: CountryIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["created_at"] = now_utc()
    await db.countries.update_one({"slug": doc["slug"]}, {"$set": doc}, upsert=True)
    return doc


@api.put("/countries/{slug}")
async def update_country(slug: str, body: CountryIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["updated_at"] = now_utc()
    r = await db.countries.update_one({"slug": slug}, {"$set": doc})
    if r.matched_count == 0:
        raise HTTPException(404, "Country not found")
    return await db.countries.find_one({"slug": doc["slug"]}, {"_id": 0})


@api.delete("/countries/{slug}")
async def delete_country(slug: str, _admin: dict = Depends(require_admin)):
    await db.countries.delete_one({"slug": slug})
    return {"ok": True}


# -----------------------------------------------------------------------------
# BOOKINGS
# -----------------------------------------------------------------------------
@api.post("/bookings")
async def create_booking(body: BookingIn, request: Request):
    booking_id = new_id("bk")
    user_id = None
    try:
        u = await get_current_user(request)
        user_id = u.get("user_id")
    except HTTPException:
        pass
    doc = body.model_dump()
    doc.update({
        "booking_id": booking_id,
        "user_id": user_id,
        "status": "pending",
        "admin_note": "",
        "created_at": now_utc(),
    })
    await db.bookings.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/bookings/mine")
async def my_bookings(user: dict = Depends(get_current_user)):
    return await db.bookings.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.get("/bookings")
async def all_bookings(_admin: dict = Depends(require_admin)):
    return await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.patch("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, body: BookingStatusIn,
                                _admin: dict = Depends(require_admin)):
    r = await db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {"status": body.status, "admin_note": body.admin_note or "", "updated_at": now_utc()}}
    )
    if r.matched_count == 0:
        raise HTTPException(404, "Booking not found")
    return await db.bookings.find_one({"booking_id": booking_id}, {"_id": 0})


# -----------------------------------------------------------------------------
# PAYMENTS
# -----------------------------------------------------------------------------
@api.post("/payments/receipt")
async def upload_receipt(body: PaymentReceiptIn, user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"booking_id": body.booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(404, "Booking not found")
    doc = {
        "payment_id": new_id("pay"),
        "booking_id": body.booking_id,
        "user_id": user["user_id"],
        "amount": body.amount,
        "method": body.method,
        "receipt_image": body.receipt_image,
        "status": "pending_review",
        "created_at": now_utc(),
    }
    await db.payments.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/payments")
async def list_payments(_admin: dict = Depends(require_admin)):
    return await db.payments.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.patch("/payments/{payment_id}/verify")
async def verify_payment(payment_id: str, approved: bool = True,
                         _admin: dict = Depends(require_admin)):
    status = "approved" if approved else "rejected"
    r = await db.payments.update_one({"payment_id": payment_id}, {"$set": {"status": status, "verified_at": now_utc()}})
    if r.matched_count == 0:
        raise HTTPException(404, "Payment not found")
    p = await db.payments.find_one({"payment_id": payment_id}, {"_id": 0})
    if approved:
        await db.bookings.update_one({"booking_id": p["booking_id"]}, {"$set": {"status": "confirmed"}})
    return p


# -----------------------------------------------------------------------------
# REVIEWS
# -----------------------------------------------------------------------------
@api.get("/reviews")
async def list_reviews(limit: int = 50):
    return await db.reviews.find({"approved": True}, {"_id": 0}).sort("created_at", -1).to_list(limit)


@api.post("/reviews")
async def create_review(body: ReviewIn, request: Request):
    user_id = None
    try:
        u = await get_current_user(request)
        user_id = u.get("user_id")
    except HTTPException:
        pass
    doc = body.model_dump()
    doc.update({
        "review_id": new_id("rev"),
        "user_id": user_id,
        "approved": True,
        "created_at": now_utc(),
    })
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    return doc


# -----------------------------------------------------------------------------
# BLOG / NEWS
# -----------------------------------------------------------------------------
@api.get("/blog")
async def list_blog():
    return await db.blog.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api.get("/blog/{slug}")
async def get_blog(slug: str):
    b = await db.blog.find_one({"slug": slug}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Post not found")
    return b


@api.post("/blog")
async def create_blog(body: BlogIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["created_at"] = now_utc()
    await db.blog.update_one({"slug": doc["slug"]}, {"$set": doc}, upsert=True)
    return doc


@api.put("/blog/{slug}")
async def update_blog(slug: str, body: BlogIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["updated_at"] = now_utc()
    r = await db.blog.update_one({"slug": slug}, {"$set": doc})
    if r.matched_count == 0:
        raise HTTPException(404, "Post not found")
    return await db.blog.find_one({"slug": doc["slug"]}, {"_id": 0})


@api.delete("/blog/{slug}")
async def delete_blog(slug: str, _admin: dict = Depends(require_admin)):
    await db.blog.delete_one({"slug": slug})
    return {"ok": True}


# -----------------------------------------------------------------------------
# FAQ CRUD
# -----------------------------------------------------------------------------
@api.post("/faq")
async def create_faq(body: FAQIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["faq_id"] = new_id("faq")
    doc["created_at"] = now_utc()
    await db.faq.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/faq/{faq_id}")
async def delete_faq(faq_id: str, _admin: dict = Depends(require_admin)):
    await db.faq.delete_one({"faq_id": faq_id})
    return {"ok": True}


# -----------------------------------------------------------------------------
# FAQ
# -----------------------------------------------------------------------------
@api.get("/faq")
async def list_faq():
    return await db.faq.find({}, {"_id": 0}).sort("order", 1).to_list(200)


# -----------------------------------------------------------------------------
# PARTNERS / TESTIMONIALS
# -----------------------------------------------------------------------------
@api.get("/partners")
async def list_partners():
    return await db.partners.find({}, {"_id": 0}).to_list(50)


@api.get("/testimonials")
async def list_testimonials():
    return await db.testimonials.find({}, {"_id": 0}).to_list(50)


@api.get("/gallery")
async def list_gallery():
    return await db.gallery.find({}, {"_id": 0}).to_list(200)


# -----------------------------------------------------------------------------
# STATS (dashboard)
# -----------------------------------------------------------------------------
@api.get("/stats/public")
async def public_stats():
    tours = await db.tours.count_documents({})
    countries = await db.countries.count_documents({})
    bookings = await db.bookings.count_documents({"status": {"$in": ["confirmed", "completed"]}})
    happy = max(bookings * 3, 2400)
    return {"tours": tours, "countries": countries, "bookings": bookings, "happy_travelers": happy, "years": 12}


@api.get("/stats/admin")
async def admin_stats(_admin: dict = Depends(require_admin)):
    total_bookings = await db.bookings.count_documents({})
    pending = await db.bookings.count_documents({"status": "pending"})
    confirmed = await db.bookings.count_documents({"status": "confirmed"})
    cancelled = await db.bookings.count_documents({"status": "cancelled"})
    completed = await db.bookings.count_documents({"status": "completed"})
    users = await db.users.count_documents({})
    payments_pending = await db.payments.count_documents({"status": "pending_review"})
    revenue_docs = await db.payments.find({"status": "approved"}, {"_id": 0, "amount": 1}).to_list(10000)
    revenue = sum([p.get("amount", 0) for p in revenue_docs])
    # last 7 days bookings series
    series = []
    for i in range(6, -1, -1):
        day_start = now_utc().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        c = await db.bookings.count_documents({"created_at": {"$gte": day_start, "$lt": day_end}})
        series.append({"day": day_start.strftime("%a"), "value": c})
    return {
        "total_bookings": total_bookings,
        "pending": pending, "confirmed": confirmed,
        "cancelled": cancelled, "completed": completed,
        "users": users, "payments_pending": payments_pending,
        "revenue": revenue, "series": series,
    }


# -----------------------------------------------------------------------------
# USERS / FAVORITES
# -----------------------------------------------------------------------------
@api.get("/users")
async def list_users(_admin: dict = Depends(require_admin)):
    return [public_user(u) for u in await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)]


@api.patch("/users/{user_id}/role")
async def set_user_role(user_id: str, body: UserRoleIn, _admin: dict = Depends(require_super_admin)):
    await db.users.update_one({"user_id": user_id}, {"$set": {"role": body.role}})
    return {"ok": True}


@api.post("/favorites/{tour_slug}")
async def toggle_favorite(tour_slug: str, user: dict = Depends(get_current_user)):
    favs = user.get("favorites", [])
    if tour_slug in favs:
        favs.remove(tour_slug)
    else:
        favs.append(tour_slug)
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"favorites": favs}})
    return {"favorites": favs}


# -----------------------------------------------------------------------------
# SETTINGS
# -----------------------------------------------------------------------------
@api.get("/settings")
async def get_settings():
    s = await db.settings.find_one({"_id": "main"}, {"_id": 0})
    return s or {}


@api.put("/settings")
async def update_settings(body: SettingsIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    await db.settings.update_one({"_id": "main"}, {"$set": doc}, upsert=True)
    return doc


# -----------------------------------------------------------------------------
# REQUISITES (bank payment details)
# -----------------------------------------------------------------------------
@api.get("/requisites")
async def list_requisites():
    q = {"is_active": True}
    return await db.requisites.find(q, {"_id": 0}).sort("order", 1).to_list(50)


@api.get("/requisites/all")
async def list_all_requisites(_admin: dict = Depends(require_admin)):
    return await db.requisites.find({}, {"_id": 0}).sort("order", 1).to_list(50)


@api.post("/requisites")
async def create_requisite(body: RequisiteIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["requisite_id"] = new_id("req")
    doc["created_at"] = now_utc()
    await db.requisites.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/requisites/{requisite_id}")
async def update_requisite(requisite_id: str, body: RequisiteIn, _admin: dict = Depends(require_admin)):
    doc = body.model_dump()
    doc["updated_at"] = now_utc()
    r = await db.requisites.update_one({"requisite_id": requisite_id}, {"$set": doc})
    if r.matched_count == 0:
        raise HTTPException(404, "Requisite not found")
    return await db.requisites.find_one({"requisite_id": requisite_id}, {"_id": 0})


@api.delete("/requisites/{requisite_id}")
async def delete_requisite(requisite_id: str, _admin: dict = Depends(require_admin)):
    r = await db.requisites.delete_one({"requisite_id": requisite_id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Requisite not found")
    return {"ok": True}


# -----------------------------------------------------------------------------
# CHAT (WebSocket + REST fallback)
# -----------------------------------------------------------------------------
class ChatMessageIn(BaseModel):
    text: str
    session_id: Optional[str] = None


class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}  # session_id -> sockets
        self.admins: List[WebSocket] = []

    async def connect(self, session_id: str, ws: WebSocket, is_admin: bool = False):
        await ws.accept()
        if is_admin:
            self.admins.append(ws)
        else:
            self.active.setdefault(session_id, []).append(ws)

    def disconnect(self, session_id: str, ws: WebSocket, is_admin: bool = False):
        try:
            if is_admin:
                self.admins.remove(ws)
            else:
                self.active.get(session_id, []).remove(ws)
        except ValueError:
            pass

    async def broadcast(self, session_id: str, payload: dict):
        data = json.dumps(payload, default=str)
        for ws in list(self.active.get(session_id, [])):
            try:
                await ws.send_text(data)
            except Exception:
                pass
        for ws in list(self.admins):
            try:
                await ws.send_text(data)
            except Exception:
                pass


manager = ConnectionManager()


@app.websocket("/api/ws/chat/{session_id}")
async def ws_chat(ws: WebSocket, session_id: str):
    is_admin = ws.query_params.get("admin") == "1"
    await manager.connect(session_id, ws, is_admin=is_admin)
    try:
        # send history
        history = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(200)
        await ws.send_text(json.dumps({"type": "history", "messages": history}, default=str))

        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except Exception:
                continue
            text = (msg.get("text") or "").strip()
            if not text:
                continue
            doc = {
                "message_id": new_id("msg"),
                "session_id": session_id,
                "sender": "admin" if is_admin else (msg.get("sender") or "guest"),
                "sender_name": msg.get("sender_name") or ("Support" if is_admin else "Guest"),
                "text": text,
                "created_at": now_utc(),
            }
            await db.chat_messages.insert_one(doc)
            doc.pop("_id", None)
            await manager.broadcast(session_id, {"type": "message", "message": doc})
    except WebSocketDisconnect:
        manager.disconnect(session_id, ws, is_admin=is_admin)


@api.get("/chat/sessions")
async def chat_sessions(_admin: dict = Depends(require_admin)):
    pipeline = [
        {"$sort": {"created_at": -1}},
        {"$group": {"_id": "$session_id", "last": {"$first": "$$ROOT"}, "count": {"$sum": 1}}},
        {"$sort": {"last.created_at": -1}},
        {"$limit": 100},
    ]
    docs = await db.chat_messages.aggregate(pipeline).to_list(100)
    result = []
    for d in docs:
        last = d["last"]
        last.pop("_id", None)
        result.append({"session_id": d["_id"], "last_message": last, "count": d["count"]})
    return result


@api.get("/chat/history/{session_id}")
async def chat_history(session_id: str):
    return await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)


# -----------------------------------------------------------------------------
# HEALTH
# -----------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"service": "Albasirtour API", "ok": True}


# -----------------------------------------------------------------------------
# SEED DATA
# -----------------------------------------------------------------------------
from seed_data import seed_all


@app.on_event("startup")
async def on_startup():
    # MongoDB ulanishini tekshirish
    try:
        await client.admin.command("ping")
        logger.info("MongoDB connected — database: %s", DB_NAME)
    except Exception as e:
        logger.error("MongoDB connection failed: %s", e)
        raise RuntimeError(
            "MongoDB ulanmadi. Atlas → Network Access da 0.0.0.0/0 qo'shing "
            "(yoki Render outbound IP larni whitelist qiling). "
            f"Xato: {e}"
        ) from e

    # Drop old email unique index (may exist from earlier version)
    try:
        await db.users.drop_index("email_1")
    except Exception:
        pass
    try:
        await db.users.drop_index("phone_1")
    except Exception:
        pass

    # Normalize any existing phone values before adding unique index
    async for u in db.users.find({}, {"_id": 1, "phone": 1}):
        cur = u.get("phone") or ""
        norm = normalize_phone(cur)
        if norm != cur:
            await db.users.update_one({"_id": u["_id"]}, {"$set": {"phone": norm}})

    # Drop duplicate users (keep the newest per phone). Do this BEFORE unique index.
    seen = {}
    async for u in db.users.find({}, {"_id": 1, "phone": 1, "created_at": 1, "role": 1}).sort("created_at", -1):
        p = u.get("phone") or ""
        if not p:
            continue
        if p in seen:
            # keep the one with role admin if any, else keep the first (newest)
            keep = seen[p]
            if u.get("role") == "admin" and keep.get("role") != "admin":
                await db.users.delete_one({"_id": keep["_id"]})
                seen[p] = u
            else:
                await db.users.delete_one({"_id": u["_id"]})
        else:
            seen[p] = u

    await db.users.create_index("phone", unique=True, sparse=True)
    await db.users.create_index("email", sparse=True)
    await db.users.create_index("user_id", unique=True)
    await db.tours.create_index("slug", unique=True)
    await db.countries.create_index("slug", unique=True)
    await db.blog.create_index("slug", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)

    admin_phone = normalize_phone(ADMIN_PHONE)
    demo_phone = normalize_phone(DEMO_USER_PHONE)

    # Migrate legacy admin (seeded with email as identifier) if it exists
    legacy_admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if legacy_admin and not legacy_admin.get("phone"):
        await db.users.update_one({"user_id": legacy_admin["user_id"]}, {"$set": {"phone": admin_phone}})
    legacy_demo = await db.users.find_one({"email": DEMO_USER_EMAIL})
    if legacy_demo and not legacy_demo.get("phone"):
        await db.users.update_one({"user_id": legacy_demo["user_id"]}, {"$set": {"phone": demo_phone}})

    # Seed admin (by phone)
    admin = await db.users.find_one({"phone": admin_phone})
    if not admin:
        await db.users.insert_one({
            "user_id": new_id("user"),
            "phone": admin_phone,
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Albasirtour Admin",
            "role": "admin",
            "picture": "",
            "favorites": [],
            "created_at": now_utc(),
        })
        logger.info("Seeded admin user: %s", admin_phone)
    else:
        # keep password in sync with .env
        if not verify_password(ADMIN_PASSWORD, admin.get("password_hash", "")):
            await db.users.update_one({"phone": admin_phone},
                                      {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})

    demo = await db.users.find_one({"phone": demo_phone})
    if not demo:
        await db.users.insert_one({
            "user_id": new_id("user"),
            "phone": demo_phone,
            "email": DEMO_USER_EMAIL,
            "password_hash": hash_password(DEMO_USER_PASSWORD),
            "name": "Demo Traveler",
            "role": "user",
            "picture": "",
            "favorites": [],
            "created_at": now_utc(),
        })

    await seed_all(db, now_utc)
    logger.info("Startup complete")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
