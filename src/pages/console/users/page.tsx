/**
 * People directory. Honors ?q= from GlobalSearch. Invite emails go through the mail trigger.
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import PageHeader from "@/pages/console/components/PageHeader";
import Card from "@/components/base/Card";
import Tabs from "@/components/base/Tabs";
import Button from "@/components/base/Button";
import Select from "@/components/base/Select";
import Avatar from "@/components/base/Avatar";
import StatCard from "@/pages/console/components/StatCard";
import EmptyState from "@/components/base/EmptyState";
import { StatusBadge, type Tone } from "@/components/base/StatusBadge";
import type { ConsoleUser } from "@/mocks/consoleUsers";
import UserFormModal from "@/pages/console/users/components/UserFormModal";
import ResendInviteModal from "@/pages/console/users/components/ResendInviteModal";
import { useProjects } from "@/hooks/useProjectStore";
import { useProjectScope, ALL_PROJECTS } from "@/hooks/useProjectScope";
import { useAppData } from "@/context/AppDataContext";
import { api } from "@/services/api";
import { projectNamesOf } from "@/utils/liveStats";
import { generateInvitePassword } from "@/utils/credentials";
import type { SessionUser } from "@/types/oneserve";

const STATUS_TONE: Record<string, Tone> = {
  Active: "success",
  Inactive: "neutral",
};

const ROLE_OPTIONS = [
  "All Roles",
  "Super Admin",
  "Operations Admin",
  "Project Manager",
  "Business Analyst",
  "Senior Developer",
  "Developer",
  "QA Engineer",
  "Content Analyst",
  "Government Nodal Officer",
  "Government Requester",
];

const HEAD = "px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500";

function toConsoleUser(user: SessionUser): ConsoleUser {
  return {
    id: user.id,
    name: user.full_name || user.name,
    initials: user.initials,
    email: user.email,
    role: user.role,
    team: user.team,
    organization: user.organization,
    type: user.type,
    status: user.status === "Inactive" ? "Inactive" : "Active",
    openTickets: 0,
    lastActive: user.last_active ?? "—",
    projects: projectNamesOf(user.projects as Array<string | { name: string }>),
  };
}

export default function UsersPage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const { users: liveUsers, refresh } = useAppData();
  const scope = useProjectScope();
  const projects = useProjects();
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState(queryParam);
  const [role, setRole] = useState("All Roles");
  const [toast, setToast] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ConsoleUser | null>(null);
  const [resendingUser, setResendingUser] = useState<ConsoleUser | null>(null);
  const [resendPassword, setResendPassword] = useState("");

  useEffect(() => {
    if (queryParam) setSearch(queryParam);
  }, [queryParam]);

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  }

  const users = useMemo(() => liveUsers.map(toConsoleUser), [liveUsers]);

  const counts = useMemo(
    () => ({
      all: users.length,
      staff: users.filter((user) => user.type === "staff").length,
      government: users.filter((user) => user.type === "government").length,
      inactive: users.filter((user) => user.status === "Inactive").length,
    }),
    [users],
  );

  const scopedOrganization = useMemo(() => {
    const match = projects.find((project) => project.name === scope);
    return match ? match.organization : null;
  }, [projects, scope]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      if (scope !== ALL_PROJECTS && scopedOrganization) {
        const linked = user.projects?.includes(scope) ?? false;
        const sameOrg = user.organization === scopedOrganization;
        if (!linked && !sameOrg && user.type !== "staff") return false;
      }
      if (tab === "Siyana Staff" && user.type !== "staff") return false;
      if (tab === "Government Users" && user.type !== "government") return false;
      if (role !== "All Roles" && user.role !== role) return false;
      if (term) {
        const haystack = `${user.name} ${user.email} ${user.role} ${user.organization} ${user.team}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [users, scope, scopedOrganization, tab, search, role]);

  async function handleInvite(newUser: ConsoleUser, password?: string) {
    await api.inviteUser({
      full_name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization: newUser.organization,
      team: newUser.team,
      password,
      projects: newUser.projects ?? [],
    });
    await refresh();
    setTab("All");
    setRole("All Roles");
    showToast(`Invitation sent to ${newUser.email}`);
  }

  function openResend(user: ConsoleUser) {
    setResendPassword(generateInvitePassword(user.name, user.organization));
    setResendingUser(user);
  }

  async function handleResendInvite() {
    if (!resendingUser) return;
    await api.resendInvite(resendingUser.id, resendPassword);
    await refresh();
    showToast(`Invitation resent to ${resendingUser.email}`);
  }

  async function handleSaveEdit(updated: ConsoleUser) {
    await api.updateUser({
      id: updated.id,
      full_name: updated.name,
      email: updated.email,
      role: updated.role,
      organization: updated.organization,
      team: updated.team,
      status: updated.status,
      projects: updated.projects ?? [],
    });
    await refresh();
    showToast(`${updated.name} updated successfully`);
  }

  return (
    <ConsoleLayout>
      <PageHeader
        title="Users"
        subtitle="Siyana staff and government users with roles, teams and access status"
        actions={
          <Button variant="primary" icon="ri-user-add-line" onClick={() => setInviteOpen(true)}>
            Invite User
          </Button>
        }
      />

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={String(counts.all)} delta="Across both portals" tone="primary" icon="ri-team-line" />
        <StatCard label="Siyana Staff" value={String(counts.staff)} delta="Operations & delivery" tone="accent" icon="ri-shield-user-line" />
        <StatCard label="Government Users" value={String(counts.government)} delta="Nodal officers & requesters" tone="info" icon="ri-government-line" />
        <StatCard label="Inactive Users" value={String(counts.inactive)} delta="Access currently disabled" tone="warning" icon="ri-user-forbid-line" />
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={(key) => {
            setTab(key);
            setRole("All Roles");
          }}
          items={[
            { key: "All", label: "All Users", count: counts.all },
            { key: "Siyana Staff", label: "Siyana Staff", count: counts.staff },
            { key: "Government Users", label: "Government Users", count: counts.government },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
              <i className="ri-search-line text-foreground-400 text-[16px] leading-none"></i>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="h-10 w-full sm:w-[240px] rounded-md border border-background-300 bg-background-50 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
            />
          </div>
          <Select options={ROLE_OPTIONS} value={role} onChange={(e) => setRole(e.target.value)} icon="ri-shield-user-line" containerClassName="w-[200px]" />
        </div>
      </div>

      <Card className="mt-4" padded={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="ri-user-search-line" title="No users match your search" description="Try a different name, role or organization." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr className="border-b border-background-200 bg-background-50">
                  <th className={HEAD}>User</th>
                  <th className={HEAD}>Role</th>
                  <th className={HEAD}>Team / Organization</th>
                  <th className={HEAD}>Status</th>
                  <th className={HEAD}>Last Active</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-background-100 last:border-0 hover:bg-background-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={user.initials} tone={user.type === "staff" ? "primary" : "accent"} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground-900">{user.name}</p>
                          <p className="truncate text-[11px] text-foreground-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-700">{user.role}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-600">
                      {user.type === "staff" ? user.team : user.organization}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge label={user.status} tone={STATUS_TONE[user.status] ?? "neutral"} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-500">{user.lastActive}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openResend(user)}
                          className="inline-flex w-8 h-8 items-center justify-center rounded-md border border-background-200 text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
                          aria-label={`Resend invitation to ${user.name}`}
                          title="Resend invitation"
                        >
                          <i className="ri-mail-send-line text-[15px] leading-none"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingUser(user)}
                          className="inline-flex w-8 h-8 items-center justify-center rounded-md border border-background-200 text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
                          aria-label={`Manage ${user.name}`}
                        >
                          <i className="ri-more-2-fill text-[15px] leading-none"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {inviteOpen ? (
        <UserFormModal
          mode="create"
          onClose={() => setInviteOpen(false)}
          onSubmit={handleInvite}
        />
      ) : null}

      {editingUser ? (
        <UserFormModal
          mode="edit"
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleSaveEdit}
        />
      ) : null}

      {resendingUser ? (
        <ResendInviteModal
          user={resendingUser}
          password={resendPassword}
          onClose={() => {
            setResendingUser(null);
            setResendPassword("");
          }}
          onConfirm={handleResendInvite}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-background-200 bg-foreground-950 px-4 py-3 shadow-lg">
          <span className="w-4 h-4 flex items-center justify-center">
            <i className="ri-checkbox-circle-fill text-accent-400 text-[16px] leading-none"></i>
          </span>
          <span className="text-sm font-medium text-background-50">{toast}</span>
        </div>
      ) : null}
    </ConsoleLayout>
  );
}