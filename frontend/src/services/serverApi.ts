import { cache } from 'react';
import { cookies } from 'next/headers';

const TOKEN_REFRESH_BUFFER_SECONDS = 30;

const getTokenExpiry = (token?: string) => {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(
      Buffer.from(normalizedPayload, 'base64').toString('utf-8'),
    );

    return typeof decodedPayload.exp === 'number' ? decodedPayload.exp : null;
  } catch {
    return null;
  }
};

const hasFreshAccessToken = (token?: string) => {
  const expiry = getTokenExpiry(token);

  if (!expiry) {
    return false;
  }

  return expiry > Math.floor(Date.now() / 1000) + TOKEN_REFRESH_BUFFER_SECONDS;
};

const refreshAccessToken = cache(async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error('API URL missing');
  }

  const cookieStore = await cookies();

  const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      Cookie: cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join('; '),
    },
    cache: 'no-store',
  });

  if (!refreshRes.ok) {
    return null;
  }

  const refreshData = await refreshRes.json();

  return typeof refreshData.accessToken === 'string'
    ? refreshData.accessToken
    : null;
});

export async function serverFetch<T = unknown>(endpoint: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error('API URL missing');
  }

  const cookieStore = await cookies();

  let accessToken = cookieStore.get('accessToken')?.value;
  let usedRefreshToken = false;

  if (!hasFreshAccessToken(accessToken)) {
    accessToken = await refreshAccessToken();
    usedRefreshToken = true;
  }

  if (!accessToken) {
    throw new Error('Session expired. Please login again.');
  }

  let res = await fetch(`${baseUrl}${endpoint}`, {
    method: 'GET',
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
    cache: 'no-store',
    credentials: 'include',
  });

  if ((res.status === 401 || res.status === 403) && !usedRefreshToken) {
    accessToken = await refreshAccessToken();

    if (!accessToken) {
      throw new Error('Session expired. Please login again.');
    }

    res = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API failed: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data as T;
}
