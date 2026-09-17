/**
 * Live lists for both portals (tickets, projects, users, orgs, notifications).
 * Refetches when the session token appears. `replaceTicket` patches one row
 * after an RPC so the queue/workbench stay in sync without a full reload.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type {
  NotificationRecord,
  OrgRecord,
  ProjectRecord,
  SessionUser,
  TicketRecord,
} from "@/types/oneserve";

interface AppDataValue {
  loading: boolean;
  tickets: TicketRecord[];
  projects: ProjectRecord[];
  users: SessionUser[];
  organizations: OrgRecord[];
  notifications: NotificationRecord[];
  refresh: () => Promise<void>;
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

  const refresh = useCallback(async () => {
    if (!token || !user) {
      setTickets([]);
      setProjects([]);
      setUsers([]);
      setOrganizations([]);
      setNotifications([]);
      return;
    }
    setLoading(true);
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
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
