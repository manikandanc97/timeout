# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project currently tracks releases manually.

## [1.0.0] - 2026-04-22

### Added

- Initial full-stack Timeout HRM release as a workspace monorepo with separate `frontend` and `backend` applications.
- Next.js frontend with dashboard, attendance, leave management, payroll, reports, holidays, teams, settings, and AI assistant flows.
- Express and Prisma backend with authentication, leave workflows, attendance APIs, payroll services, holiday management, and organization administration.
- Buyer-facing setup and support documentation under `documentation/`.
- ThemeForest packaging workflow with:
  - `documentation/BUYER_GUIDE.html`
  - `documentation/THEMEFOREST_SUBMISSION_CHECKLIST.md`
  - `themeforest/preview-assets/README.md`
  - `scripts/export-themeforest.ps1`
- Root packaging command:
  - `npm run themeforest:package`
- Vercel Speed Insights integration in the root Next.js app layout.

### Changed

- Optimized dashboard render flow to reduce duplicate fetches, hydration cost, and above-the-fold client work.
- Consolidated admin dashboard snapshot refresh behavior so multiple admin widgets no longer refetch the same stats independently.
- Removed duplicate employee dashboard server fetches for welcome and upcoming holiday sections.
- Replaced heavier Recharts-based dashboard visuals with lighter SVG chart rendering for faster initial dashboard interaction.
- Deferred lower-priority interactive shell pieces such as the floating AI assistant and lazily loaded admin pending-request sections.
- Improved responsive behavior across dashboard cards, chart blocks, and mobile sidebar navigation.
- Improved ThemeForest-readiness of the repository by excluding local artifacts and generating a clean marketplace ZIP.

### Fixed

- Mobile dashboard sidebar opening and closing behavior on responsive layouts.
- Dashboard mini-chart overflow on small screens.
- Tooltip consistency across employee dashboard mini charts and leave balance visuals.
- Upcoming holidays list being artificially capped instead of showing the full upcoming set.
- Shared page shell overflow causing unwanted bottom scroll space on some pages.
- Scroll behavior issues affecting dashboard pages, including My Leaves and other shell-based pages.
- Employee sidebar visibility rules so the `Teams` menu item no longer appears for employee users.
- TypeScript compatibility issue in `DashboardShell` related to deferred idle loading logic.

### Notes

- Current package version in `package.json` is `1.0.0`.
- Future releases can append new sections above this entry using the same format.
