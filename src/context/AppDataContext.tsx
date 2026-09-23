/**
 * Live lists for both portals (tickets, projects, users, orgs, notifications).
 * Refetches when the session token appears, on a short poll while signed in,
 * and when the browser tab becomes visible again — so create/assign updates
 * show up without a manual reload. `replaceTicket` patches one row after an
 * RPC so the actor’s own queue/workbench stays in sync immediately.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type {
  NotificationRecord,
  OrgRecord,
  ProjectRecord,
  SessionUser,
  TicketRecord,
} from "@/types/oneserve";

const POLL_MS = 40_000;

interface RefreshOptions {
  /** Skip the global loading flag (used for background poll / focus). */
  silent?: boolean;
}

interface AppDataValue {
  loading: boolean;
  tickets: TicketRecord[];
  projects: ProjectRecord[];
  users: SessionUser[];
  organizations: OrgRecord[];
  notifications: NotificationRecord[];
  refresh: (options?: RefreshOptions) => Promise<void>;
  replaceTicket: (ticket: TicketRecord) => void;
  markNotificationsRead: (ids?: string[]) => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [organizations, setOrganizations] = useState<OrgRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const inFlight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(
    async (options?: RefreshOptions) => {
      if (!token || !user) {
        setTickets([]);
        setProjects([]);
        setUsers([]);
        setOrganizations([]);
        setNotifications([]);
        return;
      }

      if (options?.silent && inFlight.current) {
        await inFlight.current;
        return;
      }

      const silent = options?.silent === true;
      if (!silent) setLoading(true);

      const run = (async () => {
        try {
          const [nextTickets, nextProjects, nextOrgs, nextNotes] = await Promise.all([
            api.listTickets(),
            api.listProjects(),
            api.listOrganizations(),
            api.listNotifications(),
          ]);
          setTickets(nextTickets ?? []);
          setProjects(nextProjects ?? []);
          setOrganizations(nextOrgs ?? []);
          setNotifications(nextNotes ?? []);
          if (user.is_console) {
            const nextUsers = await api.listUsers();
            setUsers(nextUsers ?? []);
          } else {
            setUsers([]);
          }
        } finally {
          if (!silent) setLoading(false);
          inFlight.current = null;
        }
      })();

      inFlight.current = run;
      await run;
    },
    [token, user],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Keep lists fresh for other users when tickets are created or assigned.
  useEffect(() => {
    if (!token || !user) return;

    const silentRefresh = () => {
      if (document.visibilityState === "hidden") return;
      void refresh({ silent: true });
    };

    const intervalId = window.setInterval(silentRefresh, POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") silentRefresh();
    };
    const onFocus = () => silentRefresh();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [token, user, refresh]);

  const replaceTicket = useCallback((ticket: TicketRecord) => {
    setTickets((prev) => {
      const exists = prev.some((item) => item.id === ticket.id);
      if (!exists) return [ticket, ...prev];
      return prev.map((item) => (item.id === ticket.id ? { ...item, ...ticket } : item));
    });
  }, []);

  const markNotificationsRead = useCallback(async (ids?: string[]) => {
    const next = await api.markNotificationsRead(ids);
    setNotifications(next ?? []);
  }, []);

  const value = useMemo<AppDataValue>(
    () => ({
      loading,
      tickets,
      projects,
      users,
      organizations,
      notifications,
      refresh,
      replaceTicket,
      markNotificationsRead,
    }),
    [loading, tickets, projects, users, organizations, notifications, refresh, replaceTicket, markNotificationsRead],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider");
  return context;
}
