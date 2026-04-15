/**
 * Socket.IO runs on the HTTP origin (not under `/api`).
 * Prefer `NEXT_PUBLIC_SOCKET_URL`; otherwise strip `/api` from the REST base URL.
 */
export function getSocketBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const api = process.env.NEXT_PUBLIC_API_URL?.trim() ?? '';
  if (api) {
    const stripped = api.replace(/\/api\/?$/i, '').replace(/\/$/, '');
    if (stripped) return stripped;
  }

  return 'http://localhost:5000';
}
