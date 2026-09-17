/**
 * Azure Blob helpers.
 *
 * The browser never PUTs to Azure (no blob CORS). Files are posted to the
 * `sosticket-azure-sas` edge function, which writes with SharedKeyLite and
 * returns a read SAS for download. Paths:
 * siyanacontainer/siyanaoneserve/{images|files}/{ticketUuid}/…
 */
import { getSessionToken } from "@/lib/session";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sosticket-azure-sas`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function functionHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    "x-token": getSessionToken() ?? "",
    ...extra,
  };
}

async function callAzureFunction(init: RequestInit): Promise<Record<string, string>> {
  let response: Response;
  try {
    response = await fetch(FUNCTION_URL, init);
  } catch {
    throw new Error("Unable to reach Azure upload service. Refresh the page and try again.");
  }
  const result = (await response.json().catch(() => ({}))) as { path?: string; url?: string; error?: string };
  if (!response.ok) {
    throw new Error(result.error || `Azure upload failed (${response.status})`);
  }
  return result;
}

export async function uploadToAzure(ticketUuid: string, file: File): Promise<string> {
  const result = await callAzureFunction({
    method: "POST",
    headers: functionHeaders({
      "x-action": "upload",
      "x-ticket-id": ticketUuid,
      "x-file-name": encodeURIComponent(file.name),
      "x-content-type": file.type || "application/octet-stream",
      "Content-Type": "application/octet-stream",
    }),
    body: file,
  });
  if (!result.path) throw new Error("Azure did not return a file path.");
  return result.path;
}

export async function azureDownloadUrl(blobPath: string): Promise<string> {
  const result = await callAzureFunction({
    method: "POST",
    headers: functionHeaders({
      "x-action": "download",
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ token: getSessionToken(), action: "download", blobPath }),
  });
  if (!result.url) throw new Error("Unable to open this Azure file.");
  return result.url;
}
