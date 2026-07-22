const TOKEN_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};

const USER_KEY = "user";

const REMEMBER_DAYS = 30;

const setCookie = (name, value, maxAgeDays) => {
  if (value == null || value === "") return;

  const encoded = encodeURIComponent(value);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const sameSite = "; SameSite=Lax";

  if (maxAgeDays) {
    const maxAge = maxAgeDays * 24 * 60 * 60;
    document.cookie = `${name}=${encoded}; path=/; Max-Age=${maxAge}${sameSite}${secure}`;
    return;
  }

  document.cookie = `${name}=${encoded}; path=/${sameSite}${secure}`;
};

const getCookie = (name) => {
  const prefix = `${name}=`;
  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }

  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; path=/; Max-Age=0; SameSite=Lax`;
};

const parseUser = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readLegacyToken = (key) =>
  sessionStorage.getItem(key) ||
  localStorage.getItem(key) ||
  null;

const readLegacyUser = () =>
  parseUser(sessionStorage.getItem(USER_KEY)) ||
  parseUser(localStorage.getItem(USER_KEY));

const clearLegacyStorage = () => {
  [TOKEN_KEYS.accessToken, TOKEN_KEYS.refreshToken, USER_KEY].forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};

export const getAccessToken = () => {
  const cookieToken = getCookie(TOKEN_KEYS.accessToken);
  if (cookieToken) return cookieToken;

  const legacyToken = readLegacyToken(TOKEN_KEYS.accessToken);
  if (legacyToken) {
    setCookie(TOKEN_KEYS.accessToken, legacyToken, REMEMBER_DAYS);
    sessionStorage.removeItem(TOKEN_KEYS.accessToken);
    localStorage.removeItem(TOKEN_KEYS.accessToken);
  }

  return legacyToken;
};

export const getRefreshToken = () => {
  const cookieToken = getCookie(TOKEN_KEYS.refreshToken);
  if (cookieToken) return cookieToken;

  const legacyToken = readLegacyToken(TOKEN_KEYS.refreshToken);
  if (legacyToken) {
    setCookie(TOKEN_KEYS.refreshToken, legacyToken, REMEMBER_DAYS);
    sessionStorage.removeItem(TOKEN_KEYS.refreshToken);
    localStorage.removeItem(TOKEN_KEYS.refreshToken);
  }

  return legacyToken;
};

export const getStoredUser = () => {
  const cookieUser = parseUser(getCookie(USER_KEY));
  if (cookieUser) return cookieUser;

  const legacyUser = readLegacyUser();
  if (legacyUser) {
    setCookie(USER_KEY, JSON.stringify(legacyUser), REMEMBER_DAYS);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_KEY);
  }

  return legacyUser;
};

export const saveAuthSession = ({ accessToken, refreshToken, user, rememberMe = true }) => {
  clearAuthSession();

  const persistDays = rememberMe ? REMEMBER_DAYS : null;

  if (accessToken) setCookie(TOKEN_KEYS.accessToken, accessToken, persistDays);
  if (refreshToken) setCookie(TOKEN_KEYS.refreshToken, refreshToken, persistDays);
  if (user) setCookie(USER_KEY, JSON.stringify(user), persistDays);
};

export const clearAuthSession = () => {
  deleteCookie(TOKEN_KEYS.accessToken);
  deleteCookie(TOKEN_KEYS.refreshToken);
  deleteCookie(USER_KEY);
  clearLegacyStorage();
};

export const getAuthData = () => ({
  token: getAccessToken(),
  user: getStoredUser(),
  refreshToken: getRefreshToken(),
});

export const setAccessToken = (token) => {
  if (token) {
    setCookie(TOKEN_KEYS.accessToken, token, REMEMBER_DAYS);
    return;
  }
  deleteCookie(TOKEN_KEYS.accessToken);
  sessionStorage.removeItem(TOKEN_KEYS.accessToken);
  localStorage.removeItem(TOKEN_KEYS.accessToken);
};
