import api from "../global/apiHelper";
import useApi from "../global/useApi";

// The token is attached by the apiHelper interceptor.
// A financial year looks like { id, label: "2026-27", start_date, end_date, is_active, created_at, updated_at }.

/** GET /financial-years/ — array of financial years. Optional: skip, limit, activeOnly. */
export const getFinancialYears = ({ skip, limit, activeOnly } = {}) =>
  api.get("/financial-years/", { params: { skip, limit, active_only: activeOnly } });

/** GET /financial-years/{id}. */
export const getFinancialYear = (id) => api.get(`/financial-years/${id}`);

/** POST /financial-years/ with { label ("20YY-YY"), startDate, endDate } (dates as YYYY-MM-DD). */
export const createFinancialYear = ({ label, startDate, endDate }) =>
  api.post("/financial-years/", { label, start_date: startDate, end_date: endDate });

/** PUT /financial-years/{id} — any of { label, startDate, endDate }. Activation goes through the status call. */
export const updateFinancialYear = (id, { label, startDate, endDate } = {}) =>
  api.put(`/financial-years/${id}`, { label, start_date: startDate, end_date: endDate });

/** PATCH /financial-years/{id}/status?is_active=... Returns the updated financial year. */
export const setFinancialYearStatus = (id, isActive) =>
  api.patch(`/financial-years/${id}/status`, undefined, { params: { is_active: isActive } });

export const useFinancialYears = () => useApi(getFinancialYears);
export const useCreateFinancialYear = () => useApi(createFinancialYear);
export const useUpdateFinancialYear = () => useApi(updateFinancialYear);
export const useSetFinancialYearStatus = () => useApi(setFinancialYearStatus);
