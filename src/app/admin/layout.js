"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { expireSession, getAccessToken, getTenantSlug, isTokenExpired } from "@/api/auth/authApi";

/**
 * Route guard for every /admin page. The token lives in browser storage (not a cookie), so
 * the check has to run on the client: no token -> go to login; expired token -> sign out and
 * show the "session expired" toast. Children render only once the session is confirmed, so
 * no page (or API call) runs without one.
 */
export default function AdminLayout({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      const slug = getTenantSlug();
      router.replace(slug ? `/${slug}/login` : "/login");
    } else if (isTokenExpired(token)) {
      expireSession();
    } else {
      setAllowed(true);
    }
  }, [router]);

  return allowed ? children : null;
}
