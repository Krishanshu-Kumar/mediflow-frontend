import api, { ApiError, setUnauthorizedHandler } from "./apiHelper";
import { clearSession, getTenantSlug, saveSession } from "./tokenStorage";
import useApi from "./useApi";

export { clearSession, getAccessToken, getTenantSlug } from "./tokenStorage";

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

  saveSession({ accessToken: access_token, tenantSlug, remember });
}

export const getCurrentUser = () => api.get("/auth/me");

// One hook per API: returns { call, loading } so the page can show <Loader show={loading} />.
export const useLogin = () => useApi(login);
export const useCurrentUser = () => useApi(getCurrentUser);

export function logout() {
  const slug = getTenantSlug();
  clearSession();
  window.location.assign(slug ? `/${slug}/login` : "/login");
}

// Drop the session on a 401. (The token itself is attached by apiHelper.)
setUnauthorizedHandler(logout);
