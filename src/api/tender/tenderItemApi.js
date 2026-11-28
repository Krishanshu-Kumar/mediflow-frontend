import api from "../global/apiHelper";
import { fetchLimit, toPage } from "../global/paged";
import useApi from "../global/useApi";

// The token is attached by the apiHelper interceptor. Super Admin only.
// An item looks like { id, tender_id, item_no, item_type_code, item_type: { code, value, display_name },
// name, description, quantity (decimal), unit, is_active }. Item types: 5001 medicine, 5002 equipment.

/**
 * GET /tenders/{tenderId}/items/ — one page of items as { items, hasNext } (the backend sends a
 * plain array with no total). Optional: skip, limit (max 500), activeOnly (backend default true).
 */
export const getTenderItems = async (tenderId, { skip = 0, limit = 10, activeOnly } = {}) =>
  toPage(
    await api.get(`/tenders/${tenderId}/items/`, {
      params: { skip, limit: fetchLimit(limit), active_only: activeOnly },
    }),
    limit,
  );

export const useTenderItems = () => useApi(getTenderItems);

/**
 * POST /tenders/{tenderId}/items/ with { itemTypeCode, name, description?, quantity, unit }.
 * Only works while the tender is a draft. Returns the created item (item_no is generated).
 */
export const createTenderItem = (tenderId, { itemTypeCode, name, description, quantity, unit }) =>
  api.post(`/tenders/${tenderId}/items/`, {
    item_type_code: itemTypeCode,
    name,
    description,
    quantity,
    unit,
  });

export const useCreateTenderItem = () => useApi(createTenderItem);

/**
 * PATCH /tenders/{tenderId}/items/{itemId}/activation?is_active=... Only works while the tender
 * is a draft. Returns the updated item.
 */
export const setTenderItemActivation = (tenderId, itemId, isActive) =>
  api.patch(`/tenders/${tenderId}/items/${itemId}/activation`, undefined, {
    params: { is_active: isActive },
  });

export const useSetTenderItemActivation = () => useApi(setTenderItemActivation);
