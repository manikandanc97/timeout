function parseClientOrigins() {
  const raw =
    process.env.CLIENT_ORIGINS?.trim() ||
    process.env.CLIENT_ORIGIN?.trim() ||
    '';

  const origins = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (origins.length > 0) return origins;
  return ['http://localhost:3000'];
}

const clientOrigins = parseClientOrigins();

export const env = {
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: Number(process.env.PORT || 5000),
  clientOrigins,
  clientOrigin: clientOrigins[0],
  apiBaseUrl: process.env.API_BASE_URL?.trim() || `http://localhost:${process.env.PORT || 5000}/api`,
  frontendUrl: process.env.FRONTEND_URL?.trim() || clientOrigins[0] || 'http://localhost:3000',
};

export function requireEnv(name) {
  const value = process.env[name];
  if (value == null || String(value).trim() === '') {
    throw new Error(
      `[config] Missing or empty environment variable: ${name}. Copy backend/.env.example to backend/.env and set all values.`,
    );
  }
}
