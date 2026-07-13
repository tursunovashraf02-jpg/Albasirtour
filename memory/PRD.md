# AL BASIR TOUR — PRD

## Original Problem Statement
Premium multilingual (UZ / EN / RU) tourism website for AL BASIR TOUR.
Full responsive, PWA-ready, with public site, client cabinet, admin panel,
online chat, booking + payment (QR / link / bank), tours catalogue with
discounts and packages (Bronze/Silver/Gold/VIP), countries showcase, gallery,
blog/news, FAQ, reviews with ratings, partners bar, contact page with map.
Booking status flow: Pending → Confirmed → Cancelled → Completed.

Stack (chosen): React + Tailwind + Framer Motion + FastAPI + MongoDB.

## User Personas
- **Traveller (UZ / RU / EN)** — browses tours, books a journey, uploads receipt, tracks status in cabinet.
- **Admin (super)** — manages tours, bookings, payments, users/roles, settings.
- **Operator** — manages bookings, payments, chat.
- **Content manager** — blog, gallery, news, FAQ.

## Core Requirements
- 3-language i18n (UZ / EN / RU) with LocalStorage persistence
- Hero slider (Turkey / UAE / Saudi Arabia / Malaysia / Indonesia / Egypt / Thailand / Qatar)
- Tours catalogue with search + country + package filters and discount badges
- Country editorial pages, gallery lightbox, blog + FAQ
- Booking form → payment step (QR / link / bank) → receipt upload → admin verify
- JWT email/password auth **and** Emergent-managed Google OAuth
- Client cabinet (overview, bookings, favourites, profile)
- Admin dashboard (stats, bookings, payments, tours, users, messages, settings)
- Real-time WebSocket chat (client ↔ admin) with persisted history
- Dark / Light mode, sticky glass header, luxury Playfair Display + Manrope typography, gold accent

## What's Been Implemented (2026-02)
### Backend (`/app/backend/`)
- Auth: register / login / me / logout / refresh via cookies + Bearer + Emergent Google session exchange
- Tours (CRUD), Countries (CRUD), Blog (CRUD), FAQ, Reviews, Testimonials, Partners, Gallery
- Bookings: create (guest + authed), mine, all (admin), status update
- Payments: receipt upload, admin verify (auto-confirms booking)
- Settings (payment QR / link / bank / contacts)
- Public stats + admin stats (7-day series, status breakdown)
- Users list + role change (admin only)
- Favourites toggle
- Real-time chat: WebSocket `/api/ws/chat/{session_id}` + REST fallback
- Seed data on startup (8 tours, 8 countries, 6 reviews, 4 FAQs, blog, gallery, partners, testimonials, settings)
- Admin + demo user seeded from `.env`

### Frontend (`/app/frontend/`)
- Full public site: Home (hero + partners + tours + discounts + why-us + stats + countries bento + testimonials + journal + CTA), Tours, Tour detail (with favourites), Countries, Country detail, Gallery (lightbox + categories), Blog, Blog detail, FAQ, About, Contact (with Google Maps embed)
- Booking flow: 3-step wizard (form → payment method → receipt upload → success)
- Auth: Login, Register, Google OAuth callback route (`/auth/callback`)
- Cabinet: Overview / Bookings / Favourites / Profile
- Admin: Overview (Recharts bar + pie), Bookings table with status changer, Payments verify, Tours viewer, Users role editor, Messages (chat sessions), Settings editor
- ChatWidget (floating, WebSocket, persists history)
- Dark / Light theme with persistence
- i18n (UZ default, EN, RU) with instant switching

### Testing
- Backend: **47/47 pytest tests passing (100%)** — auth, RBAC, bookings, payments, WebSocket, admin stats, settings, favourites, chat sessions all verified

## Prioritized Backlog
### P1 — Deferred (nice-to-have polish)
- Full Admin CRUD forms for tours / countries / blog (currently viewer only)
- Payments: ownership check (any authed user can attach receipt to another booking) — testing agent flagged
- Booking: validate `tour_slug` references an existing tour
- Consider redacting `bank_details` from public GET `/settings`

### P2 — Post-MVP enhancements
- Real integrations: Resend/SendGrid email, Telegram Bot API notifications, Object storage for image uploads
- Payment gateway automation (Click / Payme / Uzum API)
- SMS via Eskiz.uz / Twilio
- PWA manifest + service worker
- SEO: dynamic sitemap.xml, per-tour Open Graph, Schema.org
- Coupons / promo codes
- Push notifications
- Multi-currency

## Test Credentials
- Admin: `admin@albasir.com` / `Admin@2026`
- Demo user: `user@albasir.com` / `User@2026`
