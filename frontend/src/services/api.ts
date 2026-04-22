import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token';

const normalizeApiBaseUrl = (rawBaseUrl?: string) => {
  const trimmed = rawBaseUrl?.trim() ?? '';
  if (!trimmed) return '';
  const noTrailingSlash = trimmed.replace(/\/+$/, '');
  return /\/api$/i.test(noTrailingSlash)
    ? noTrailingSlash
    : `${noTrailingSlash}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post('/auth/refresh');
        const newAccessToken = refreshResponse.data?.accessToken;

        if (newAccessToken) {
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch {
        clearAccessToken();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
