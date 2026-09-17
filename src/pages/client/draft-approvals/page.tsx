/**
 * Nodal-officer inbox of Need Approval tickets. Approve → New; reject is terminal.
 */
import { useMemo, useState } from "react";
import ClientLayout from "@/pages/client/components/ClientLayout";
import ClientPageHeader from "@/pages/client/components/ClientPageHeader";
import Card from "@/components/base/Card";
import Button from "@/components/base/Button";
import EmptyState from "@/components/base/EmptyState";
import { PriorityBadge } from "@/components/base/StatusBadge";
import { useClientRequests } from "@/hooks/useClientRequestStore";
import { useAppData } from "@/context/AppDataContext";
import { api } from "@/services/api";

const BUBBLE_TONE: Record<string, string> = {
  Critical: "bg-[oklch(var(--status-danger)/0.12)] text-[oklch(var(--status-danger))]",
  High: "bg-[oklch(var(--status-warning)/0.14)] text-[oklch(var(--status-warning))]",
  Normal: "bg-primary-100 text-primary-700",
  Low: "bg-secondary-100 text-secondary-800",
};

export default function DraftApprovalPage() {
  const requests = useClientRequests();
  const { refresh, replaceTicket } = useAppData();
  const pending = useMemo(() => requests.filter((item) => item.status === "Need Approval"), [requests]);

  const [banner, setBanner] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [saving, setSaving] = useState(false);

  function flash(message: string) {
    setBanner(message);
    window.setTimeout(() => setBanner(""), 3200);
  }

  function resetReject() {
    setRejectingId(null);
    setRejectReason("");
    setRejectError("");
  }

  async function approve(id: string) {
    setSaving(true);
    try {
      const ticket = await api.approveTicket(id);
      replaceTicket(ticket);
      if (rejectingId === id) resetReject();
      flash(`${id} approved — moved to New`);
      await refresh();
    } catch (err) {
      flash(err instanceof Error ? err.message : "Unable to approve this draft.");
    } finally {
      setSaving(false);
    }
  }

  function startReject(id: string) {
    setRejectingId(id);
    setRejectReason("");
    setRejectError("");
  }

  async function confirmReject(id: string) {
    if (!rejectReason.trim()) {
      setRejectError("Please add a short reason so the requester knows what to fix.");
      return;
    }
    setSaving(true);
    try {
      const ticket = await api.rejectTicket(id, rejectReason.trim());
      replaceTicket(ticket);
      resetReject();
      flash(`${id} rejected — moved to My Requests`);
      await refresh();
    } catch (err) {
      flash(err instanceof Error ? err.message : "Unable to reject this draft.");
    } finally {
      setSaving(false);
    }
  }

  const highPriority = pending.filter(
    (item) => item.priority === "Critical" || item.priority === "High",
  ).length;
  const projectsAffected = new Set(pending.map((item) => item.project)).size;

  return (
    <ClientLayout>
      <ClientPageHeader
        title="Draft Approval Request"
        subtitle="Review drafts raised by your department. Approved drafts move to New and are submitted to Siyana; rejected drafts move to My Requests with a Rejected status."
        breadcrumb={[{ label: "Dashboard", to: "/client/dashboard" }, { label: "Draft Approval Request" }]}
      />

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-label font-medium text-foreground-500">Pending your approval</p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">{pending.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-label font-medium text-foreground-500">Critical &amp; high priority</p>
          <p className="mt-2 font-heading text-3xl font-bold text-[oklch(var(--status-warning))]">
            {highPriority}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-label font-medium text-foreground-500">Projects affected</p>
          <p className="mt-2 font-heading text-3xl font-bold text-foreground-950">{projectsAffected}</p>
        </Card>
      </div>

      {pending.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            icon="ri-checkbox-multiple-line"
            title="No drafts waiting on you"
            description="Every draft from your department has been approved or rejected. Approved drafts appear in My Requests as New."
          />
        </Card>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {pending.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3.5">
                  <span
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      BUBBLE_TONE[item.priority] ?? BUBBLE_TONE.Normal
                    }`}
                  >
                    <i className="ri-draft-line text-[20px] leading-none"></i>
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-medium text-primary-700">{item.id}</span>
                      <PriorityBadge priority={item.priority} />
                      <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(var(--status-warning)/0.3)] bg-[oklch(var(--status-warning)/0.12)] px-2 py-0.5 text-[11px] font-label font-semibold text-[oklch(var(--status-warning))]">
                        <i className="ri-user-received-line text-[12px] leading-none"></i>
                        Need Approval
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-foreground-950">{item.title}</p>
                    <p className="mt-1 text-[11px] text-foreground-500">
                      {item.project} · {item.category} · {item.requestType}
                      {item.submittedBy ? ` · raised by ${item.submittedBy}` : ""} · {item.updated}
                    </p>
                  </div>
                </div>

                <div className="flex w-full items-center gap-2 lg:w-auto lg:shrink-0">
                  <Button variant="outline" icon="ri-close-line" onClick={() => startReject(item.id)} disabled={saving}>
                    Reject
                  </Button>
                  <Button variant="primary" icon="ri-check-line" onClick={() => void approve(item.id)} disabled={saving}>
                    Approve
                  </Button>
                </div>
              </div>

              {rejectingId === item.id ? (
                <div className="mt-4 rounded-lg border border-[oklch(var(--status-danger)/0.3)] bg-[oklch(var(--status-danger)/0.05)] p-3.5">
                  <label
                    htmlFor={`reject-${item.id}`}
                    className="block text-xs font-label font-semibold text-foreground-800"
                  >
                    Reason for rejection
                  </label>
                  <textarea
                    id={`reject-${item.id}`}
                    value={rejectReason}
                    onChange={(event) => {
                      setRejectReason(event.target.value);
                      setRejectError("");
                    }}
                    rows={3}
                    maxLength={300}
                    placeholder="Tell the requester what needs to change before this draft can be approved…"
                    className="mt-1.5 w-full resize-none rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                  {rejectError ? (
                    <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-[oklch(var(--status-danger))]">
                      <i className="ri-error-warning-line text-[13px] leading-none mt-0.5"></i>
                      {rejectError}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={resetReject}>
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon="ri-close-line"
                      onClick={() => void confirmReject(item.id)}
                      disabled={saving}
                    >
                      Confirm Reject
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

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
