import api from "../global/apiHelper";
import { fetchLimit, toPage } from "../global/paged";
import useApi from "../global/useApi";
import { getMasterCodes } from "../masterCode/masterCodeApi";

// All /tenants routes require a Super Admin token (attached by the apiHelper interceptor).

/**
 * GET /tenants/ — one page of tenants as { items, hasNext } (the backend sends a plain array
 * with no total). It only filters by `activeOnly`; search and the other filters are not
 * supported by the backend.
 */
export const getTenantsPage = async ({ skip = 0, limit = 10, activeOnly = false } = {}) =>
  toPage(
    await api.get("/tenants/", { params: { skip, limit: fetchLimit(limit), active_only: activeOnly } }),
    limit,
  );

/** GET /tenants/ — a plain array (up to `limit`, max 500), for dropdowns that need them all. */
export const getTenants = ({ skip = 0, limit = 500, activeOnly = false } = {}) =>
  api.get("/tenants/", { params: { skip, limit, active_only: activeOnly } });

export const getTenant = (tenantId) => api.get(`/tenants/${tenantId}`);

/** POST /tenants/ with { name, slug, plan_code }. 409 if the slug is taken. */
export const createTenant = ({ name, slug, planCode }) =>
  api.post("/tenants/", { name, slug, plan_code: planCode });

/** PUT /tenants/{id}: partial update of { name, plan_code }. The slug can't change once set. */
export const updateTenant = (tenantId, { name, planCode }) =>
  api.put(`/tenants/${tenantId}`, { name, plan_code: planCode });

export const setTenantStatus = (tenantId, isActive) =>
  api.patch(`/tenants/${tenantId}/status`, undefined, { params: { is_active: isActive } });

// Tenant plans are master codes in category 1000 (1001 Free, 1002 Pro, 1003 Enterprise).
const PLAN_CATEGORY = 1000;

export const getPlans = () => getMasterCodes({ categoryCode: PLAN_CATEGORY });

// One hook per API: returns { call, loading } so the page can show <Loader show={loading} />.
export const useTenants = () => useApi(getTenants);
export const useTenantsPage = () => useApi(getTenantsPage);
export const useTenant = () => useApi(getTenant);
export const useCreateTenant = () => useApi(createTenant);
export const useUpdateTenant = () => useApi(updateTenant);
export const useSetTenantStatus = () => useApi(setTenantStatus);
export const usePlans = () => useApi(getPlans);
