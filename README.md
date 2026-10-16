# Tejashwini Portfolio — Full Node.js Backend & Studio OS

A production-grade, high-performance **Node.js + Express** backend and **Studio OS Admin Portal** engineered for Tejashwini's 3D Generalist & Motion Graphics Portfolio.

---

## 🌟 Key Architecture & Features

- **⚡ Core Runtime & Framework**: Node.js (v20+ / v24) with **Express.js**, following clean layered MVC architecture.
- **💾 Zero-Config Persistent Database**: Embedded **Native SQLite** (`node:sqlite`) with WAL mode enabled. No external database servers or C++ build tools required.
- **🔐 Secure Authentication**: Stateless JWT (JSON Web Tokens) with `bcryptjs` password hashing and brute-force protection.
- **📥 Client Inquiries CRM**:
  - Live capture of client project briefs, contact details, project categories, and budget scopes.
  - Workflow status management (`New`, `In Discussion`, `Proposal Sent`, `Won / Accepted`, `Completed`, `Archived`).
  - Search, filter by category/status, pagination, and internal admin notes.
  - RFC 4180 compliant **One-Click CSV Export** for CRM or spreadsheet analysis.
- **🎨 Portfolio Showcase CMS**:
  - Full CRUD operations for portfolio projects.
  - Seamless drag-and-drop / file upload support for renders and thumbnails (`/uploads`).
  - Automatic synchronization with frontend case-study modals.
- **📧 Automated Email Notifications**:
  - Instant dispatch to `tejashwini.vfx@gmail.com` on every client brief submission via **Nodemailer**.
  - Built-in console preview mode for local development.
- **🛡️ Production Security**:
  - **Helmet** for HTTP security headers.
  - **CORS** protection with customizable origin.
  - **Express-Rate-Limit** protecting inquiry submissions and login against spam and brute-force attacks.
- **📊 Real-Time Metrics & Diagnostics**:
  - Active pipeline deal counters, total estimated pipeline value (₹), server uptime, RSS memory telemetry, and health check endpoint (`/api/health`).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` (already pre-configured with default settings):
```bash
cp .env.example .env
```

### 3. Launch Development Server
```bash
# Starts server with native hot-reload watching
npm run dev
```

### 4. Launch Production Server
```bash
npm start
```

Once running, access:
- **Public Portfolio**: [http://localhost:5000/](http://localhost:5000/)
- **Studio OS (Admin Portal)**: [http://localhost:5000/admin](http://localhost:5000/admin)
- **System Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Default Admin Credentials

The database automatically initializes and seeds a default superadmin account on first run:

- **Email**: `admin@tejashwini.art`
- **Password**: `Admin@2025!`

*(You can change your password anytime directly inside the Admin Dashboard profile dropdown).*

---

## 📂 Project Directory Structure

```text
├── frontend/                          # All website and admin UI files
│   ├── index.html                     # Public portfolio website
│   ├── index  edited abhi 1.html      # Legacy portfolio filename
│   ├── admin.html                     # Legacy admin page
│   ├── admin.css                      # Legacy admin stylesheet
│   ├── admin.js                       # Legacy admin script
│   ├── styles/                        # CSS stylesheets
│   ├── js/                            # Frontend interactive logic
│   ├── assets/                        # Images, renders, icons
│   └── admin/                         # Studio OS Admin Portal
│       ├── index.html
│       ├── admin.css
│       └── admin.js
├── backend/                           # All server and API source files
│   ├── server.js                      # Main Express application entry point
│   └── src/
│       ├── config/                    # Environment and database setup
│       ├── controllers/               # API request handlers
│       ├── middlewares/               # Authentication, errors, and upload handling
│       ├── models/                    # Database models
│       ├── routes/                    # API route definitions
│       ├── services/                  # Email and other services
│       ├── utils/                     # Shared server utilities
│       └── scripts/                   # Backend validation scripts
├── data/                              # SQLite persistent storage (database.sqlite)
├── uploads/                           # Uploaded media assets & thumbnails
├── .env                               # Environment configurations
├── .env.example                       # Template environment variables
└── package.json                       # Scripts and dependencies
```

---

## 📡 RESTful API Reference

### 1. Inquiries & CRM Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/inquiries` | Public (Rate Limited) | Submit a new creative brief from portfolio |
| `GET` | `/api/inquiries` | Bearer Token | List all inquiries (supports `status`, `search`, `page`, `limit`) |
| `GET` | `/api/inquiries/:id` | Bearer Token | Get full inquiry brief details |
| `PATCH` | `/api/inquiries/:id/status` | Bearer Token | Update workflow status & internal notes |
| `DELETE` | `/api/inquiries/:id` | Bearer Token | Delete an inquiry |
| `GET` | `/api/inquiries/export/csv` | Bearer Token | Download RFC 4180 CSV export of all inquiries |

### 2. Portfolio Projects Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Public | List portfolio showcase projects |
| `GET` | `/api/projects/:id` | Public | Get single project case-study details |
| `POST` | `/api/projects` | Bearer Token | Create and publish a new portfolio project |
| `PUT` | `/api/projects/:id` | Bearer Token | Update project details |
| `DELETE` | `/api/projects/:id` | Bearer Token | Delete project from showcase |

### 3. Authentication & Profile
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public (Rate Limited) | Authenticate admin, returns JWT |
| `GET` | `/api/auth/me` | Bearer Token | Verify current token and session info |
| `POST` | `/api/auth/change-password` | Bearer Token | Change admin password |
| `PUT` | `/api/auth/profile` | Bearer Token | Update admin name/email |

### 4. System & Diagnostics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server uptime, database connectivity & version |
| `GET` | `/api/stats/dashboard` | Bearer Token | Aggregated KPI stats & memory diagnostics |
| `POST` | `/api/stats/telemetry` | Public | Client event tracking |
| `POST` | `/api/upload` | Bearer Token | Upload image or video asset |

---

## 🧪 Running Automated Tests

Run the built-in validation suite anytime:
```bash
node backend/src/scripts/testServer.js
```
This tests database connectivity, API health, authentication, inquiry submission, CRM queries, CSV export, and static file delivery.

---

## 🌐 Production Deployment Guide

### Deploying with PM2 (Ubuntu/Debian VPS)
```bash
# Install PM2 process manager
npm install -g pm2

# Start server as a cluster / daemon
pm2 start server.js --name "tejashwini-backend"

# Setup auto-restart on system reboot
pm2 startup
pm2 save
```

### Deploying to Render / Railway / Fly.io
1. Connect your Git repository.
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Add environment variables from `.env` in the platform dashboard.
5. Persistent Disk: Mount `/data` if using ephemeral container hosts so SQLite file persists across redeploys.
