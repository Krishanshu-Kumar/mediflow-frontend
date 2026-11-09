import api from "../global/apiHelper";
import useApi from "../global/useApi";

// The token is attached by the apiHelper interceptor.

/**
 * GET /roles/ — one page of roles as { items, total }; `total` counts every role matching the
 * filters, not just this page. `tenantId` is an optional filter.
 *
 * If the backend still answers with a plain array (no paging yet), the filtering and paging
 * are done here instead, so the page works either way.
 */
export const getRoles = async ({ skip = 0, limit = 10, tenantId } = {}) => {
  const data = await api.get("/roles/", {
    params: { skip, limit, tenant_id: tenantId },
  });
  if (!Array.isArray(data)) return { items: data?.items ?? [], total: data?.total ?? 0 };

  const matching = data.filter((role) => !tenantId || role.tenant_id === tenantId);
  return { items: matching.slice(skip, skip + limit), total: matching.length };
};

/** POST /roles/ with { tenant_id, name }. Returns the created role. */
export const createRole = ({ tenantId, name }) => api.post("/roles/", { tenant_id: tenantId, name });

/** PUT /roles/{id} with { name }. Returns the updated role. */
export const updateRole = (roleId, { name }) => api.put(`/roles/${roleId}`, { name });

/** PATCH /roles/{id}/status?is_active=... — same shape as the tenant status route. Returns the updated role. */
export const setRoleStatus = (roleId, isActive) =>
  api.patch(`/roles/${roleId}/status`, undefined, { params: { is_active: isActive } });

// One hook per API: returns { call, loading } so the page can show <Loader show={loading} />.
export const useRoles = () => useApi(getRoles);
export const useSetRoleStatus = () => useApi(setRoleStatus);
export const useCreateRole = () => useApi(createRole);
export const useUpdateRole = () => useApi(updateRole);
