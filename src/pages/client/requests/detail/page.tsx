/**
 * Single government request: comments, files, reject with a mandatory reason.
 *
 * Resolved is terminal. Reject is available until the ticket is Resolved or Rejected.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ClientLayout from "@/pages/client/components/ClientLayout";
import Card from "@/components/base/Card";
import Tabs from "@/components/base/Tabs";
import Button from "@/components/base/Button";
import EmptyState from "@/components/base/EmptyState";
import { TicketStatusBadge, PriorityBadge } from "@/components/base/StatusBadge";
import NotesPanel, { type NoteEntry } from "@/components/feature/NotesPanel";
import TicketAttachments from "@/components/feature/TicketAttachments";
import TimelinePanel from "@/pages/console/tickets/components/TimelinePanel";
import TicketInfoPanel from "@/pages/console/tickets/components/TicketInfoPanel";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { toClientDetail, toClientRequest } from "@/hooks/useClientRequestStore";
import { api } from "@/services/api";
import { formatDisplayDate } from "@/utils/date";
import type { TicketRecord } from "@/types/oneserve";
import { rejectionFromEvents } from "@/utils/ticketStats";

export default function ClientRequestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { tickets, refresh, replaceTicket } = useAppData();
  const [live, setLive] = useState<TicketRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("details");
  const [draft, setDraft] = useState("");
  const [banner, setBanner] = useState("");
  const [saving, setSaving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const request = useMemo(() => {
    const ticket = live ?? tickets.find((item) => item.id === id);
    return ticket ? toClientRequest(ticket) : undefined;
  }, [live, tickets, id]);

  const detail = useMemo(() => {
    const ticket = live ?? tickets.find((item) => item.id === id);
    return ticket ? toClientDetail(ticket) : null;
  }, [live, tickets, id]);

  useEffect(() => {
    setLoading(true);
    void api
      .getTicket(id)
      .then((ticket) => {
        setLive(ticket);
        replaceTicket(ticket);
      })
      .catch(() => setLive(null))
      .finally(() => setLoading(false));
  }, [id, replaceTicket]);

  if (loading && !request) {
    return (
      <ClientLayout>
        <p className="text-sm text-foreground-500">Loading request…</p>
      </ClientLayout>
    );
  }

  if (!request || !detail) {
    return (
      <ClientLayout>
        <Card>
          <EmptyState
            icon="ri-file-unknow-line"
            title={`Request ${id} was not found`}
            description="This request does not belong to your department or may have been archived."
            action={
              <Link
                to="/client/requests"
                className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line text-[15px] leading-none"></i>
                Back to My Requests
              </Link>
            }
          />
        </Card>
      </ClientLayout>
    );
  }

  const notes: NoteEntry[] = detail.messages.map((message) => ({
    id: message.id,
    author: message.author,
    initials: message.initials,
    role: message.role,
    body: message.body,
    time: message.time,
    side: message.kind === "client" ? "requester" : "team",
  }));

  function flash(text: string) {
    setBanner(text);
    window.setTimeout(() => setBanner(""), 3000);
  }

  async function handleSend() {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      // Government notes are always client-visible (they appear on the staff workbench too).
      const ticket = await api.addMessage(id, draft.trim(), "client");
      setLive(ticket);
      replaceTicket(ticket);
      setDraft("");
      flash("Your note has been shared with the Siyana team.");
      await refresh();
    } catch (err) {
      flash(err instanceof Error ? err.message : "Unable to send this note.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmReject() {
    if (!reason.trim()) {
      setRejectError("A rejection reason is mandatory.");
      return;
    }
    setSaving(true);
    try {
      const ticket = await api.rejectTicket(id, reason.trim());
      setLive(ticket);
      replaceTicket(ticket);
      setRejectOpen(false);
      setReason("");
      setRejectError("");
      flash("Request rejected. The Siyana team has been notified.");
      await refresh();
    } catch (err) {
      flash(err instanceof Error ? err.message : "Unable to reject this request.");
    } finally {
      setSaving(false);
    }
  }

  const closed = request.status === "Resolved" || request.status === "Rejected" || request.status === "Closed";

  return (
    <ClientLayout>
      <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-500">
        <Link
          to="/client/requests"
          className="inline-flex items-center gap-1.5 hover:text-foreground-800 transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-line text-[14px] leading-none"></i>
          My Requests
        </Link>
        <i className="ri-arrow-right-s-line text-[14px] leading-none text-foreground-400"></i>
        <span className="font-mono text-foreground-700">{request.id}</span>
      </div>

      <div className="mt-3 min-w-0">
        <h1 className="font-heading text-xl font-bold text-foreground-950">{request.title}</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <TicketStatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-background-200 bg-background-100 px-2.5 py-0.5 text-xs text-foreground-600">
            <i className="ri-folders-line text-[13px] leading-none"></i>
            {request.project}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)_324px]">
        <div className="min-w-0">
          <TicketInfoPanel
            project={request.project}
            organization={live?.organization || user?.organization || ""}
            status={request.status}
            priority={request.priority}
            created={formatDisplayDate(request.created)}
            team={detail.assignedTeam}
            assignee={detail.assignee}
            assigneeInitials={detail.assigneeInitials}
            assigneeRole={detail.assignedTeam}
            requester={{ name: live?.requester || user?.full_name || "Requester", role: live?.requester_role || user?.role || "Requester" }}
            rejection={rejectionFromEvents(request.status, live?.events, request.updated, {
              reason: live?.rejection_reason,
              by: live?.rejected_by,
              at: live?.rejected_at ? formatDisplayDate(live.rejected_at) : request.updated,
            })}
          />
        </div>

        <Card className="min-w-0" padded={false}>
          <div className="border-b border-background-200 px-5 py-3.5">
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { key: "details", label: "Details", icon: "ri-file-text-line" },
                { key: "notes", label: "Comments", count: notes.length, icon: "ri-chat-3-line" },
                { key: "history", label: "History", count: detail.events.length, icon: "ri-history-line" },
              ]}
            />
          </div>

          {tab === "details" ? (
            <div className="flex flex-col gap-5 px-5 py-5">
              <div>
                <p className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
                  Requirement
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground-700">{detail.description}</p>
              </div>

              {detail.referenceLink ? (
                <div>
                  <p className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
                    Reference Link
                  </p>
                  <a
                    href={detail.referenceLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-800 cursor-pointer break-all"
                  >
                    <i className="ri-link text-[14px] leading-none"></i>
                    {detail.referenceLink}
                  </a>
                </div>
              ) : null}

              <div>
                <p className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
                  Attachments
                </p>
                <TicketAttachments
                  ticketId={live?.id ?? request.id}
                  ticketUuid={live?.ticket_id ?? live?.id ?? request.id}
                  attachments={detail.attachments}
                  emptyText="No documents attached to this request."
                  onChange={(ticket) => {
                    setLive(ticket);
                    replaceTicket(ticket);
                  }}
                />
              </div>
            </div>
          ) : null}

          {tab === "notes" ? (
            <NotesPanel notes={notes} draft={draft} onDraft={setDraft} onSend={handleSend} />
          ) : null}

          {tab === "history" ? <TimelinePanel events={detail.events} /> : null}
        </Card>

        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-background-200 bg-background-50 p-4">
            <h3 className="font-heading text-sm font-semibold text-foreground-950">Need to do something?</h3>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setTab("notes")}
                className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-background-300 bg-background-50 px-3 text-xs font-label font-medium text-foreground-800 hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-chat-3-line text-[14px] leading-none"></i>
                </span>
                Add Comment
              </button>
              {!closed ? (
                <button
                  type="button"
                  onClick={() => {
                    setRejectOpen(true);
                    setReason("");
                    setRejectError("");
                  }}
                  className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-[oklch(var(--status-danger)/0.4)] bg-[oklch(var(--status-danger)/0.08)] px-3 text-xs font-label font-medium text-[oklch(var(--status-danger))] hover:bg-[oklch(var(--status-danger)/0.14)] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-close-circle-line text-[14px] leading-none"></i>
                  Reject Ticket
                </button>
              ) : null}
              <Link
                to="/client/create"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-primary-600 bg-primary-600 px-3 text-xs font-label font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line text-[14px] leading-none"></i>
                Raise Similar Request
              </Link>
            </div>
          </section>

          {rejectOpen ? (
            <section className="rounded-lg border border-[oklch(var(--status-danger)/0.3)] bg-[oklch(var(--status-danger)/0.05)] p-4">
              <label htmlFor="client-reject" className="block text-xs font-label font-semibold text-foreground-800">
                Reason for rejection <span className="text-[oklch(var(--status-danger))]">*</span>
              </label>
              <textarea
                id="client-reject"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setRejectError("");
                }}
                rows={3}
                maxLength={300}
                placeholder="e.g. Requirement no longer required, wrong request created…"
                className="mt-1.5 w-full resize-none rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              {rejectError ? (
                <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-[oklch(var(--status-danger))]">
                  <i className="ri-error-warning-line text-[13px] leading-none mt-0.5"></i>
                  {rejectError}
                </p>
              ) : null}
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRejectOpen(false);
                    setReason("");
                    setRejectError("");
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" size="sm" icon="ri-close-line" onClick={() => void confirmReject()} disabled={saving}>
                  Confirm Reject
                </Button>
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-background-200 bg-background-100 p-4">
            <div className="flex items-start gap-2.5">
              <span className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
                <i className="ri-information-line text-foreground-500 text-[15px] leading-none"></i>
              </span>
              <p className="text-[11px] leading-relaxed text-foreground-600">
                Everything on this page is logged for audit. Government and Siyana teams both see the
                same request history, so there is never any ambiguity about what was asked or delivered.
              </p>
            </div>
          </section>
        </div>
      </div>

      {banner ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-background-200 bg-foreground-950 px-4 py-3 shadow-lg">
          <span className="w-4 h-4 flex items-center justify-center">
            <i className="ri-checkbox-circle-fill text-accent-400 text-[16px] leading-none"></i>
          </span>
          <span className="text-sm font-medium text-background-50">{banner}</span>
        </div>
      ) : null}
    </ClientLayout>
  );
}