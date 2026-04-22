# Installation Guide

This file is the quick-start entry point for buyers. Expanded setup, deployment, SMTP, AI, and support guides are available inside [`documentation/`](./documentation/README.md).

## 1. Requirements

- Node.js `20.x` to `24.x`
- PostgreSQL `14+`
- npm `10+`

## 2. Environment Files

Create local environment files from the included templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

If your shell does not support `cp`, duplicate the files manually.

## 3. Install Dependencies

```bash
npm install
```

## 4. Prepare the Database

```bash
npm run db:migrate -w backend
npm run seed -w backend
```

## 5. Start the Product

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## 6. Next Reading

- [Deployment Guide](./documentation/DEPLOYMENT.md)
- [Demo Credentials](./documentation/DEMO_CREDENTIALS.md)
- [SMTP Setup](./documentation/SMTP_SETUP.md)
- [AI Provider Setup](./documentation/AI_PROVIDER_SETUP.md)
