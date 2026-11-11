import api from "../global/apiHelper";
import useApi from "../global/useApi";

// The token is attached by the apiHelper interceptor.
// Permissions are global (not per tenant) and are identified by their `code`, e.g. "user.create".

/** GET /permissions/ — every permission as an array. `scope` ("platform" | "tenant") is optional. */
export const getPermissions = async ({ scope } = {}) => {
  const data = await api.get("/permissions/", { params: { scope } });
  return Array.isArray(data) ? data : (data?.items ?? []);
};

/**
 * POST /permissions/ with { code, description, scope, display_name? }.
 * `code` looks like "resource.action". Returns the created permission.
 */
export const createPermission = ({ code, description, scope, displayName }) =>
  api.post("/permissions/", {
    code,
    description,
    scope,
    display_name: displayName || null,
  });

/**
 * PUT /permissions/{code} with any of { description, display_name, scope, is_active }.
 * The code itself can't change. Returns the updated permission.
 */
export const updatePermission = (code, { description, displayName, scope, isActive } = {}) =>
  api.put(`/permissions/${code}`, {
    description,
    display_name: displayName,
    scope,
    is_active: isActive,
  });

/** DELETE /permissions/{code}. */
export const deletePermission = (code) => api.delete(`/permissions/${code}`);

// One hook per API: returns { call, loading } so the page can show <Loader show={loading} />.
export const usePermissions = () => useApi(getPermissions);
export const useCreatePermission = () => useApi(createPermission);
export const useUpdatePermission = () => useApi(updatePermission);
export const useDeletePermission = () => useApi(deletePermission);
