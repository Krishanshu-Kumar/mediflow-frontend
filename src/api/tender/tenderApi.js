import api from "../global/apiHelper";
import { fetchLimit, toPage } from "../global/paged";
import useApi from "../global/useApi";

// The token is attached by the apiHelper interceptor.
// A tender looks like { id, tenant_id, financial_year_id, reference_no, title, description,
// status_code, status: { code, display_name, ... }, deadline, is_active, items: [...] }.

/**
 * GET /tenders/ — one page of tenders as { items, hasNext } (the backend sends a plain array
 * with no total). Optional: tenantId, statusCode, skip, limit (max 500), activeOnly.
 */
export const getTenders = async ({ tenantId, statusCode, skip = 0, limit = 10, activeOnly } = {}) =>
  toPage(
    await api.get("/tenders/", {
      params: {
        tenant_id: tenantId,
        status_code: statusCode,
        skip,
        limit: fetchLimit(limit),
        active_only: activeOnly,
      },
    }),
    limit,
  );

/** GET /tenders/{id}. */
export const getTender = (id) => api.get(`/tenders/${id}`);

export const useTenders = () => useApi(getTenders);
