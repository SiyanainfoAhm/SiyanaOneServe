/**
 * Lists ticket files and opens them via a short-lived SharePoint download URL.
 */
import { useState } from "react";
import Button from "@/components/base/Button";
import { azureDownloadUrl } from "@/lib/azureStorage";
import { sharePointDownloadBlob } from "@/lib/sharepointStorage";

export interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  kind: string;
  filePath?: string;
}

const FILE_ICON: Record<string, string> = {
  PDF: "ri-file-pdf-2-line",
  DOCX: "ri-file-word-2-line",
  XLSX: "ri-file-excel-2-line",
  Image: "ri-image-line",
  Log: "ri-file-code-line",
};

async function downloadAttachment(file: AttachmentItem) {
  if (!file.filePath) throw new Error("This file has no storage reference.");
  if (file.filePath.startsWith("sharepoint:")) {
    const blob = await sharePointDownloadBlob(file.filePath);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name || "attachment";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const url = await azureDownloadUrl(file.filePath);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name || "attachment";
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

interface AttachmentListProps {
  attachments: AttachmentItem[];
  emptyText?: string;
}

export default function AttachmentList({
  attachments,
  emptyText = "No attachments on this request.",
}: AttachmentListProps) {
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  if (attachments.length === 0) {
    return <p className="mt-2 text-sm text-foreground-500">{emptyText}</p>;
  }

  return (
    <div>
      <ul className="mt-2 flex flex-col gap-2">
        {attachments.map((file) => (
          <li
            key={file.id}
            className="flex flex-wrap items-center gap-3 rounded-md border border-background-200 bg-background-50 px-3 py-2.5 sm:flex-nowrap"
          >
            <span className="w-9 h-9 rounded-md bg-background-100 flex items-center justify-center shrink-0">
              <i
                className={`${FILE_ICON[file.kind] ?? "ri-file-line"} text-foreground-600 text-[17px] leading-none`}
              ></i>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground-900">{file.name}</p>
              <p className="text-[11px] text-foreground-500">
                {file.kind} · {file.size}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon="ri-download-2-line"
              disabled={busyId === file.id || !file.filePath}
              onClick={() => {
                setError("");
                setBusyId(file.id);
                void downloadAttachment(file)
                  .catch((err) => setError(err instanceof Error ? err.message : "Unable to download this file."))
                  .finally(() => setBusyId(""));
              }}
              className="shrink-0"
            >
              {busyId === file.id ? "Opening…" : "Download"}
            </Button>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-2 text-xs text-[oklch(var(--status-danger))]">{error}</p> : null}
    </div>
  );
}
