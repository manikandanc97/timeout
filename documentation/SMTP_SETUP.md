# SMTP Setup

Configure SMTP values in `backend/.env`.

## Required Fields

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

## Recommended Sender Fields

- `SMTP_FROM_NAME`
- `SMTP_FROM_EMAIL`

If SMTP is not configured, the backend currently falls back to emulated email logging for local development.
