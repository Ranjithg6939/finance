# FinVeda — Loan & Finance Management System (Frontend)

Modern React + Vite frontend application for FinVeda Loan & Finance Management.

## Tech Stack
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS + Lucide Icons
- **Routing**: React Router 7 (SPA with rewrites)
- **Charts**: Recharts
- **HTTP Client**: Axios

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
The compiled static assets will be in the `dist/` directory.

---

## Environment Variables

Copy `.env.example` to `.env` if connecting to an external production backend:

```bash
# Optional: Set to your live backend service URL (e.g. Render, Railway, VPS)
VITE_API_URL=https://your-backend-api.com
```

> **Note**: If `VITE_API_URL` is empty or unset, the frontend runs in self-contained preview mode with full UI navigation and built-in demo credentials.

---

## Demo Accounts (Offline / Preview Mode)
- **Administrator**: `admin@finance.com` / `password123` (or `admin` / `password123`)
- **Staff Executive**: `staff@finance.com` / `password123` (or `staff` / `password123`)

---

## Vercel Deployment Settings
- **Root Directory**: `.` (Root)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
