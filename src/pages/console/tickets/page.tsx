/**
 * Ticket workbench for staff.
 *
 * Assign, status, notes, files, timeline. Assign/status changes notify via DB mail trigger.
 * Notes posted here are visible on the government request thread as well.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import Card from "@/components/base/Card";
import Tabs from "@/components/base/Tabs";
import { TicketStatusBadge, PriorityBadge } from "@/components/base/StatusBadge";
import EmptyState from "@/components/base/EmptyState";
import TicketInfoPanel from "@/pages/console/tickets/components/TicketInfoPanel";
import TicketAttachments from "@/components/feature/TicketAttachments";
import NotesPanel, { type NoteEntry } from "@/components/feature/NotesPanel";
import TimelinePanel from "@/pages/console/tickets/components/TimelinePanel";
import ActionPanel from "@/pages/console/tickets/components/ActionPanel";
import ResolveTicketModal from "@/pages/console/tickets/components/ResolveTicketModal";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { api } from "@/services/api";
import { formatDisplayDate } from "@/utils/date";
import type { TicketRecord } from "@/types/oneserve";
import { USER_TEAMS } from "@/pages/console/users/components/UserFormModal";
import { isClosedStatus } from "@/utils/ticketStats";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TicketWorkbench({ id }: { id: string }) {
  const { user } = useAuth();
  const { tickets, users, refresh, replaceTicket } = useAppData();
  const [detail, setDetail] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [centerTab, setCenterTab] = useState("details");
  const [draft, setDraft] = useState("");
  const [teamDraft, setTeamDraft] = useState("");
  const [userDraft, setUserDraft] = useState("");
  const [toast, setToast] = useState("");
  const [resolveOpen, setResolveOpen] = useState(false);

  const row = useMemo(() => tickets.find((ticket) => ticket.id === id) ?? detail, [tickets, detail, id]);

  async function load() {
    setLoading(true);
    try {
      const ticket = await api.getTicket(id);
      setDetail(ticket);
      const staff = users.filter((item) => item.type === "staff" && item.status !== "Inactive");
      const assigneeName = ticket.assignee !== "Unassigned" ? ticket.assignee : "";
      const assigneeTeam = staff.find((item) => (item.full_name || item.name) === assigneeName)?.team;
      setTeamDraft(
        ticket.team && ticket.team !== "Unassigned"
          ? ticket.team
          : assigneeTeam && assigneeTeam !== "—"
            ? assigneeTeam
            : "",
      );
      setUserDraft(assigneeName);
      replaceTicket(ticket);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Poll/focus refresh updates AppData; reload full ticket when assignment or status changes.
  useEffect(() => {
    if (!detail) return;
    const listed = tickets.find((ticket) => ticket.id === id);
    if (!listed) return;
    if (
      listed.status === detail.status &&
      listed.assignee === detail.assignee &&
      listed.team === detail.team &&
      listed.updated_at === detail.updated_at
    ) {
      return;
    }
    let cancelled = false;
    void api.getTicket(id).then((ticket) => {
      if (cancelled) return;
      setDetail(ticket);
      const assigneeName = ticket.assignee !== "Unassigned" ? ticket.assignee : "";
      setUserDraft(assigneeName);
      if (ticket.team && ticket.team !== "Unassigned") {
        setTeamDraft(ticket.team);
      }
      replaceTicket(ticket);
    });
    return () => {
      cancelled = true;
    };
  }, [tickets, id, detail, replaceTicket]);

  const staffByTeam = useMemo(() => {
    const map: Record<string, string[]> = {};
    users
      .filter((item) => item.type === "staff" && item.status !== "Inactive")
      .forEach((item) => {
        const team = item.team && item.team !== "—" ? item.team : "Operations";
        const name = item.full_name || item.name;
        if (!name) return;
        map[team] = map[team] ? (map[team].includes(name) ? map[team] : [...map[team], name]) : [name];
      });
    return map;
  }, [users]);

  const teamOptions = useMemo(() => {
    const names = new Set<string>(USER_TEAMS);
    Object.keys(staffByTeam).forEach((team) => names.add(team));
    if (teamDraft) names.add(teamDraft);
    return Array.from(names);
  }, [staffByTeam, teamDraft]);

  const assigneeOptions = useMemo(() => {
    const names = [...(staffByTeam[teamDraft] ?? [])];
    if (userDraft && !names.includes(userDraft)) names.unshift(userDraft);
    return names;
  }, [staffByTeam, teamDraft, userDraft]);

  useEffect(() => {
    if (!userDraft || teamDraft) return;
    const team = Object.entries(staffByTeam).find(([, names]) => names.includes(userDraft))?.[0];
    if (team) setTeamDraft(team);
  }, [staffByTeam, userDraft, teamDraft]);

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  }

  if (loading && !row) {
    return (
      <ConsoleLayout>
        <p className="text-sm text-foreground-500">Loading ticket…</p>
      </ConsoleLayout>
    );
  }

  if (!row) {
    return (
      <ConsoleLayout>
        <Card>
          <EmptyState
            icon="ri-file-unknow-line"
            title={`Ticket ${id} was not found`}
            description="This ticket may have been removed or you may not have access to it."
            action={
              <Link
                to="/console/queue"
                className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line text-[15px] leading-none"></i>
                Back to queue
              </Link>
            }
          />
        </Card>
      </ConsoleLayout>
    );
  }

  const live = detail ?? row;
  const notesLocked = isClosedStatus(live.status);
  const notes: NoteEntry[] = (live.messages ?? []).map((message) => ({
    id: message.id,
    author: message.author,
    initials: message.initials,
    role: message.role,
    body: message.body,
    time: message.time,
    side: message.kind === "client" ? "requester" : "team",
  }));

  async function handleSend() {
    if (notesLocked || !draft.trim()) return;
    const ticket = await api.addMessage(id, draft.trim(), "client");
    setDetail(ticket);
    replaceTicket(ticket);
    setDraft("");
    showToast("Note added to the ticket");
    await refresh();
  }

  async function handleAssign() {
    const ticket = await api.updateTicket({
      id,
      team: teamDraft,
      assignee: userDraft || undefined,
      status: live.status === "New" ? "Assigned" : live.status,
    });
    setDetail(ticket);
    replaceTicket(ticket);
    showToast(`Assigned to ${userDraft || teamDraft}`);
    await refresh();
  }

  async function handleStartWork() {
    const ticket = await api.updateTicket({ id, status: "In Progress" });
    setDetail(ticket);
    replaceTicket(ticket);
    showToast("Work started");
    await refresh();
  }

  async function handleResolve(comment: string) {
    const ticket = await api.updateTicket({ id, status: "Resolved", resolve_note: comment });
    setDetail(ticket);
    replaceTicket(ticket);
    setResolveOpen(false);
    setCenterTab("notes");
    showToast("Ticket marked Resolved");
    await refresh();
  }

  return (
    <ConsoleLayout>
      <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-500">
        <Link
          to="/console/queue"
          className="inline-flex items-center gap-1.5 hover:text-foreground-800 transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-line text-[14px] leading-none"></i>
          Ticket Queue
        </Link>
        <i className="ri-arrow-right-s-line text-[14px] leading-none text-foreground-400"></i>
        <span className="font-mono text-foreground-700">{live.id}</span>
      </div>

      <div className="mt-3 min-w-0">
        <h1 className="font-heading text-xl font-bold text-foreground-950">{live.title}</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <TicketStatusBadge status={live.status} />
          <PriorityBadge priority={live.priority} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-background-200 bg-background-100 px-2.5 py-0.5 text-xs text-foreground-600">
            <i className="ri-folders-line text-[13px] leading-none"></i>
            {live.project}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)_324px]">
        <div className="min-w-0">
          <TicketInfoPanel
            project={live.project}
            organization={live.organization}
            status={live.status}
            priority={live.priority}
            created={formatDisplayDate(live.created)}
            team={live.team}
            assignee={live.assignee}
            assigneeInitials={live.assignee_initials || "—"}
            assigneeRole={live.team}
            requester={{
              name: live.requester,
              role: live.requester_role || "Requester",
              email: live.requester_email,
              organization: live.organization,
            }}
          />
        </div>

        <Card className="min-w-0" padded={false}>
          <div className="border-b border-background-200 px-5 py-3.5">
            <Tabs
              value={centerTab}
              onChange={setCenterTab}
              items={[
                { key: "details", label: "Details", icon: "ri-file-text-line" },
                { key: "notes", label: "Notes", count: notes.length, icon: "ri-sticky-note-line" },
                { key: "history", label: "History", count: (live.events ?? []).length, icon: "ri-history-line" },
              ]}
            />
          </div>

          {centerTab === "details" ? (
            <div className="flex flex-col gap-5 px-5 py-5">
              <div>
                <p className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
                  Requirement
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground-700">{live.description}</p>
              </div>
              {live.reference_url ? (
                <div>
                  <p className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
                    Reference Link
                  </p>
                  <a
                    href={live.reference_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800 cursor-pointer break-all"
                  >
                    <i className="ri-link text-[14px] leading-none"></i>
                    {live.reference_url}
                  </a>
                </div>
              ) : null}
              <div>
                <p className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
                  Attachments
                </p>
                <TicketAttachments
                  ticketId={live.id}
                  ticketUuid={live.ticket_id}
                  attachments={(live.attachments ?? []).map((file) => ({
                    id: file.id,
                    name: file.name,
                    size: file.size,
                    kind: file.kind,
                    filePath: file.file_path,
                  }))}
                  emptyText="No attachments on this request."
                  onChange={(ticket) => {
                    setDetail(ticket);
                    replaceTicket(ticket);
                  }}
                />
              </div>
            </div>
          ) : null}

          {centerTab === "notes" ? (
            <NotesPanel
              notes={notes}
              draft={draft}
              onDraft={setDraft}
              onSend={() => void handleSend()}
              readOnly={notesLocked}
              readOnlyHint="This ticket is resolved. Notes are read-only."
            />
          ) : null}

          {centerTab === "history" ? (
            <TimelinePanel
              events={(live.events ?? []).map((event) => ({
                id: event.id,
                time: event.time,
                date: event.date,
                type: event.type,
                title: event.title,
                note: event.note ?? "",
                actor: event.actor,
                tone: event.tone as "primary" | "accent" | "warning" | "danger",
              }))}
            />
          ) : null}
        </Card>

        <div className="min-w-0">
          <ActionPanel
            status={live.status}
            teamDraft={teamDraft}
            onTeamDraft={(value) => {
              setTeamDraft(value);
              const list = staffByTeam[value] ?? [];
              setUserDraft(list.includes(userDraft) ? userDraft : "");
            }}
            userDraft={userDraft}
            onUserDraft={setUserDraft}
            priority={live.priority}
            onAssign={() => void handleAssign()}
            onStartWork={() => void handleStartWork()}
            onResolve={() => setResolveOpen(true)}
            teams={teamOptions}
            assignees={assigneeOptions}
          />
        </div>
      </div>

      {resolveOpen ? (
        <ResolveTicketModal
          ticketId={live.id}
          onClose={() => setResolveOpen(false)}
          onConfirm={handleResolve}
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

export default function TicketWorkbenchPage() {
  const params = useParams();
  const id = params.id as string;
  return <TicketWorkbench key={id} id={id} />;
}
