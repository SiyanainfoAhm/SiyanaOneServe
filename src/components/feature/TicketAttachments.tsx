/**
 * Add-files control on workbench and client request detail.
 * Upload bytes to Azure, then persist the blob path with sosticket_register_attachment.
 */
import { useState } from "react";
import AttachmentList, { type AttachmentItem } from "@/components/feature/AttachmentList";
import AttachmentDropzone, { type UploadFile } from "@/pages/client/create/components/AttachmentDropzone";
import { api } from "@/services/api";

interface TicketAttachmentsProps {
  attachments: AttachmentItem[];
  ticketId: string;
  ticketUuid: string;
  emptyText?: string;
  onChange: (ticket: Awaited<ReturnType<typeof api.registerAttachment>>) => void;
}

export default function TicketAttachments({
  attachments,
  ticketId,
  ticketUuid,
  emptyText,
  onChange,
}: TicketAttachmentsProps) {
  const [pending, setPending] = useState<UploadFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    const ready = pending.filter((item) => item.status === "Ready" && item.file);
    if (ready.length === 0) return;
    setBusy(true);
    setError("");
    try {
      let latest = null;
      for (const item of ready) {
        const path = await api.uploadAttachment(ticketUuid, item.file as File);
        latest = await api.registerAttachment(ticketId, item.name, path, item.byteSize, item.file?.type);
      }
      if (latest) onChange(latest);
      setPending([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload to Azure Storage.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <AttachmentList attachments={attachments} emptyText={emptyText} />
      <AttachmentDropzone files={pending} onChange={setPending} />
      {error ? (
        <p className="text-xs text-[oklch(var(--status-danger))]">{error}</p>
      ) : (
        <p className="text-[11px] text-foreground-500">
          Files and images upload to Azure Storage under <span className="font-medium">siyanaoneserve</span>.
        </p>
      )}
      {pending.length > 0 ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleUpload()}
          className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-md border border-primary-600 bg-primary-600 px-3 text-xs font-label font-medium text-background-50 hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
        >
          <i className="ri-upload-cloud-2-line text-[14px] leading-none"></i>
          {busy ? "Uploading…" : "Upload to Azure"}
        </button>
      ) : null}
    </div>
  );
}
