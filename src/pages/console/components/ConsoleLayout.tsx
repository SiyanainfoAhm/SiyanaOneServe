/**
 * Operations console chrome: sidebar + topbar.
 * Only reachable after PortalGuard portal="console".
 */
import { useState } from "react";
import type { ReactNode } from "react";
import ConsoleSidebar from "@/pages/console/components/ConsoleSidebar";
import ConsoleTopbar from "@/pages/console/components/ConsoleTopbar";

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-100">
      <ConsoleSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-[248px] min-h-screen flex flex-col">
        <ConsoleTopbar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-[1400px] cos-animate-in">{children}</div>
        </main>
      </div>
    </div>
  );
}