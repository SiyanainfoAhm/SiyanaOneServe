/** SharePoint attachment client. Browser never receives Microsoft credentials. */
import { getSessionToken } from "@/lib/session";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sosticket-sharepoint-files`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function headers(extra: Record<string, string> = {}) {
  return { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "x-token": getSessionToken() ?? "", ...extra };
}

async function call(init: RequestInit) {
  let response: Response;
  try { response = await fetch(FUNCTION_URL, init); } catch { throw new Error("Unable to reach SharePoint upload service. Refresh the page and try again."); }
  const result = (await response.json().catch(() => ({}))) as { path?: string; url?: string; error?: string };
  if (!response.ok) throw new Error(result.error || `SharePoint operation failed (${response.status})`);
  return result;
}

export async function uploadToSharePoint(ticketUuid: string, file: File): Promise<string> {
  const result = await call({ method: "POST", headers: headers({ "x-action": "upload", "x-ticket-id": ticketUuid, "x-file-name": encodeURIComponent(file.name), "x-content-type": file.type || "application/octet-stream", "Content-Type": "application/octet-stream" }), body: file });
  if (!result.path) throw new Error("SharePoint did not return a file reference.");
  return result.path;
}

export async function sharePointDownloadBlob(filePath: string): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: headers({ "x-action": "download", "Content-Type": "application/json" }),
      body: JSON.stringify({ filePath }),
    });
  } catch {
    throw new Error("Unable to reach SharePoint download service. Refresh the page and try again.");
  }
  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(result.error || `SharePoint download failed (${response.status})`);
  }
  return response.blob();
}
