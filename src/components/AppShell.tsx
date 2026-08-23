"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { WorkspaceProvider } from "@/components/WorkspaceContext";

/**
 * Chooses the chrome for the current route.
 *
 * /login renders bare: it must not mount WorkspaceProvider, because that fetches
 * /workspaces immediately and would 401 (and bounce) before the user can sign in.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/login")) {
    return <>{children}</>;
  }

  return (
    <WorkspaceProvider>
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen relative overflow-x-hidden">
        {/* Global page transition wrapper */}
        <div className="animate-fade-in-up w-full h-full">{children}</div>
      </main>
    </WorkspaceProvider>
  );
}
