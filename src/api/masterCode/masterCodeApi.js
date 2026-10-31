import api from "../global/apiHelper";
import useApi from "../global/useApi";

// Master codes are the app's lookup lists (plans, statuses, ...). Each one is
// { code, category_code, category_name, value, display_name, is_active }.
// Both routes need a token (attached by the apiHelper interceptor).

/**
 * GET /settings/master-codes/ — a plain array. Pass `categoryCode` to get one list
 * (e.g. 1000 = tenant plans); `activeOnly` defaults to true on the backend.
 */
export const getMasterCodes = ({ categoryCode, activeOnly = true } = {}) =>
  api.get("/settings/master-codes/", {
    params: { category_code: categoryCode, active_only: activeOnly },
  });

/** GET /settings/master-codes/{code} — one master code by its numeric code. */
export const getMasterCode = (code) => api.get(`/settings/master-codes/${code}`);

// One hook per API: returns { call, loading } so the page can show <Loader show={loading} />.
export const useMasterCodes = () => useApi(getMasterCodes);
export const useMasterCode = () => useApi(getMasterCode);
