/**
 * The list endpoints page with `skip` / `limit` and answer with a plain array; they don't send
 * a total. So a page asks for one row more than it shows (`limit + 1`): if that extra row comes
 * back there is a next page.
 *
 *   const data = await api.get("/things/", { params: { skip, limit: limit + 1 } });
 *   return toPage(data, limit);   // { items: [...up to limit], hasNext }
 */
export const toPage = (data, limit) => {
  const list = Array.isArray(data) ? data : (data?.items ?? []);
  return { items: list.slice(0, limit), hasNext: list.length > limit };
};

/** The `limit` to send for a page of `limit` rows: one extra, within the backend's max of 500. */
export const fetchLimit = (limit) => Math.min(limit + 1, 500);
