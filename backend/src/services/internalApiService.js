const resolveApiBaseUrl = () => {
  const configured = process.env.INTERNAL_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  const port = process.env.PORT?.trim() || '5000';
  return `http://localhost:${port}/api`;
};

const buildHeaders = (context, hasBody) => {
  const headers = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const authHeader = context?.authorizationHeader;
  if (authHeader) {
    headers.Authorization = authHeader;
  }
  const cookieHeader = context?.cookieHeader;
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }
  return headers;
};

export async function callInternalApi(path, options = {}, context = {}) {
  const baseUrl = resolveApiBaseUrl();
  const url = `${baseUrl}${path}`;
  const method = options.method ?? 'GET';
  const body = options.body ?? null;

  const response = await fetch(url, {
    method,
    headers: buildHeaders(context, body != null),
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      parsed?.message ??
      parsed?.error ??
      `Internal API request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = parsed;
    throw error;
  }

  return parsed;
}
