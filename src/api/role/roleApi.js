import api from "../global/apiHelper";
import { fetchLimit, toPage } from "../global/paged";
import useApi from "../global/useApi";

// The token is attached by the apiHelper interceptor.

/**
 * GET /roles/ — one page of roles as { items, hasNext } (the backend sends a plain array with
 * no total). `tenantId` is an optional filter.
 */
export const getRoles = async ({ skip = 0, limit = 10, tenantId } = {}) =>
  toPage(
    await api.get("/roles/", {
      params: { skip, limit: fetchLimit(limit), tenant_id: tenantId },
    }),
    limit,
  );

/** POST /roles/ with { tenant_id, name }. Returns the created role. */
export const createRole = ({ tenantId, name }) => api.post("/roles/", { tenant_id: tenantId, name });

/** PUT /roles/{id} with { name }. Returns the updated role. */
export const updateRole = (roleId, { name }) => api.put(`/roles/${roleId}`, { name });

/** PATCH /roles/{id}/status?is_active=... — same shape as the tenant status route. Returns the updated role. */
export const setRoleStatus = (roleId, isActive) =>
  api.patch(`/roles/${roleId}/status`, undefined, { params: { is_active: isActive } });

/**
 * GET /roles/{id}/permissions — the permissions granted to a role. Returns an array of
 * permissions; a bare list of codes (strings) is turned into { code } objects.
 */
export const getRolePermissions = async (roleId) => {
  const data = await api.get(`/roles/${roleId}/permissions`);
  const list = Array.isArray(data) ? data : (data?.items ?? data?.permissions ?? []);
  return list.map((item) => (typeof item === "string" ? { code: item } : item));
};

/**
 * PUT /roles/{id}/permissions with { permission_codes: [...] } — replaces the role's whole
 * permission set with exactly these codes.
 */
export const setRolePermissions = (roleId, codes) =>
  api.put(`/roles/${roleId}/permissions`, { permission_codes: codes });

// One hook per API: returns { call, loading } so the page can show <Loader show={loading} />.
export const useRoles = () => useApi(getRoles);
export const useSetRoleStatus = () => useApi(setRoleStatus);
export const useRolePermissions = () => useApi(getRolePermissions);
export const useSetRolePermissions = () => useApi(setRolePermissions);
export const useCreateRole = () => useApi(createRole);
export const useUpdateRole = () => useApi(updateRole);
