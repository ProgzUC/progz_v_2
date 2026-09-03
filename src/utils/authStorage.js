const USER_KEY = "user";
const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const normalizeRole = (role) => {
  const value = String(role || "").toLowerCase();
  if (value === "instructor") return "trainer";
  return value;
};

const sanitizeUser = (user) => {
  if (!user || typeof user !== "object") return null;

  const safe = {
    _id: user._id || user.id || null,
    role: normalizeRole(user.role) || null,
    name: user.name || null,
  };

  return safe._id && safe.role ? safe : null;
};

const getStorage = (rememberMe) => (rememberMe ? localStorage : sessionStorage);

const parseUser = (raw) => {
  if (!raw) return null;
  try {
    return sanitizeUser(JSON.parse(raw));
  } catch {
    return null;
  }
};

const clearAllStorage = () => {
  [USER_KEY, TOKEN_KEY, REFRESH_TOKEN_KEY].forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
};

export const getAccessToken = () => null;
export const getRefreshToken = () => null;

export const getStoredUser = () =>
  parseUser(sessionStorage.getItem(USER_KEY)) ||
  parseUser(localStorage.getItem(USER_KEY));

export const saveAuthSession = ({ user, rememberMe = false }) => {
  clearAuthSession();

  const storage = getStorage(rememberMe);
  const safeUser = sanitizeUser(user);
  if (safeUser) storage.setItem(USER_KEY, JSON.stringify(safeUser));
};

export const clearAuthSession = () => {
  clearAllStorage();
};

export const getAuthData = () => {
  const user = getStoredUser();
  return {
    user,
    isAuthenticated: !!user,
  };
};

export const setAccessToken = () => {};
export const setTokens = () => {};
