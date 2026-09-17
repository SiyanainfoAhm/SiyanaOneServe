/**
 * Drag-and-drop file picker. Bytes go to Azure only after the parent calls uploadToAzure.
 */
import { useRef, useState } from "react";

export interface UploadFile {
  id: string;
  name: string;
  size: string;
  status: "Ready" | "Unsupported";
  file?: File;
  byteSize?: number;
}

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4";
const EXT_ALLOWED = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "mp4"];

const FILE_ICON: Record<string, string> = {
  pdf: "ri-file-pdf-2-line",
  doc: "ri-file-word-2-line",
  docx: "ri-file-word-2-line",
  xls: "ri-file-excel-2-line",
  xlsx: "ri-file-excel-2-line",
  png: "ri-image-line",
  jpg: "ri-image-line",
  jpeg: "ri-image-line",
  mp4: "ri-video-line",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extOf(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export default function AttachmentDropzone({
  files,
  onChange,
}: {
  files: UploadFile[];
  onChange: (files: UploadFile[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const next: UploadFile[] = Array.from(list).map((file, index) => {
      const ext = extOf(file.name);
      return {
        id: `${Date.now()}-${index}-${file.name}`,
        name: file.name,
        size: formatSize(file.size),
        status: EXT_ALLOWED.includes(ext) ? "Ready" : "Unsupported",
        file,
        byteSize: file.size,
      };
    });
    onChange([...files, ...next]);
  }

  function removeFile(id: string) {
    onChange(files.filter((file) => file.id !== id));
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer ${
          dragging ? "border-primary-400 bg-primary-50" : "border-background-300 bg-background-50 hover:bg-background-100"
        }`}
      >
        <span className="w-12 h-12 rounded-lg bg-background-100 border border-background-200 flex items-center justify-center">
          <i className="ri-upload-cloud-2-line text-foreground-500 text-[24px] leading-none"></i>
        </span>
        <p className="mt-3 text-sm font-medium text-foreground-900">
          Drag and drop files here, or <span className="text-primary-700">browse</span>
        </p>
        <p className="mt-1 text-[11px] text-foreground-500">
          Supported: PDF, DOCX, XLSX, images and video · up to 25 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {files.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((file) => {
            const ext = extOf(file.name);
            const unsupported = file.status === "Unsupported";
            return (
              <li
                key={file.id}
                className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${
                  unsupported ? "border-[oklch(var(--status-danger)/0.3)] bg-[oklch(var(--status-danger)/0.06)]" : "border-background-200 bg-background-50"
                }`}
              >
                <span className="w-8 h-8 rounded-md bg-background-100 flex items-center justify-center shrink-0">
                  <i className={`${FILE_ICON[ext] ?? "ri-file-line"} text-foreground-600 text-[16px] leading-none`}></i>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground-900">{file.name}</p>
                  <p className="text-[11px] text-foreground-500">{file.size}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-label font-semibold whitespace-nowrap ${
                    unsupported
                      ? "border-[oklch(var(--status-danger)/0.3)] text-[oklch(var(--status-danger))]"
                      : "border-accent-200 bg-accent-50 text-accent-700"
                  }`}
                >
                  <i className={`${unsupported ? "ri-error-warning-line" : "ri-check-line"} text-[12px] leading-none`}></i>
                  {file.status}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
                  aria-label={`Remove ${file.name}`}
                >
                  <i className="ri-close-line text-[15px] leading-none"></i>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}