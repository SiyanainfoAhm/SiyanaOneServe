/**
 * Client top bar: project filter, GlobalSearch, notifications, sign-out.
 */
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlobalSearch from "@/components/feature/GlobalSearch";
import Button from "@/components/base/Button";
import TopbarSelect from "@/components/feature/TopbarSelect";
import Avatar from "@/components/base/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { useProjectScope, setScopedProject, ALL_PROJECTS } from "@/hooks/useProjectScope";

const TONE_DOT: Record<string, string> = {
  danger: "bg-[oklch(var(--status-danger))]",
  warning: "bg-[oklch(var(--status-warning))]",
  accent: "bg-accent-500",
  primary: "bg-primary-500",
};

export default function ClientTopbar({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, projects, markNotificationsRead } = useAppData();
  const [openNotif, setOpenNotif] = useState(false);
  const scopedProject = useProjectScope();
  const projectOptions = [ALL_PROJECTS, ...projects.map((item) => item.name)];
  const unread = notifications.filter((item) => !item.read);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setOpenNotif(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-background-200 bg-background-50/95 backdrop-blur">
      <div className="flex h-full items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          onClick={onMenu}
          className="lg:hidden w-10 h-10 -ml-1 rounded-md flex items-center justify-center text-foreground-700 hover:bg-background-100 transition-colors cursor-pointer shrink-0"
          aria-label="Open navigation"
        >
          <i className="ri-menu-line text-[20px] leading-none"></i>
        </button>

        <GlobalSearch mode="client" placeholder="Search your requests, projects…" />

        <div className="ml-auto flex items-center gap-2">
          <TopbarSelect
            value={scopedProject}
            onChange={setScopedProject}
            options={projectOptions}
            icon="ri-folders-line"
            menuLabel="Switch project"
          />

          <Button
            variant="primary"
            size="md"
            icon="ri-add-line"
            className="hidden md:inline-flex"
            onClick={() => navigate("/client/create")}
          >
            New Request
          </Button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setOpenNotif((v) => !v)}
              className="relative w-10 h-10 rounded-md border border-background-300 bg-background-50 flex items-center justify-center text-foreground-600 hover:bg-background-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <i className="ri-notification-3-line text-[18px] leading-none"></i>
              {unread.length > 0 ? (
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[oklch(var(--status-danger))] border border-background-50"></span>
              ) : null}
            </button>
            {openNotif ? (
              <div className="absolute right-0 mt-2 w-[360px] rounded-lg border border-background-200 bg-background-50 shadow-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-background-200">
                  <p className="font-heading text-sm font-semibold text-foreground-950">Notifications</p>
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-semibold text-primary-700">
                    {unread.length} new
                  </span>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {unread.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      to={item.requestId ? `/client/requests/${item.requestId}` : item.href || "/client/requests"}
                      onClick={() => {
                        setOpenNotif(false);
                        void markNotificationsRead([item.id]);
                      }}
                      className="flex gap-3 px-4 py-3 border-b border-background-100 last:border-0 hover:bg-background-50 transition-colors cursor-pointer"
                    >
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TONE_DOT[item.tone] ?? "bg-secondary-400"}`}></span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground-900">{item.title}</p>
                        <p className="mt-0.5 text-xs text-foreground-500">{item.detail}</p>
                        <p className="mt-1 text-[11px] text-foreground-400">{item.time}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/client/notifications"
                  onClick={() => setOpenNotif(false)}
                  className="block w-full py-2.5 text-center text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer"
                >
                  View all notifications
                </Link>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-background-200">
            <Avatar initials={user?.initials ?? "—"} tone="primary" />
            <div className="hidden md:block leading-tight">
              <p className="text-sm font-semibold text-foreground-950">{user?.full_name ?? "Government user"}</p>
              <p className="text-[11px] text-foreground-500">{user?.role} · {user?.organization}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}