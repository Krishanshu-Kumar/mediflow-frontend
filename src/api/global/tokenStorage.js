/**
 * Where the session lives in the browser. apiHelper reads the token from here on every
 * request, so it is attached no matter which page loads first.
 */

const TOKEN_KEY = "mf_access_token";
const TENANT_KEY = "mf_tenant_slug";

// "Remember me" keeps the session in localStorage; otherwise it ends with the tab.
const stores = () => (typeof window === "undefined" ? [] : [window.localStorage, window.sessionStorage]);

function read(key) {
  for (const store of stores()) {
    try {
      const value = store.getItem(key);
      if (value) return value;
    } catch {}
  }
  return null;
}

function write(key, value, remember) {
  try {
    (remember ? window.localStorage : window.sessionStorage).setItem(key, value);
  } catch {}
}

export const getAccessToken = () => read(TOKEN_KEY);
export const getTenantSlug = () => read(TENANT_KEY);

/** Replace any previous session with this one. */
export function saveSession({ accessToken, tenantSlug, remember = false }) {
  clearSession();
  write(TOKEN_KEY, accessToken, remember);
  write(TENANT_KEY, tenantSlug, remember);
}

export function clearSession() {
  for (const store of stores()) {
    try {
      store.removeItem(TOKEN_KEY);
      store.removeItem(TENANT_KEY);
    } catch {}
  }
}

/* ---------------------------- expiry helpers ---------------------------- */

/** True when the token is a JWT whose `exp` has passed. Non-JWT tokens are never treated as expired. */
export function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

// A one-shot note for the login page: "you were signed out because your session expired".
const EXPIRED_KEY = "mf_session_expired";

export function markSessionExpired() {
  try {
    window.sessionStorage.setItem(EXPIRED_KEY, "1");
  } catch {}
}

/** Returns true once, then forgets it. */
export function consumeSessionExpired() {
  try {
    const expired = window.sessionStorage.getItem(EXPIRED_KEY) === "1";
    window.sessionStorage.removeItem(EXPIRED_KEY);
    return expired;
  } catch {
    return false;
  }
}
