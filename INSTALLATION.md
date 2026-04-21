# Timeout HRM - Enterprise Installation & Production Guide

This guide provides professional instructions for deploying **Timeout HRM** in production and development environments.

---

## 🚀 1. Quick Start (Plug & Play)

The easiest way to initialize the project is using the unified setup script from the root directory:

```bash
# Install core dependencies & initialize backend + frontend
npm run setup
```
*This command runs `npm install`, applies database migrations, and seeds the demo environment.*

---

## 🛠️ 2. Manual Configuration

### Prerequisites
- **Node.js:** v18.x or later
- **PostgreSQL:** v14.x or later (With `pgvector` for AI similarity search)
- **SMTP Server:** Required for notifications and OTP security.

### Environment Setup
1. **Backend:** Copy `backend/.env.example` to `backend/.env`
2. **Frontend:** Copy `frontend/.env.example` to `frontend/.env.local`

> [!IMPORTANT]
> **Production Secrets**: In production, always use `NODE_ENV=production` and generate 32-character random strings for `ACCESS_SECRET` and `REFRESH_SECRET`.

---

## 🧠 3. AI Assistant Setup

Timeout HRM supports a multi-provider AI architecture. You can configure this via **Admin Settings > AI Assistant** in the dashboard.

- **Demo Mode:** Works out of the box with no API keys.
- **Gemini (Recommended):** Get a free API key from [Google AI Studio](https://aistudio.google.com/).
- **Ollama:** Supports local LLM hosting (Llama 3, etc.) on `http://localhost:11434`.

---

## 📧 4. SMTP & Notifications

Standardize your notification flow by configuring SMTP in `backend/.env`.

| Variable | Description |
| :--- | :--- |
| `SMTP_HOST` | Your mail server host (e.g., `smtp.resend.com`) |
| `SMTP_PORT` | `587` (TLS) or `465` (SSL) |
| `SMTP_USER` | Your SMTP username |
| `SMTP_PASS` | Your SMTP password / API Key |

**Verification**: Use the **"Test SMTP"** button in **Admin Settings** to verify your configuration.

---

## 🚢 5. Production Deployment

### Frontend (Vercel)
1. Import the root folder into Vercel.
2. Set `Root Directory` to `frontend`.
3. Configure `NEXT_PUBLIC_API_URL` to point to your backend.
4. Build Command: `npm run build`

### Backend (Render/Docker)
1. Set the root directory to `backend`.
2. Build Command: `npm install && npm run db:generate`
3. Environment: Set `NODE_ENV=production` and all vars from `.env.example`.

---

## 🔍 6. Troubleshooting FAQ

**Q: Prisma migration fails on "vector" type?**  
A: Ensure your PostgreSQL instance has the `pgvector` extension enabled. Run `CREATE EXTENSION IF NOT EXISTS vector;` manually if needed.

**Q: 401 Unauthorized errors in frontend?**  
A: Check if `CLIENT_ORIGIN` in the backend exactly matches your frontend URL (including `https://` and trailing slashes).

**Q: Emails not being sent?**  
A: Check your SMTP credentials and ensure port `587` is open on your hosting provider's firewall.

---
© 2024 Timeout HRM. Enterprise-ready.
