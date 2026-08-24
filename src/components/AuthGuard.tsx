"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API } from "@/lib/api";
import { getAccessToken, getDoorToken, refreshAccessToken } from "@/lib/auth";

/**
 * Gates the app behind the backend session.
 *
 * Rather than editing every fetch() call site, this patches window.fetch once: requests
 * aimed at the backend get the current token and credentials, and a 401 triggers a single
 * silent refresh-and-retry (the access token only lives 15 minutes, so expiry during
 * normal use is routine, not an error the user should see).
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as unknown as { __atlasFetchPatched?: boolean };
    if (w.__atlasFetchPatched) return;
    w.__atlasFetchPatched = true;

    const original = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      const decorate = (opts: RequestInit | undefined): RequestInit => {
        if (!url.startsWith(API)) return opts || {};
        const headers = new Headers(opts?.headers || {});
        const token = getAccessToken() || getDoorToken();
        if (token) headers.set("X-App-Token", token);
        return { ...opts, headers, credentials: "include" };
      };

      let response = await original(input as RequestInfo, decorate(init));

      const isAuthCall = url.includes("/auth/refresh") || url.includes("/session/login");
      if (response.status === 401 && url.startsWith(API) && !isAuthCall) {
        const renewed = await refreshAccessToken();
        if (renewed) {
          response = await original(input as RequestInfo, decorate(init));
        } else if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
      return response;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (pathname?.startsWith("/login")) {
        if (!cancelled) setReady(true);
        return;
      }
      // The access token is in memory, so a reload starts with none: try the refresh
      // cookie before deciding the user is signed out.
      const token = getAccessToken() || (await refreshAccessToken());
      if (cancelled) return;
      if (!token) {
        router.replace("/login");
        return;
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center w-full h-screen text-gray-500">
        <div className="animate-pulse">Loading…</div>
      </div>
    );
  }

  return <>{children}</>;
}
