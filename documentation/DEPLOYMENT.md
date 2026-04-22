# Deployment Guide

## Frontend Deployment

Deploy the `frontend/` app to Vercel, Netlify, or any Node-compatible Next.js host.

Required variables:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL` (optional if sockets share the same origin as the API)

Recommended settings:

- Install command: `npm install`
- Build command: `npm run build -w frontend`
- Output: framework-managed by Next.js

## Backend Deployment

Deploy the `backend/` app to Render, Railway, Fly.io, Docker, or a VPS.

Required variables:

- `DATABASE_URL`
- `ACCESS_SECRET`
- `REFRESH_SECRET`
- `CLIENT_ORIGINS`
- `FRONTEND_URL`

Optional production variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_NAME`
- `SMTP_FROM_EMAIL`
- `API_BASE_URL`
- `INTERNAL_API_BASE_URL`

## Database

Run migrations before first launch:

```bash
npm run db:migrate -w backend
```

Seed demo data when needed:

```bash
npm run seed -w backend
```
