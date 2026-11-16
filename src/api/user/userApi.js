import api from "../global/apiHelper";
import useApi from "../global/useApi";

// The token is attached by the apiHelper interceptor.

/**
 * GET /users/ — one page of users as { items, total }; `total` counts every user, not just this
 * page.
 *
 * If the backend still answers with a plain array (no paging yet), the paging is done here
 * instead, so the page works either way.
 */
export const getUsers = async ({ skip = 0, limit = 10, tenantId, roleId, isActive } = {}) => {
  const data = await api.get("/users/", {
    params: { skip, limit, tenant_id: tenantId, role_id: roleId, is_active: isActive },
  });
  if (!Array.isArray(data)) return { items: data?.items ?? [], total: data?.total ?? 0 };

  const matching = data.filter(
    (user) =>
      (!tenantId || user.tenant_id === tenantId) &&
      (!roleId || user.role_id === roleId) &&
      (isActive === undefined || Boolean(user.is_active) === isActive),
  );
  return { items: matching.slice(skip, skip + limit), total: matching.length };
};

export const useUsers = () => useApi(getUsers);
