# ThemeForest Submission Checklist

Use this checklist when preparing the marketplace submission assets for Timeout HRM.

## 1. Main Upload ZIP

Generate the clean buyer package:

```powershell
npm run themeforest:package
```

This creates:

- `dist/themeforest/upload/timeout-hrm-main.zip`
- `dist/themeforest/preview-assets/README.md`
- `dist/themeforest/preview-assets/checklist.txt`

## 2. Files Included In The Main ZIP

The generated main ZIP contains:

- `backend/`
- `frontend/`
- `documentation/`
- `README.md`
- `INSTALLATION.md`
- `.env.example`
- `package.json`
- `package-lock.json`
- `vercel.json` when present

It excludes:

- `node_modules/`
- `.next/`
- local `.env` files
- local `.env.local` files
- `coverage/`
- TypeScript build cache files
- other workstation-only artifacts

## 3. Upload Form Assets You Still Need To Provide Manually

ThemeForest also expects presentation assets in the upload form:

- Cover image
- 3 or more preview screenshots
- Live preview URL
- Item title
- Item description
- Tags
- Category and attributes
- Price

## 4. Recommended Preview Asset Set

Prepare these files outside the main ZIP:

- `01-cover-homepage.png`
- `02-dashboard-overview.png`
- `03-employee-directory.png`
- `04-attendance-and-leave.png`
- `05-payroll-and-reports.png`
- `06-mobile-responsive.png`

## 5. Final Checks Before Submission

- Demo URL is fast and publicly accessible
- No secrets exist inside shipped files
- Buyer setup works from the included docs
- Responsive layout looks polished on desktop and mobile
- All major pages load without broken states
- Example env files are included for frontend and backend
- Documentation opens correctly from `documentation/BUYER_GUIDE.html`
