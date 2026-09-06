# 🌾 KisanSetu Backend API

Production-ready, asynchronous backend service powering the **KisanSetu** procurement-centre coordination platform for farmers in Punjab.

Built with **FastAPI**, **MongoDB (Motor)**, **Firebase Admin SDK**, and **SlowAPI**.

---

## 📋 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Database Seeding](#-database-seeding)
- [Running Tests](#-running-tests)
- [API Documentation & Endpoints](#-api-documentation--endpoints)
- [Real-time WebSockets](#-real-time-websockets)
- [Security & Rate Limiting](#-security--rate-limiting)
- [Environment Configuration](#-environment-configuration)

---

## 🏛 Overview & Architecture

KisanSetu solves long waiting times and uncertainty at grain procurement centres (mandis) across Punjab. The backend exposes RESTful and WebSocket endpoints for:
1. **Farmer Portal**: Centre discovery, slot recommendations & booking, digital token generation, and live queue status.
2. **Staff / Admin Panel**: Mandi capacity management, live token call queue, weighbridge operations, dispute handling, and daily procurement logging.

```
       +---------------------------------------------+
       |             Next.js Frontend                |
       |  (Farmer PWA & Staff Dashboard on port 3000)|
       +----------------------+----------------------+
                              |
                     REST API | WebSockets (live queue)
                              v
       +---------------------------------------------+
       |            FastAPI Backend (:8000)          |
       |   +-------------------------------------+   |
       |   | SlowAPI Rate Limiter (IP-based)     |   |
       |   | Firebase Token Verification & RBAC  |   |
       |   | Centralized Error Normalization     |   |
       |   +-------------------------------------+   |
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |             MongoDB Database                |
       |    (Centres, Slots, Bookings, Queue,        |
       |     Procurements, Alerts, Notifications)    |
       +---------------------------------------------+
```

---

## ✨ Key Features

- **Double-Booking & Slot Conflict Prevention**: Atomic MongoDB operations ensure a farmer cannot double-book, nor exceed available slot capacity.
- **Strict Rate Limiting**: Dedicated rate limiting (5 req/min on `/auth/*`, 10 req/min on bookings) prevents credential stuffing, spam registrations, and bot scalping.
- **Strict Role-Based Access Control (RBAC)**: Enforces boundaries between `FARMER`, `CENTRE_STAFF`, `CENTRE_MANAGER`, and `ADMIN`.
- **Live Queue State Machine**: Enforces valid queue transitions (`WAITING` -> `ARRIVED` -> `PROCESSING` -> `COMPLETED`/`DELAYED`).
- **Audit Logging**: Every sensitive action (calling token, capacity change, delay flag) is recorded in MongoDB audit logs.
- **WebSocket Gateway**: Real-time push updates for centre queues without constant HTTP polling.
- **Zero Confidential Leakage**: Confidential API keys (Firebase private keys, Google Maps keys) are securely encapsulated on the backend.

---

## 📁 Project Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/                 # Versioned route handlers
│   │       ├── alerts.py       # Weather & operational alerts
│   │       ├── auth.py         # Token verification & rate-limited registration
│   │       ├── bookings.py     # Slot booking & cancellation
│   │       ├── centres.py      # Centre directory & slot listings
│   │       ├── dashboard.py    # Staff analytics & metrics
│   │       ├── farmers.py      # Farmer profiles & history
│   │       ├── notifications.py# Farmer notifications
│   │       ├── procurement.py  # Weighbridge & crop procurement steps
│   │       ├── queue.py        # Centre queue operations
│   │       ├── reports.py      # Daily summaries & receipts
│   │       ├── slots.py        # Slot capacity administration
│   │       ├── staff.py        # Mandi staff management
│   │       └── websocket.py    # Live WebSocket queue stream
│   ├── core/
│   │   ├── config.py           # Pydantic Settings & environment parsing
│   │   ├── database.py         # Motor async connection & index creation
│   │   ├── exceptions.py       # Standardized application exceptions & error codes
│   │   ├── permissions.py      # RBAC dependencies (FARMER, STAFF, ADMIN)
│   │   └── security.py         # Firebase Admin SDK token verification
│   ├── schemas/                # Pydantic request/response models
│   ├── services/               # Business logic & atomic database workflows
│   ├── utils/                  # Datetime formatting (IST), IDs, pagination
│   └── main.py                 # FastAPI application factory & middleware setup
├── scripts/
│   └── seed_demo_data.py       # Seeds Punjab centres, slots, farmers, and tokens
├── tests/                      # Pytest suite
│   ├── conftest.py             # Test fixtures & test DB setup
│   ├── test_auth.py            # Auth & rate limit tests
│   ├── test_bookings.py        # Booking atomicity & conflict tests
│   ├── test_procurement.py     # Procurement lifecycle tests
│   ├── test_queue.py           # Queue state machine tests
│   ├── test_rbac.py            # Cross-tenant & role isolation tests
│   └── test_slots.py           # Slot capacity & overlap tests
├── .env.example                # Example environment configuration
├── requirements.txt            # Pinned dependencies
└── README.md                   # This documentation
```

---

## ⚙ Prerequisites

- **Python 3.10+** (Python 3.11 recommended)
- **MongoDB 6.0+** (Running locally on port 27017 or MongoDB Atlas connection URI)
- Optional: Firebase Service Account credentials for live production auth (mock auth supported for local dev)

---

## 🚀 Installation & Setup

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   # Copy example template
   cp .env.example .env
   ```
   Edit `.env` as needed. Default values connect to `mongodb://localhost:27017/kisansetu`.

---

## 🏃 Running the Application

Start the development server with live reload:

```bash
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Interactive Redoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

---

## 🌱 Database Seeding

Populate the database with realistic sample Punjab mandis (Amritsar, Tarn Taran, Jalandhar, etc.), slots, queue tokens, and initial users matching the frontend mock data:

```bash
python scripts/seed_demo_data.py
```

This ensures the application runs immediately with realistic Punjab agriculture data even before real users register.

---

## 🧪 Running Tests

Execute the comprehensive automated test suite:

```bash
pytest -v
```

Tests cover:
- **Health check & Auth verification**: Validates endpoint health and phone masking.
- **Booking conflicts**: Ensures two bookings cannot be made simultaneously by the same farmer and full slots reject new bookings.
- **Queue State Machine**: Confirms illegal queue transitions raise exceptions and only one token can be in processing at a time.
- **Procurement steps**: Validates weighbridge entry, quality inspection, and completion.
- **RBAC**: Ensures farmers cannot inspect or cancel other farmers' bookings.
- **Slot operations**: Validates slot overlap prevention and capacity reduction rules.

---

## 📡 API Documentation & Endpoints

| Category | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/health` | Public | System status and database ping |
| **Config** | `GET` | `/api/v1/config/maps` | Public | Secure retrieval of Maps API key |
| **Auth** | `POST` | `/api/v1/auth/verify-token` | Public (Rate-limited: 5/min) | Verify Firebase ID token & register |
| **Auth** | `GET` | `/api/v1/auth/me` | Authenticated | Fetch current user profile & role |
| **Centres** | `GET` | `/api/v1/centres` | Public | List centres with status and queue counts |
| **Centres** | `GET` | `/api/v1/centres/{id}` | Public | Detailed centre metrics & operating hours |
| **Centres** | `GET` | `/api/v1/centres/{id}/slots` | Public | Available procurement slots by date |
| **Bookings**| `POST` | `/api/v1/bookings` | Farmer (Rate-limited: 10/min) | Book a slot atomically |
| **Bookings**| `GET` | `/api/v1/bookings` | Farmer / Staff | List farmer bookings or centre bookings |
| **Bookings**| `GET` | `/api/v1/bookings/{id}` | Owner / Staff | Get booking details & QR token |
| **Bookings**| `POST` | `/api/v1/bookings/{id}/cancel` | Owner / Manager | Cancel booking & release slot |
| **Queue** | `GET` | `/api/v1/queue/{centre_id}` | Public / Staff | Full live queue state & now serving |
| **Queue** | `POST` | `/api/v1/queue/{id}/status` | Staff | Update queue status (arrived/processing/etc) |
| **Queue** | `POST` | `/api/v1/queue/{centre_id}/call-next` | Staff | Call next waiting farmer to bay |
| **Queue** | `POST` | `/api/v1/queue/{id}/delay` | Staff | Mark entry delayed with reason |
| **Procure** | `GET` | `/api/v1/procurement/{id}` | Staff / Owner | Procurement status & audit history |
| **Procure** | `PATCH`| `/api/v1/procurement/{id}/details` | Staff | Record weight, moisture %, and grade |
| **Alerts** | `GET` | `/api/v1/alerts` | Public | Active mandi & weather announcements |
| **Reports** | `GET` | `/api/v1/reports/daily` | Staff / Manager | Daily procurement tally & stats |
| **WS** | `WS` | `/api/v1/ws/queue/{centre_id}` | Public / Staff | Real-time WebSocket stream |

---

## 🔒 Security & Rate Limiting

1. **SlowAPI IP-based Rate Limiter**:
   - `AUTH_RATE_LIMIT=5/minute`: Thwarts automated registration spam, credential stuffing, and OTP flooding attacks.
   - `BOOKING_RATE_LIMIT=10/minute`: Prevents slot hoarding bots.
   - Global limit defaults to `60/minute`.
2. **Role Validation (RBAC)**:
   - Evaluated server-side against MongoDB user records, **never** trusting unverified client claims.
3. **Data Sanitization**:
   - Phone numbers are masked in non-administrative responses (e.g. `98••••3210`).
   - Detailed stack traces are disabled in production; client receives clean JSON responses with standard error codes.

---

## 📄 License
Internal use for KisanSetu Platform.
