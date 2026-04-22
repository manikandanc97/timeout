# Troubleshooting

## Backend does not start

Check:

- `backend/.env` exists
- `DATABASE_URL` is valid
- `ACCESS_SECRET` and `REFRESH_SECRET` are set
- PostgreSQL is reachable

## Frontend cannot reach the API

Check:

- `frontend/.env.local` exists
- `NEXT_PUBLIC_API_URL` points to the backend
- Backend CORS origins include your frontend URL

## Login returns unauthorized

Check:

- Backend and frontend are using the same environment pair
- Cookies are allowed in the browser
- `CLIENT_ORIGINS` and `FRONTEND_URL` are aligned

## SMTP test fails

Check:

- Host, port, username, and password are correct
- Your provider allows SMTP/API relay from the server
- Firewall rules allow the configured port

## AI assistant does not return live responses

Check:

- The provider is enabled in admin settings
- API credentials are configured
- Demo mode is not selected if you expect live provider output
