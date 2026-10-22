import api from "./apiHelper";
import useApi from "./useApi";

// All /tenants routes require a Super Admin token (attached by the apiHelper interceptor).

/** GET /tenants/ — a plain array; the backend has no search or total count yet. */
export const getTenants = ({ skip = 0, limit = 500, activeOnly = false } = {}) =>
  api.get("/tenants/", { params: { skip, limit, active_only: activeOnly } });

export const getTenant = (tenantId) => api.get(`/tenants/${tenantId}`);

/** POST /tenants/ with { name, slug, plan_code }. 409 if the slug is taken. */
export const createTenant = ({ name, slug, planCode }) =>
  api.post("/tenants/", { name, slug, plan_code: planCode });

/** PUT /tenants/{id}: partial update of { name, slug, plan_code }. */
export const updateTenant = (tenantId, { name, slug, planCode }) =>
  api.put(`/tenants/${tenantId}`, { name, slug, plan_code: planCode });

export const setTenantStatus = (tenantId, isActive) =>
  api.patch(`/tenants/${tenantId}/status`, undefined, { params: { is_active: isActive } });

// Tenant plans are master codes in category 1000 (1001 Free, 1002 Pro, 1003 Enterprise).
const PLAN_CATEGORY = 1000;

export const getPlans = () =>
  api.get("/settings/master-codes/", { params: { category_code: PLAN_CATEGORY } });

// One hook per API: returns { call, loading } so the page can show <Loader show={loading} />.
export const useTenants = () => useApi(getTenants);
export const useTenant = () => useApi(getTenant);
export const useCreateTenant = () => useApi(createTenant);
export const useUpdateTenant = () => useApi(updateTenant);
export const useSetTenantStatus = () => useApi(setTenantStatus);
export const usePlans = () => useApi(getPlans);
