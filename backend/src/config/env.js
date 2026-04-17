export const env = {
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN?.trim() || 'http://localhost:3000',
};

export function requireEnv(name) {
  const value = process.env[name];
  if (value == null || String(value).trim() === '') {
    throw new Error(
      `[config] Missing or empty environment variable: ${name}. Copy backend/.env.example to backend/.env and set all values.`,
    );
  }
}
