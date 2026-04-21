# Installation & Production Setup Guide

This guide provides step-by-step instructions for deploying Timeout HRM in production and local environments.

---

## Prerequisites

- **Node.js:** v18.x or later
- **PostgreSQL:** v14.x or later (PostGIS/pgvector optional but recommended for AI features)
- **SMTP Server:** Recommended for notification and password reset features.

---

## 1. Local Development Setup

### Install Dependencies
Run from the root directory:
```bash
npm install
```

### Configure Environment
1. **Backend:** Copy `backend/.env.example` to `backend/.env`
2. **Frontend:** Copy `frontend/.env.example` to `frontend/.env.local`

### Database Setup
```bash
# Generate Prisma Client
npm run db:generate -w backend

# Run Migrations
npm run db:migrate -w backend

# Optional: Seed Demo Data
npm run db:seed -w backend
```

### Start Development Server
```bash
npm run dev
```

---

## 2. Production Hardening

### Security Best Practices
- **JWT Secrets:** Use long, random strings for `ACCESS_SECRET` and `REFRESH_SECRET`.
- **CORS:** Set `CLIENT_ORIGIN` to your exact frontend domain in production.
- **Node Environment:** Always set `NODE_ENV=production`.

### AI Assistant Configuration
Timeout HRM supports multiple AI providers. Configure the active provider in **Admin Settings > AI Assistant**.
- **pgvector:** If your database supports `pgvector`, similarity search will be used. If not, the system automatically falls back to keyword-based `ILIKE` search.

### SMTP Testing
Before launching, go to **Admin Settings > General** and use the **"Test SMTP"** button to send a verification email and ensure your mail server is ready.

---

## 3. Testing & Stability

To run the automated test suite and check code coverage:
```bash
# Run all backend tests
npm run test -w backend

# Run coverage report
npm run test:coverage -w backend
```
*Goal: Maintain 85%+ coverage for all critical business logic.*

---

## 4. Troubleshooting

- **Prisma EPERM error:** Ensure the backend server is stopped before running `npm install`.
- **403 Forbidden:** Check if you have the required role (MANAGER or ADMIN) for the endpoint.
- **SMTP Errors:** Ensure your firewall allows outbound traffic on the SMTP port (usually 587 or 465).

---
© 2024 Timeout HRM. Ready for ThemeForest.
