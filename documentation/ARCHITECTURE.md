# Architecture Overview

## Monorepo Layout

- `frontend/`: Next.js application using the App Router, shared UI primitives, typed services, and route-level loading states.
- `backend/`: Express API using Prisma, layered services, middleware, controllers, and route modules.
- `documentation/`: Buyer documentation and marketplace support material.

## Frontend Structure

- `src/app/`: Route entry points and route-level loading shells.
- `src/components/`: Domain-driven UI grouped by feature area.
- `src/hooks/`: Reusable client hooks.
- `src/services/`: API clients and data access helpers.
- `src/types/`: Shared frontend types.
- `src/utils/`: Formatting and validation helpers.
- `src/constants/`: UI and product constants.
- `src/context/`: Global app providers.

## Backend Structure

- `src/routes/`: Express route registration by domain.
- `src/controllers/`: Request handlers coordinating validation and services.
- `src/services/`: Business logic and cross-domain operations.
- `src/services/payroll/`: Payroll-specific service modules.
- `src/middleware/`: Auth, role, validation, and error middleware.
- `src/validations/`: Request schema definitions.
- `src/config/`: Environment and configuration helpers.
- `src/lib/`: Shared backend utilities and seeded defaults.
- `prisma/`: Schema, migrations, and seed logic.
- `tests/`: Backend test suite.
- `scripts/`: Utility scripts intended for maintainers or setup workflows.
