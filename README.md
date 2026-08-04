# VoteVerse AI – Smart Campus Electronic Voting Platform

> **Secure. Transparent. Smart Campus Democracy.**

VoteVerse AI is a production-ready, cloud-capable Electronic Voting Platform engineered for Colleges, Universities, and Educational Institutions.

---

## 🔑 Core Philosophy & Key Differentiators

- **NO Student Logins**: Students DO NOT create accounts or log in online.
- **Physical EVM Kiosks**: Voting is conducted physically inside campus kiosks using hardware-emulated EVM terminals.
- **Multi-Tenant Isolation**: Every college institution operates in an isolated environment with separate data records.
- **Vote Encryption**: Ballots are anonymized and encrypted with AES-256 to guarantee voter secrecy.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **UI & Styling**: Material UI (MUI v6), Glassmorphism Dark Blue/Purple Theme, Emotion
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with JWT Interceptors
- **Charts & Data**: Chart.js & React-Chartjs-2
- **Animations & FX**: Framer Motion & CSS Keyframes
- **Forms & Notifications**: React Hook Form, React Toastify

### Backend
- **Runtime**: Node.js & Express.js
- **Database ORM**: Sequelize ORM (Dual support for MySQL & SQLite)
- **Security & Protection**: JWT Authentication, bcrypt (salt rounds: 12), Helmet security headers, CORS, Express Rate Limiter
- **File Uploads**: Multer with file type validation
- **Data Import/Export**: XLSX (Excel processing) & PDFkit

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed     # Seeds database with Super Admin & MIT College test data
npm run dev      # Starts backend on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev      # Starts frontend on http://localhost:5173
```

---

## 🔐 Seed Login Credentials

| Role | Email | Password | Admin PIN |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@voteverse.ai` | `admin123` | N/A |
| **College Admin (MIT)** | `admin@mit.edu.in` | `college123` | `123456` |

---

## 🗳 Physical EVM Kiosk Specifications

1. **Verification**: Election officer verifies student by **Register Number** (e.g. `MITCS001`).
2. **Double Vote Prevention**: If already voted, displays **"Already Voted"**.
3. **EVM Candidate Screen**:
   - Vertical candidate cards with Photo, Candidate Name, Department, Symbol, and a **Large Green VOTE Button**.
   - **Numpad Shortcuts**: Press `1-9` to select candidates, press `Enter` to confirm.
   - **No Confirmation Popup**: Immediately saves vote upon press.
4. **Authentic EVM Beep**: Plays a synthesized 1-second 1000Hz EVM beep audio upon vote casting.
5. **20-Second Circular Reset**: Displays a progress ring counting down from 20 to 1 before locking screen and returning to `READY FOR NEXT VOTER`.
6. **Kiosk Security Exit & Lockout**:
   - Hidden Exit button requires the **Admin PIN** (`123456`).
   - 5 failed PIN attempts lock the exit option and log an alert for the College Admin.

---

## 📡 API Documentation Summary

### Auth & Public
- `POST /api/auth/register` – Register a new college institution
- `POST /api/auth/college/login` – College Admin JWT login
- `POST /api/auth/superadmin/login` – Super Admin login
- `GET /api/auth/verify` – Verify session token

### Super Admin
- `GET /api/superadmin/colleges` – List colleges (filter by status)
- `PUT /api/superadmin/colleges/:id/approve` – Approve college registration
- `PUT /api/superadmin/colleges/:id/reject` – Reject registration
- `PUT /api/superadmin/colleges/:id/suspend` – Suspend college
- `DELETE /api/superadmin/colleges/:id` – Delete college account
- `GET /api/superadmin/analytics` – Platform analytics

### College Dashboard
- `GET /api/students` – Get/filter students list
- `POST /api/students/import` – Excel import students
- `GET /api/students/export` – Excel export students
- `GET /api/candidates` – Get candidates
- `GET /api/elections` – Manage election lifecycle (start, pause, end, publish)
- `POST /api/booth/verify` – Verify student voting eligibility
- `POST /api/booth/vote` – Cast encrypted vote
- `POST /api/booth/verify-pin` – Validate EVM Kiosk exit PIN
- `GET /api/reports/results/:election_id` – Fetch election tally & department turnout
