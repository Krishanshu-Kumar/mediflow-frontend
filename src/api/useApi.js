"use client";

import { useCallback, useState } from "react";

const MIN_VISIBLE_MS = 600;

/**
 * Wraps an API function with a `loading` flag for the page that calls it.
 *
 *   const { call: login, loading } = useLogin();   // see authApi.js
 *   ...
 *   <Loader show={loading} />
 *
 * `call` forwards the arguments and result (or error) of `apiFn` untouched. `loading` is true
 * while any call made through this hook is in flight.
 */
export default function useApi(apiFn) {
  const [pending, setPending] = useState(0);

  const call = useCallback(
    async (...args) => {
      const startedAt = Date.now();
      setPending((count) => count + 1);
      try {
        return await apiFn(...args);
      } finally {
        // Fast responses would flash the loader for a blink, so keep it up a moment.
        const remaining = MIN_VISIBLE_MS - (Date.now() - startedAt);
        if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
        setPending((count) => count - 1);
      }
    },
    [apiFn],
  );

  return { call, loading: pending > 0 };
}
