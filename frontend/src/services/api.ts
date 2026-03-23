import { clearAccessToken, getAccessToken, setAccessToken } from '@/lib/token';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
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

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await api.post(
          '/auth/refresh',
          {},
          { withCredentials: true },
        );

        const newToken = res.data.accessToken;
        setAccessToken(newToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };

        return api(originalRequest);
      } catch (error) {
        clearAccessToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
