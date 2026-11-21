import api from "../global/apiHelper";
import { fetchLimit, toPage } from "../global/paged";
import useApi from "../global/useApi";

// The token is attached by the apiHelper interceptor.

/**
 * GET /users/ — one page of users as { items, hasNext } (the backend sends a plain array with
 * no total). The backend filters by tenant and status ("active" / "inactive" / "all"); the role
 * filter isn't supported there, so it is applied to the rows of the page here.
 */
export const getUsers = async ({ skip = 0, limit = 10, tenantId, roleId, isActive } = {}) => {
  const data = await api.get("/users/", {
    params: {
      skip,
      limit: fetchLimit(limit),
      tenant_id: tenantId,
      status: isActive === undefined ? "all" : isActive ? "active" : "inactive",
    },
  });
  const { items, hasNext } = toPage(data, limit);
  return { items: roleId ? items.filter((user) => user.role_id === roleId) : items, hasNext };
};

export const useUsers = () => useApi(getUsers);
