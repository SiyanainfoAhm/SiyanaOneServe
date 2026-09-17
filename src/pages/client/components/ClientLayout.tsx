/**
 * Government portal chrome: sidebar + topbar.
 * Only reachable after PortalGuard portal="client".
 */
import { useState } from "react";
import type { ReactNode } from "react";
import ClientSidebar from "@/pages/client/components/ClientSidebar";
import ClientTopbar from "@/pages/client/components/ClientTopbar";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-100">
      <ClientSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[248px] min-h-screen flex flex-col">
        <ClientTopbar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1360px] cos-animate-in">{children}</div>
        </main>
      </div>
    </div>
  );
}