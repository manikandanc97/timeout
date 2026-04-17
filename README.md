# Timeout HRM - ThemeForest Ready

Timeout HRM is a full-stack Human Resource Management application built with Next.js, Express.js, and PostgreSQL.  
This package includes a modern dashboard, leave and payroll workflows, and organization management.

## Features

- Role-based HRM flows (`ADMIN`, `MANAGER`, `EMPLOYEE`)
- Employee directory with reporting hierarchy
- Department and team management
- Leave management (annual, sick, comp-off, maternity, paternity)
- Payroll and payslip workflow
- In-app notifications
- Theme customization (dark mode, accent, font presets)

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Axios
- **Backend:** Express.js, Prisma ORM, JWT auth, Socket.IO
- **Database:** PostgreSQL
- **Tooling:** npm workspaces, Prisma migrations, demo seed script

## Project Structure

```text
timeout/
  backend/
    prisma/
      migrations/
      seed.js
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      socket/
      server.js
    .env.example
  frontend/
    src/
      app/
      components/
      context/
      lib/
      services/
      types/
    .env.example
  package.json
  README.md
```

## Environment Variables

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and set values:

- `NODE_ENV` - `development` or `production`
- `PORT` - backend port (default `5000`)
- `DATABASE_URL` - PostgreSQL connection string
- `ACCESS_SECRET` - JWT access token secret
- `REFRESH_SECRET` - JWT refresh token secret
- `CLIENT_ORIGIN` - frontend URL for CORS

### Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local`:

- `NEXT_PUBLIC_API_URL` - backend API base URL (example: `http://localhost:5000/api`)

## Installation & Local Setup

1. Install dependencies (root, backend, frontend via workspaces):

```bash
npm install
```

2. Configure environment files:
   - `backend/.env` from `backend/.env.example`
   - `frontend/.env.local` from `frontend/.env.example`

3. Apply DB migrations:

```bash
npm run db:migrate -w backend
```

4. Seed demo data:

```bash
npm run seed
```

5. Start full stack:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000` and backend on `http://localhost:5000`.

## Demo Accounts

After seeding:

- **Admin:** `admin@acmehrm.com` / `demo1234`
- **Manager:** `manager@acmehrm.com` / `demo1234`
- **Employee:** `employee@acmehrm.com` / `demo1234`

Demo seed includes:

- Sample departments and teams
- Sample employees with reporting structure
- Leave balance + leave records
- Payroll sample entry

## API and Error Handling

- Standardized JSON error shape: `{ message, code }`
- Auth and role middleware now return consistent, user-friendly responses.
- Global `404` and error middleware added for clean API failures.

## Deployment Guide

### Frontend (Vercel)

- Import `frontend` as a Vercel project.
- Set:
  - `NEXT_PUBLIC_API_URL=https://<your-render-backend>/api`
- Build command: `npm run build`
- Start command: `npm run start`

### Backend (Render)

- Create a Web Service from `backend`.
- Set environment variables from `backend/.env.example`.
- Build command: `npm install`
- Start command: `npm run start`
- Add PostgreSQL and set `DATABASE_URL`.
- Run migrations: `npm run db:migrate`
- Optional demo seed: `npm run db:seed`

## ThemeForest Submission Checklist

- [x] No secrets committed; sample env files included
- [x] Reusable component-based UI structure
- [x] Seeded demo data for quick buyer evaluation
- [x] Consistent API error response shape
- [x] Workspace-level plug-and-play startup commands
- [x] Deployment documentation for Vercel + Render
- [ ] Run full QA pass on all screen sizes before packaging
- [ ] Capture polished screenshots and demo video for listing

