const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

const SENSITIVE_USER_FIELDS = new Set([
  "password",
  "confirmPassword",
  "phone",
  "altPhone",
  "address",
  "dob",
  "education",
  "university",
  "profession",
  "experience",
  "employmentStatus",
  "skills",
  "profileImage",
  "refreshToken",
  "accessToken",
]);

const sanitizeUser = (user) => {
  if (!user || typeof user !== "object") return null;

  const safe = {
    _id: user._id || user.id || null,
    role: user.role || null,
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

const clearLegacyCookies = () => {
  ["accessToken", "refreshToken", "user"].forEach((name) => {
    document.cookie = `${name}=; path=/; Max-Age=0; SameSite=Lax`;
  });
};

const clearAllStorage = () => {
  [TOKEN_KEY, USER_KEY, "refreshToken"].forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
  clearLegacyCookies();
};

export const getAccessToken = () =>
  sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;

export const getStoredUser = () =>
  parseUser(sessionStorage.getItem(USER_KEY)) ||
  parseUser(localStorage.getItem(USER_KEY));

export const saveAuthSession = ({ accessToken, user, rememberMe = false }) => {
  clearAuthSession();

  const storage = getStorage(rememberMe);

  if (accessToken) storage.setItem(TOKEN_KEY, accessToken);

  const safeUser = sanitizeUser(user);
  if (safeUser) storage.setItem(USER_KEY, JSON.stringify(safeUser));
};

export const clearAuthSession = () => {
  clearAllStorage();
};

export const getAuthData = () => ({
  token: getAccessToken(),
  user: getStoredUser(),
});

export const setAccessToken = (token, rememberMe = true) => {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);

  if (token) {
    getStorage(rememberMe).setItem(TOKEN_KEY, token);
  }
};
