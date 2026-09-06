# KisanSetu (खेतसेतु) 🌾
> **Smart India Hackathon 2026** — Problem Statement ID: **SIH26032**  
> *A Digital Coordination & Queue Management Platform for Indian Agricultural Procurement Centers*

---

## 📌 Problem Overview
Indian farmers frequently face significant hardships when bringing their harvest to government and APMC procurement centers:
- **Unpredictable Waiting Times**: Farmers often wait in line for hours or days without knowing their queue status.
- **Unnecessary Travel & Congestion**: Lack of clear procurement schedules leads to multiple physical trips and severe center congestion.
- **Opacity in Processing & Weighing**: Limited visibility into moisture testing, weighing slots, and MSP payment tracking creates uncertainty.
- **Center Overload**: Procurement center staff struggle to balance daily capacity, leading to bottlenecks during peak harvesting periods.

### 💡 The Solution
**KisanSetu** bridges the gap between farmers and agricultural procurement centers by providing:
1. **Intelligent Slot Recommendation & Booking**: Farmers can view center capacity and reserve dedicated arrival windows in advance.
2. **Live Digital Queue & Token Tracking**: Dynamic token issuance with estimated wait time and live progress updates.
3. **Transparent Procurement Tracking**: End-to-end tracking of crop arrival, quality grading, weighing, MSP valuation, and payment disbursement.
4. **Dedicated APMC / Center Staff Tools**: Real-time queue operation, slot capacity control, farmer verification, and throughput analytics.
5. **Hyper-Accessible Multilingual Interface**: Full bilingual support (English, Hindi, Marathi, Punjabi, Gujarati) with high contrast, large touch targets, and mobile-first civic design.

---

## 📁 Repository Architecture

The codebase is organized into three clean, dedicated modules:

```text
KisanSetu/
├── Frontend/           # Next.js farmer-facing portal & center management interface
├── backend/            # Node.js / Express API services & Firebase integration
├── admin panel/        # Administrative portal for center staff & state coordinators
└── README.MD           # Global project documentation (this file)
```

### 1. `Frontend/`
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 with bespoke civic-tech agricultural design system
- **Key Modules**:
  - `src/app/farmer/*`: Farmer authentication, center discovery via Google Maps, slot booking, live queue tracker, procurement status.
  - `src/app/staff/*`: Staff dashboard, live queue controller, slot capacity manager, farmer registry, reporting.
  - `src/components/GoogleMapComponent.tsx`: Interactive Google Maps integration with custom SVG center markers, radius filters, and center details.
  - `src/lib/languageContext.tsx` & `translations.ts`: Comprehensive localization engine.
  - `src/lib/mockData.ts`: Realistic APMC centers, crop MSPs, and sample booking records.

### 2. `backend/`
- **Framework**: Python 3.10+ & FastAPI (High-performance Async ASGI)
- **Database & Services**: MongoDB (Motor Async), Firebase Admin SDK (Server-side Auth), SlowAPI Rate Limiting
- **Responsibilities**:
  - Center capacity calculation and slot recommendation algorithm.
  - Double-booking prevention and atomic slot reservation.
  - Strict IP-based rate limiting on authentication and booking endpoints.
  - Live queue state machine and real-time WebSocket token broadcasting.
  - End-to-end procurement lifecycle tracking (weighbridge, grading, MSP).

### 3. `admin panel/`
- **Role**: High-level administrative operations and oversight
- **Responsibilities**:
  - Multi-center APMC oversight and district-level quota management.
  - Staff role provisioning, biometric/KYC verification policies, and audit logs.
  - Throughput analytics, average wait-time metrics, and bottleneck reporting.

---

## 🎨 UI Design System & Theme Permanence (Source of Truth)

The visual theme follows a high-contrast, Indian civic-tech agricultural aesthetic designed for clarity, trust, and field readability.

### Design Tokens & Color Palette
| Token | Hex Value | Usage |
|---|---|---|
| **Background** | `#f7f4ef` | Warm off-white / light neutral canvas |
| **Foreground / Text** | `#1a2319` | Dark charcoal for maximum readability |
| **Primary Brand** | `#1d6b3a` | Deep agricultural green (actions, badges, headers) |
| **Secondary Brand** | `#e8f0e9` | Soft herbal green (card accents, subtle highlights) |
| **Accent / Soil** | `#b87333` | Warm copper / harvest brown (indicators, alerts) |
| **Border / Dividers** | `#ddd9d2` | Neutral borders for clean card separation |

### Typography
- **Headings & Display**: `'Poppins', system-ui, sans-serif`
- **Body & Controls**: `'Inter', system-ui, sans-serif`

### Reusable UI System
All views strictly reuse the unified components in [Frontend/src/components/ui.tsx](file:///Frontend/src/components/ui.tsx):
- `<Button>`, `<Card>`, `<StatusBadge>`, `<Input>`, `<Timeline>`, `<MetricCard>`, `<Alert>`, `<Icon>`, `<Logo>`
- Layout Shells: `<FarmerShell>` for farmer screens and `<StaffShell>` for administrative screens.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 1. Running the Frontend
```bash
# Navigate to Frontend
cd Frontend

# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env.local and add your Google Maps API key
cp .env.example .env.local

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Running the Backend
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows (or 'source venv/bin/activate' on Linux/macOS)

# Install dependencies
pip install -r requirements.txt

# Run backend API server
uvicorn app.main:app --reload --port 8000

# (Optional) Seed demo data matching frontend mock data
python scripts/seed_demo_data.py
```
The API server will listen on [http://localhost:8000](http://localhost:8000) (Docs at `/docs`).

### 3. Running the Admin Panel
```bash
# Navigate to admin panel
cd "admin panel"

# Install dependencies
npm install

# Run admin dashboard
npm run dev
```

---

## 👥 User Workflows

### Farmer Journey
1. **Discover Center**: Explore nearby APMC centers on interactive Google Maps with real-time slot availability indicators.
2. **Smart Recommendation**: Select crop type (e.g., Wheat, Paddy, Mustard) and quantity to receive AI-recommended low-traffic time slots.
3. **Instant Token Booking**: Confirm booking and receive a digital token with QR verification.
4. **Live Queue Tracking**: Check queue position, current token being served, and estimated wait time before leaving home.
5. **Procurement & MSP Tracking**: Track weighing, quality certification, and direct bank transfer (DBT) payment status.

### Center Staff Journey
1. **Daily Overview**: View scheduled farmer arrivals, queue load, and capacity utilization.
2. **Queue Management**: Advance tokens (Call Next, In-Process, Completed, No-Show) with a single click.
3. **Slot Adjustments**: Increase or reduce capacity per time block in response to weather or equipment conditions.
4. **Farmer Verification**: Search farmer records by token ID, phone number, or Aadhaar reference.

---

## 📄 License & Attribution
Developed for **Smart India Hackathon 2026** (Problem Statement ID: SIH26032).  
All rights reserved.
