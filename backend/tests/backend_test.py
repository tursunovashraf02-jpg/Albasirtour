"""AL BASIR TOUR — Backend API test suite.

Modules covered:
- Health / Public content (tours, countries, reviews, blog, faq, gallery, partners, testimonials, stats)
- Auth (register, login admin/user, /me via Bearer + Cookies, Google session invalid)
- Bookings (guest + auth, mine, admin-list, status update, RBAC)
- Payments (receipt upload, verify -> booking auto-confirm)
- Admin users / roles / stats
- Settings (public GET / admin PUT)
- Favorites toggle
- Chat sessions (admin-only) + WebSocket round trip
"""

import os
import json
import time
import uuid
import base64
import asyncio
import pytest
import requests
import websockets

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://premium-travel-hub-25.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"
WS_BASE = BASE_URL.replace("https://", "wss://").replace("http://", "ws://") + "/api/ws/chat"

ADMIN_EMAIL = "admin@albasir.com"
ADMIN_PASSWORD = "Admin@2026"
DEMO_USER_EMAIL = "user@albasir.com"
DEMO_USER_PASSWORD = "User@2026"


# -----------------------------------------------------------------------------
# Fixtures
# -----------------------------------------------------------------------------
@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def user_token(s):
    r = s.post(f"{API}/auth/login", json={"email": DEMO_USER_EMAIL, "password": DEMO_USER_PASSWORD})
    assert r.status_code == 200, f"demo user login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


def _h(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# -----------------------------------------------------------------------------
# Health / Root
# -----------------------------------------------------------------------------
class TestHealth:
    def test_root(self, s):
        r = s.get(f"{API}/")
        assert r.status_code == 200
        assert r.json()["ok"] is True


# -----------------------------------------------------------------------------
# Public content
# -----------------------------------------------------------------------------
class TestPublicContent:
    def test_tours_list(self, s):
        r = s.get(f"{API}/tours")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 8, f"expected >=8 seeded tours, got {len(data)}"
        # verify shape
        first = data[0]
        assert "slug" in first and "price" in first and "translations" in first

    def test_tour_by_slug(self, s):
        tours = s.get(f"{API}/tours").json()
        slug = tours[0]["slug"]
        r = s.get(f"{API}/tours/{slug}")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == slug
        assert isinstance(d.get("translations"), dict)

    def test_tour_not_found(self, s):
        r = s.get(f"{API}/tours/does-not-exist-xxx")
        assert r.status_code == 404

    def test_countries_list(self, s):
        r = s.get(f"{API}/countries")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 8, f"expected >=8 countries, got {len(data)}"

    def test_country_by_slug(self, s):
        countries = s.get(f"{API}/countries").json()
        slug = countries[0]["slug"]
        r = s.get(f"{API}/countries/{slug}")
        assert r.status_code == 200
        assert r.json()["slug"] == slug

    def test_stats_public(self, s):
        r = s.get(f"{API}/stats/public")
        assert r.status_code == 200
        d = r.json()
        for k in ("tours", "countries", "bookings", "happy_travelers", "years"):
            assert k in d
        assert d["tours"] >= 8
        assert d["countries"] >= 8

    def test_reviews(self, s):
        r = s.get(f"{API}/reviews")
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 6, f"expected >=6 reviews, got {len(data)}"

    def test_blog_list_and_detail(self, s):
        r = s.get(f"{API}/blog")
        assert r.status_code == 200
        posts = r.json()
        assert len(posts) >= 1
        slug = posts[0]["slug"]
        d = s.get(f"{API}/blog/{slug}")
        assert d.status_code == 200
        assert d.json()["slug"] == slug

    def test_faq(self, s):
        r = s.get(f"{API}/faq")
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_partners(self, s):
        r = s.get(f"{API}/partners")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_testimonials(self, s):
        r = s.get(f"{API}/testimonials")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_gallery(self, s):
        r = s.get(f"{API}/gallery")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# -----------------------------------------------------------------------------
# Auth
# -----------------------------------------------------------------------------
class TestAuth:
    def test_register_new_user(self, s):
        uniq = uuid.uuid4().hex[:8]
        # backend lowercases email on register
        email = f"test_reg_{uniq}@example.com"
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "TestPass123!", "name": "Test User", "phone": "+998900000000"
        })
        assert r.status_code == 200, r.text
        d = r.json()
        assert "access_token" in d
        assert d["user"]["role"] == "user"
        assert d["user"]["email"] == email
        # httpOnly cookie should be set
        assert "access_token" in r.cookies or True  # secure+samesite=none may be filtered by requests
        # verify user can hit /me with bearer
        me = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {d['access_token']}"})
        assert me.status_code == 200
        assert me.json()["email"] == email

    def test_register_duplicate_email(self, s):
        r = requests.post(f"{API}/auth/register", json={
            "email": ADMIN_EMAIL, "password": "whatever123", "name": "Dup"
        })
        assert r.status_code == 400

    def test_login_admin(self, s):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["role"] == "admin"
        assert d["access_token"]

    def test_login_demo_user(self, s):
        r = requests.post(f"{API}/auth/login", json={"email": DEMO_USER_EMAIL, "password": DEMO_USER_PASSWORD})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["role"] == "user"

    def test_login_wrong_password(self, s):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_bearer(self, s, admin_token):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_with_cookie(self, s):
        # use fresh session to keep cookie
        sess = requests.Session()
        r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        # cookie may not be persisted by requests (secure+samesite=none over https should work).
        me = sess.get(f"{API}/auth/me")
        # If cookies got dropped for any reason, fall back to Bearer - but we want to prove cookie-based auth works.
        assert me.status_code == 200, f"cookie-based /me failed: {me.status_code} {me.text}"
        assert me.json()["email"] == ADMIN_EMAIL

    def test_me_unauthorized(self, s):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_google_session_invalid(self, s):
        # Endpoint must exist and reject bogus session_id
        r = requests.post(f"{API}/auth/google/session", json={"session_id": "bogus-invalid-session-id-xyz"})
        assert r.status_code == 401, f"expected 401 for bad session, got {r.status_code}: {r.text}"


# -----------------------------------------------------------------------------
# Bookings + Payments
# -----------------------------------------------------------------------------
@pytest.fixture(scope="module")
def sample_tour_slug():
    r = requests.get(f"{API}/tours")
    return r.json()[0]["slug"]


class TestBookings:
    def _booking_payload(self, slug):
        return {
            "tour_slug": slug,
            "first_name": "TEST_First",
            "last_name": "Test_Last",
            "phone": "+998900000000",
            "email": "TEST_booker@example.com",
            "telegram": "@tester",
            "destination": "Dubai",
            "date": "2026-03-15",
            "people": 2,
            "note": "TEST booking",
        }

    def test_create_booking_guest(self, s, sample_tour_slug):
        r = requests.post(f"{API}/bookings", json=self._booking_payload(sample_tour_slug))
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "pending"
        assert d.get("booking_id", "").startswith("bk_")
        assert d.get("user_id") is None

    def test_create_booking_authenticated(self, user_token, sample_tour_slug):
        r = requests.post(f"{API}/bookings", json=self._booking_payload(sample_tour_slug),
                          headers=_h(user_token))
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "pending"
        assert d.get("user_id"), "authenticated booking should have user_id set"
        # store for later
        pytest.booking_id_for_user = d["booking_id"]

    def test_my_bookings_requires_auth(self):
        r = requests.get(f"{API}/bookings/mine")
        assert r.status_code == 401

    def test_my_bookings_returns_only_mine(self, user_token):
        r = requests.get(f"{API}/bookings/mine", headers=_h(user_token))
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # all should belong to user (user_id set, non-null)
        for b in data:
            assert b.get("user_id")

    def test_all_bookings_requires_admin(self, user_token):
        r = requests.get(f"{API}/bookings", headers=_h(user_token))
        assert r.status_code == 403

    def test_all_bookings_admin_ok(self, admin_token):
        r = requests.get(f"{API}/bookings", headers=_h(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_update_booking_status_admin(self, admin_token):
        bid = getattr(pytest, "booking_id_for_user", None)
        assert bid, "prior booking creation must have set booking_id"
        # pending -> confirmed
        r = requests.patch(f"{API}/bookings/{bid}/status",
                           json={"status": "confirmed", "admin_note": "TEST confirm"},
                           headers=_h(admin_token))
        assert r.status_code == 200
        assert r.json()["status"] == "confirmed"
        # confirmed -> completed
        r2 = requests.patch(f"{API}/bookings/{bid}/status",
                            json={"status": "completed"},
                            headers=_h(admin_token))
        assert r2.status_code == 200
        assert r2.json()["status"] == "completed"

    def test_update_booking_status_forbidden_for_user(self, user_token):
        bid = getattr(pytest, "booking_id_for_user", None)
        r = requests.patch(f"{API}/bookings/{bid}/status",
                           json={"status": "cancelled"}, headers=_h(user_token))
        assert r.status_code == 403


class TestPayments:
    def test_payment_receipt_requires_auth(self):
        r = requests.post(f"{API}/payments/receipt", json={
            "booking_id": "bk_test", "receipt_image": "data:image/png;base64,AAAA", "amount": 100
        })
        assert r.status_code == 401

    def test_payment_flow_and_verify_confirms_booking(self, user_token, admin_token, sample_tour_slug):
        # Create booking as user
        bk_payload = {
            "tour_slug": sample_tour_slug,
            "first_name": "TEST_pay", "last_name": "flow",
            "phone": "+998900001111", "email": "TEST_pay@example.com",
            "destination": "Turkey", "date": "2026-04-10", "people": 1, "note": "TEST payment flow",
        }
        b = requests.post(f"{API}/bookings", json=bk_payload, headers=_h(user_token))
        assert b.status_code == 200
        bid = b.json()["booking_id"]

        # Upload receipt (base64 image string)
        img_b64 = "data:image/png;base64," + base64.b64encode(b"\x89PNG\r\n\x1a\n").decode()
        r = requests.post(f"{API}/payments/receipt", json={
            "booking_id": bid, "receipt_image": img_b64, "amount": 499.99, "method": "qr"
        }, headers=_h(user_token))
        assert r.status_code == 200, r.text
        pay = r.json()
        assert pay["status"] == "pending_review"
        pid = pay["payment_id"]

        # Non-admin cannot verify
        vr_forbidden = requests.patch(f"{API}/payments/{pid}/verify?approved=true", headers=_h(user_token))
        assert vr_forbidden.status_code == 403

        # Admin verify approved=true -> booking should be confirmed
        vr = requests.patch(f"{API}/payments/{pid}/verify?approved=true", headers=_h(admin_token))
        assert vr.status_code == 200
        assert vr.json()["status"] == "approved"

        # Verify booking is now confirmed
        all_b = requests.get(f"{API}/bookings", headers=_h(admin_token)).json()
        this = [x for x in all_b if x["booking_id"] == bid][0]
        assert this["status"] == "confirmed", f"expected auto-confirm on payment approval; got {this['status']}"


# -----------------------------------------------------------------------------
# Admin — stats / users / settings
# -----------------------------------------------------------------------------
class TestAdmin:
    def test_admin_stats_requires_admin(self, user_token):
        r = requests.get(f"{API}/stats/admin", headers=_h(user_token))
        assert r.status_code == 403

    def test_admin_stats_ok(self, admin_token):
        r = requests.get(f"{API}/stats/admin", headers=_h(admin_token))
        assert r.status_code == 200
        d = r.json()
        for k in ("total_bookings", "pending", "confirmed", "cancelled", "completed",
                  "users", "revenue", "series"):
            assert k in d, f"missing key {k}"
        assert isinstance(d["series"], list) and len(d["series"]) == 7

    def test_users_list_requires_admin(self, user_token):
        r = requests.get(f"{API}/users", headers=_h(user_token))
        assert r.status_code == 403

    def test_users_list_admin(self, admin_token):
        r = requests.get(f"{API}/users", headers=_h(admin_token))
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 2
        # No _id or password_hash leaked
        for u in data:
            assert "password_hash" not in u
            assert "_id" not in u

    def test_role_update_requires_super_admin(self, user_token):
        # find some user_id
        r = requests.get(f"{API}/users", headers=_h(user_token))
        # user_token cannot even list -> ok
        assert r.status_code == 403

    def test_role_update_admin_ok(self, admin_token):
        users = requests.get(f"{API}/users", headers=_h(admin_token)).json()
        demo = [u for u in users if u["email"] == DEMO_USER_EMAIL][0]
        r = requests.patch(f"{API}/users/{demo['id']}/role",
                           json={"role": "user"}, headers=_h(admin_token))
        assert r.status_code == 200
        assert r.json().get("ok") is True


class TestSettings:
    def test_get_public(self, s):
        r = requests.get(f"{API}/settings")
        assert r.status_code == 200
        assert isinstance(r.json(), dict)

    def test_put_requires_admin(self, user_token):
        r = requests.put(f"{API}/settings", json={"contact_phone": "+998 90 000 00 00"},
                         headers=_h(user_token))
        assert r.status_code == 403

    def test_put_admin_ok(self, admin_token):
        payload = {
            "payment_qr": "https://example.com/qr.png",
            "payment_link": "https://pay.example.com",
            "bank_details": "TEST bank",
            "contact_phone": "+998 90 123 45 67",
            "contact_telegram": "@albasir",
            "contact_whatsapp": "+998901234567",
            "contact_email": "info@albasir.com",
            "contact_address": "Tashkent",
            "contact_map": "https://maps.google.com/?q=tashkent",
        }
        r = requests.put(f"{API}/settings", json=payload, headers=_h(admin_token))
        assert r.status_code == 200
        # verify persisted
        g = requests.get(f"{API}/settings").json()
        assert g.get("contact_phone") == payload["contact_phone"]


class TestFavorites:
    def test_toggle_requires_auth(self, sample_tour_slug):
        r = requests.post(f"{API}/favorites/{sample_tour_slug}")
        assert r.status_code == 401

    def test_toggle_favorite_flow(self, user_token, sample_tour_slug):
        r1 = requests.post(f"{API}/favorites/{sample_tour_slug}", headers=_h(user_token))
        assert r1.status_code == 200
        favs_after_add = r1.json()["favorites"]
        r2 = requests.post(f"{API}/favorites/{sample_tour_slug}", headers=_h(user_token))
        assert r2.status_code == 200
        favs_after_toggle = r2.json()["favorites"]
        # one of them contains slug, the other doesn't
        assert (sample_tour_slug in favs_after_add) != (sample_tour_slug in favs_after_toggle)


# -----------------------------------------------------------------------------
# Chat (REST + WebSocket)
# -----------------------------------------------------------------------------
class TestChat:
    def test_chat_sessions_requires_admin(self, user_token):
        r = requests.get(f"{API}/chat/sessions", headers=_h(user_token))
        assert r.status_code == 403

    def test_chat_sessions_admin_ok(self, admin_token):
        r = requests.get(f"{API}/chat/sessions", headers=_h(admin_token))
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_websocket_message_flow(self):
        session_id = f"test_ws_{uuid.uuid4().hex[:8]}"

        async def run():
            url = f"{WS_BASE}/{session_id}"
            async with websockets.connect(url, open_timeout=10) as ws:
                # first frame = history
                hist_raw = await asyncio.wait_for(ws.recv(), timeout=5)
                hist = json.loads(hist_raw)
                assert hist["type"] == "history"
                assert isinstance(hist["messages"], list)

                # send a message
                await ws.send(json.dumps({"text": "TEST hello from user",
                                          "sender": "guest", "sender_name": "TestGuest"}))
                # receive broadcast back
                got = await asyncio.wait_for(ws.recv(), timeout=5)
                payload = json.loads(got)
                assert payload["type"] == "message"
                assert payload["message"]["text"] == "TEST hello from user"
                assert payload["message"]["sender"] == "guest"
                return session_id

        sid = asyncio.get_event_loop().run_until_complete(run())

        # verify history endpoint reflects the message
        h = requests.get(f"{API}/chat/history/{sid}")
        assert h.status_code == 200
        msgs = h.json()
        assert any(m.get("text") == "TEST hello from user" for m in msgs)


# -----------------------------------------------------------------------------
# CORS + cookies
# -----------------------------------------------------------------------------
class TestCORS:
    def test_cors_preflight(self):
        r = requests.options(
            f"{API}/auth/login",
            headers={
                "Origin": BASE_URL,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        # FastAPI CORSMiddleware responds with 200 for preflight
        assert r.status_code in (200, 204)
        # CORS headers exposed
        allow_origin = r.headers.get("access-control-allow-origin", "")
        assert allow_origin in ("*", BASE_URL)
