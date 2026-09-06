# KisanSetu Admin Panel 🏛️
> *Centralized Management & Operations Portal for APMC Procurement Centers*

The **Admin Panel** provides dedicated operational workflows for procurement center supervisors, APMC officials, and district agricultural administrators in Punjab.

Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, configured to run on **Port 3002** with real-time WebSocket live queue updates.

---

## 📋 Core Capabilities & Modules

1. **Overview Dashboard (`/dashboard`)**:
   - District KPIs (total arrivals, pending queue load, MSP disbursement).
   - Real-time Yard Intake Utilization circular gauge.
   - Active Token Dispatch Quick-Console ("Now Serving" & "Call Next").
2. **Live Queue Controller (`/queue`)**:
   - Real-time token caller with live WebSocket updates (`ws://localhost:8000/api/v1/ws/queue/{centre_id}`).
   - Gate check-in, bay assignment (Bay 1 / Bay 2), delay notices, and completion.
3. **Slot & Capacity Manager (`/slots`)**:
   - Visual time block grid with intake quotas and progress bars.
   - Quota limit adjustment and emergency weather/yard closures.
4. **Farmer Verification Registry (`/farmers`)**:
   - Search by farmer name, token number, phone, or Aadhaar reference.
   - Passbook verification and gate check-in status.
5. **Weighbridge & Quality Grading (`/procurement`)**:
   - Gross and tare vehicle weights with automatic net produce calculation.
   - Moisture meter reading assessment (%) and quality grading (Grade A / Standard).
   - Direct Bank Transfer (DBT) MSP tally calculation and printable procurement receipt (Form 8-A).
6. **Mandi Directory (`/centres`)**:
   - Multi-centre APMC overview with operational status (Open, Limited, Closed).
7. **Broadcast Announcements (`/alerts`)**:
   - Push urgent weather disruption notices and mandi intake delays directly to mobile screens.
8. **Reports & Audit Trail (`/reports`)**:
   - Daily procurement reconciliation by crop (Wheat, Paddy, Mustard).
   - Immutable, tamper-evident staff operational audit log with IST timestamps.
9. **Centre Settings (`/settings`)**:
   - Daily gate timings, weighbridge bay allocations, and notification dispatch policies.

---

## 🚀 Getting Started

```bash
# 1. Navigate to admin panel
cd "admin panel"

# 2. Install dependencies (if not already installed)
npm install

# 3. Run development server
npm run dev
```

The portal will be live at **[http://localhost:3002](http://localhost:3002)**.

---

## 🔗 Architecture & Port Map

- **Frontend (Farmer & Staff PWA)**: `http://localhost:3000`
- **Admin Panel (District & Mandi Supervisor)**: `http://localhost:3002`
- **Backend (FastAPI & MongoDB)**: `http://localhost:8000` (Docs at `/docs`)
