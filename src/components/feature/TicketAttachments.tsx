/**
 * Add-files control on workbench and client request detail.
 * Dropped or browsed files upload to Azure immediately, then persist via
 * sosticket_register_attachment.
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
  readOnly?: boolean;
  onChange: (ticket: Awaited<ReturnType<typeof api.registerAttachment>>) => void;
}

export default function TicketAttachments({
  attachments,
  ticketId,
  ticketUuid,
  emptyText,
  readOnly = false,
  onChange,
}: TicketAttachmentsProps) {
  const [pending, setPending] = useState<UploadFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFilesChange(next: UploadFile[]) {
    if (readOnly) return;
    const ready = next.filter((item) => item.status === "Ready" && item.file);
    const leftover = next.filter((item) => item.status !== "Ready");
    setPending(leftover);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload to Azure Storage.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <AttachmentList attachments={attachments} emptyText={emptyText} />
      {readOnly ? (
        <p className="text-[11px] text-foreground-500">
          Attachments are locked after this ticket is resolved or rejected.
        </p>
      ) : (
        <>
          <AttachmentDropzone files={pending} onChange={(files) => void handleFilesChange(files)} />
          {error ? (
            <p className="text-xs text-[oklch(var(--status-danger))]">{error}</p>
          ) : (
            <p className="text-[11px] text-foreground-500">
              {busy
                ? "Uploading to Azure…"
                : "Files upload to Azure automatically when you add them."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
