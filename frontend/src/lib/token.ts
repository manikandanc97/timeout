let accessToken: string | null = null;

const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
const ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS = 15 * 60;

const setBrowserAccessTokenCookie = (token: string) => {
  if (typeof document === 'undefined') return;
  const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${ACCESS_TOKEN_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureAttr}`;
};

const clearBrowserAccessTokenCookie = () => {
  if (typeof document === 'undefined') return;
  const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secureAttr}`;
};

export const setAccessToken = (token: string) => {
  accessToken = token;
  setBrowserAccessTokenCookie(token);
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
  clearBrowserAccessTokenCookie();
};
