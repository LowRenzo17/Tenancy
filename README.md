# EstateLedger — Property Management Platform

> A full-stack property management system for Kenyan landlords and tenants.  
> Built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

[![GitHub repo](https://img.shields.io/badge/GitHub-sixnine--coder%2Ftenancy--slate-181717?logo=github)](https://github.com/sixnine-coder/tenancy-slate)

---

## Features

### Owner Portal
- **Dashboard** — occupancy overview, revenue metrics, recent activity
- **Properties** — add, edit and delete rental units
- **Tenants** — onboard tenants, generate temporary passwords, send welcome emails
- **Maintenance** — track and update maintenance requests in real-time
- **Rent Calendar** — visualise due dates per tenant
- **Analytics** — revenue trends, occupancy rates, payment performance
- **Payment History** — confirm or reject tenant payment submissions; real amounts, no mock data
- **Maintenance Costs** — log and track repair expenses per property
- **Reports** — export PDF and CSV financial/maintenance reports
- **Reminders** — schedule and broadcast rent reminders
- **Messaging** — broadcast announcements to all tenants
- **Login History & Trusted Devices** — security audit trail

### Tenant Portal
- **My Dashboard** — lease status, upcoming payment, quick actions
- **My Lease** — inline lease preview modal + branded PDF print
- **My Payments** — submit payment with reference number, view history (real data), download receipts
- **Request Maintenance** — submit and track maintenance requests
- **Messages** — chat with property manager
- **Login History & Trusted Devices** — personal security controls

### Platform-wide
- Role-based access control (owner / tenant)
- Google OAuth 2.0 + TOTP two-factor authentication
- JWT-based session management
- Silent auto-logout after **15 minutes** of inactivity (no modal)
- Real-time updates via **Socket.IO**
- Sonner toast notifications (no `alert()` anywhere)
- SEO metadata via `react-helmet-async`
- Responsive layout — mobile drawer sidebar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| State | React Context (AuthContext, DataContext, SocketContext, ChatContext) |
| Real-time | Socket.IO client |
| Charts | Recharts |
| 3D | Three.js + React Three Fiber |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcrypt, Google OAuth, TOTP (speakeasy) |
| Email | Nodemailer (Gmail SMTP) |
| Real-time | Socket.IO server |

---

## Project Structure

```
tenancy-slate/
├── backend/                  # Express API server
│   ├── middleware/           # auth.js (protect, authorize)
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Tenant.js
│   │   ├── Property.js
│   │   ├── Payment.js
│   │   ├── Maintenance.js
│   │   └── Conversation.js / Message.js
│   ├── routes/               # REST API routes
│   │   ├── auth.js
│   │   ├── properties.js
│   │   ├── tenants.js
│   │   ├── payments.js
│   │   ├── maintenance.js
│   │   ├── messages.js
│   │   ├── analytics.js
│   │   └── chat.js
│   ├── utils/                # emailUtils, etc.
│   └── .env                  # ⚠️ Not committed — see Environment Variables
│
└── frontend/
    └── client/src/
        ├── App.jsx            # Router + inactivity auto-logout
        ├── contexts/          # Auth, Data, Socket, Chat
        ├── components/        # Sidebar, Card, StatusBadge, SEO, etc.
        ├── pages/             # All page-level components
        │   ├── (owner)        Dashboard, Properties, Tenants, Maintenance,
        │   │                  Calendar, Analytics, Reports, PaymentHistory,
        │   │                  MaintenanceExpenses, Reminders, Communication
        │   └── (tenant)       TenantDashboard, MyLease, MyPayments,
        │                      SubmitMaintenance, Chat
        └── lib/               # api.js, exportUtils.js, utils.ts
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas URI)
- Gmail account with App Password (for email)

### 1. Clone the repository

```bash
git clone https://github.com/sixnine-coder/tenancy-slate.git
cd tenancy-slate
```

### 2. Configure environment variables

Create `backend/.env` from the template below:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/tenancy-slate
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
TOTP_WINDOW=1

# Gmail SMTP — use a 16-character App Password, not your login password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password_here
```

For the frontend, create `frontend/client/.env` (optional):

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Install dependencies

```bash
# Root (concurrent dev runner)
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Run in development

```bash
# From the root — starts both servers concurrently
npm run dev
```

Or individually:

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | ✅ | `development` or `production` |
| `PORT` | ✅ | Backend server port (default: 5000) |
| `FRONTEND_URL` | ✅ | Frontend origin for CORS |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Strong random secret for JWT signing |
| `JWT_EXPIRE` | ✅ | Token expiry (e.g. `7d`) |
| `TOTP_WINDOW` | ✅ | TOTP tolerance window (default: `1`) |
| `SMTP_HOST` | ✅ | SMTP server host |
| `SMTP_PORT` | ✅ | SMTP port (587 for TLS) |
| `SMTP_USER` | ✅ | Sender email address |
| `SMTP_PASSWORD` | ✅ | Gmail App Password (16 chars) |
| `VITE_API_URL` | Frontend | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Google OAuth client ID |

---

## MongoDB Atlas Free keep-alive

Atlas Free clusters pause only after 30 days with no database connections. This
repository includes a GitHub Actions workflow that requests the backend health
endpoint every Monday, which makes the backend establish its normal MongoDB
connection.

Before the workflow can run, add this GitHub Actions repository secret:

| Secret | Value |
|---|---|
| `BACKEND_HEALTHCHECK_URL` | Your public backend health endpoint, for example `https://api.example.com/api/health` |

In GitHub, open **Settings → Secrets and variables → Actions**, add the secret,
then open **Actions → Keep MongoDB Atlas active** and run it once to verify it
returns successfully. The endpoint must be publicly reachable over HTTPS.

---

## Payment Flow

```
Tenant submits payment (reference + method)
        │
        ▼
POST /api/payments/tenant-pay
→ Creates Payment { status: "pending" }
→ Appends to Tenant.paymentHistory { status: "pending" }
→ Socket emits payment-created (owner sees it instantly)
        │
        ▼
Owner reviews in Payment History page
        │
   ┌────┴────┐
Confirm     Reject
   │           │
status:      status:
"paid"      "overdue"
rentStatus   rentStatus
= "paid"    = "overdue"
```

---

## Security Notes

- All `.env` files are git-ignored — **never commit secrets**
- Passwords hashed with bcrypt (12 rounds)
- JWT verified on every protected route
- Role-based `authorize()` middleware on all sensitive routes
- Google OAuth token verified server-side
- TOTP with time-window tolerance for 2FA
- Silent 15-minute inactivity auto-logout (client-side)
- All user-facing notifications use `sonner` toasts — no `alert()` calls

---

## License

MIT © [sixnine-coder](https://github.com/sixnine-coder)
