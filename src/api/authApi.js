import api, { ApiError, setAuthTokenProvider, setUnauthorizedHandler } from "./apiHelper";

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

export function clearSession() {
  for (const store of stores()) {
    try {
      store.removeItem(TOKEN_KEY);
      store.removeItem(TENANT_KEY);
    } catch {}
  }
}

/** POST /auth/login. The first call can be slow while the free-tier backend wakes up. */
export async function login({ tenantSlug, email, password, remember = false }) {
  const body = await api.post(
    "/auth/login",
    { tenant_slug: tenantSlug, email, password },
    { auth: false, timeout: 60000 },
  );
  // The spec says { access_token }, but errors come wrapped in an envelope, so accept `data` too.
  const access_token = body?.access_token ?? body?.data?.access_token;
  if (!access_token) throw new ApiError("Unexpected response from the server.", { data: body });

  clearSession();
  write(TOKEN_KEY, access_token, remember);
  write(TENANT_KEY, tenantSlug, remember);
}

export const getCurrentUser = () => api.get("/auth/me");

export function logout() {
  const slug = getTenantSlug();
  clearSession();
  window.location.assign(slug ? `/${slug}/login` : "/login");
}

// Wire the interceptors: attach the stored token, and drop the session on a 401.
setAuthTokenProvider(getAccessToken);
setUnauthorizedHandler(logout);
