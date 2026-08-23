"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { API, getToken, clearToken } from "@/lib/api";

/**
 * Gates the whole app behind the backend password.
 *
 * Rather than editing every one of the 36 fetch() call sites, this patches window.fetch
 * once: any request aimed at the backend gets the session token attached, and any 401
 * response bounces the user to /login. New pages are covered automatically.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  // Install the fetch interceptor once, before anything renders.
  useEffect(() => {
    const w = window as unknown as { __atlasFetchPatched?: boolean };
    if (w.__atlasFetchPatched) return;
    w.__atlasFetchPatched = true;

    const original = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

      // Only touch calls to our own backend; leave third-party requests alone.
      if (url.startsWith(API)) {
        const token = getToken();
        if (token) {
          const headers = new Headers(init?.headers || (input as Request).headers || {});
          headers.set("X-App-Token", token);
          init = { ...init, headers };
        }
      }

      const response = await original(input as RequestInfo, init);

      if (response.status === 401 && url.startsWith(API)) {
        clearToken();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
      return response;
    };
  }, []);

  // Redirect to /login when there is no token.
  useEffect(() => {
    if (pathname?.startsWith("/login")) {
      setReady(true);
      return;
    }
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
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
