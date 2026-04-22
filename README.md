# Timeout HRM

Timeout HRM is a premium full-stack HRM SaaS product prepared for marketplace delivery. The repository is organized as a clean workspace monorepo with separate frontend and backend applications, production documentation, environment templates, Prisma migrations, and buyer setup guides.

## Project Structure

```text
timeout-hrm/
├── backend/            Express API, Prisma schema, services, tests, scripts
├── documentation/      Buyer guides, deployment docs, support and setup help
├── frontend/           Next.js application, UI system, app routes, client services
├── .env.example        Root setup reference
├── INSTALLATION.md     Quick installation entry guide
├── package.json        Workspace orchestration scripts
└── README.md
```

## Quick Start

```bash
npm install
npm run db:migrate -w backend
npm run seed -w backend
npm run dev
```

## Demo Credentials

Demo account details are documented in [documentation/DEMO_CREDENTIALS.md](./documentation/DEMO_CREDENTIALS.md).

## Documentation

- [Installation Guide](./INSTALLATION.md)
- [Documentation Index](./documentation/README.md)
- [Deployment Guide](./documentation/DEPLOYMENT.md)
- [Architecture Guide](./documentation/ARCHITECTURE.md)
- [SMTP Setup](./documentation/SMTP_SETUP.md)
- [AI Provider Setup](./documentation/AI_PROVIDER_SETUP.md)
- [Support Guide](./documentation/SUPPORT.md)

## Workspace Commands

```bash
npm run dev
npm run build
npm run test
npm run seed
npm run themeforest:package
```

## Buyer Notes

- Frontend and backend ship as clearly separated applications.
- Prisma migrations are included under `backend/prisma/migrations`.
- Example environment files are included for both apps.
- The repository excludes local build artifacts and workstation-only folders.
- Use `npm run themeforest:package` to generate a clean marketplace ZIP in `dist/themeforest/upload/`.
