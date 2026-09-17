/**
 * Azure Blob proxy for OneServe attachments.
 *
 * Browser never PUTs to Azure (no blob CORS). This function:
 *  - verifies the custom session via sosticket_session (verify_jwt is false)
 *  - uploads with SharedKeyLite to siyanacontainer/siyanaoneserve/{images|files}/{ticketUuid}/…
 *  - returns a complete read SAS (sv, st, se, sr, sp, spr, sig) for download
 *
 * Storage key lives only in the Edge Function secret AZURE_STORAGE_ACCOUNT_KEY.
 * Never put it in git or in VITE_ browser env.
 */
const ACCOUNT = Deno.env.get("AZURE_STORAGE_ACCOUNT") ?? "siyanastorage";
const KEY = Deno.env.get("AZURE_STORAGE_ACCOUNT_KEY") ?? "";
const CONTAINER = Deno.env.get("AZURE_STORAGE_CONTAINER") ?? "siyanacontainer";
const ROOT = "siyanaoneserve";
const VERSION = "2021-08-06";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-action, x-token, x-ticket-id, x-file-name, x-content-type, x-blob-path",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function safeName(name: string) {
  return decodeURIComponent(name).replace(/[^\w.\-]+/g, "_").slice(0, 160);
}

function isImage(fileName: string, contentType?: string) {
  if (contentType?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName);
}

function blobPathFromStored(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.replace(/^\/+/, "").split("/").map((part) => decodeURIComponent(part));
      if (parts[0] === CONTAINER) return parts.slice(1).join("/");
      return parts.join("/");
    } catch {
      return trimmed;
    }
  }
  return trimmed.replace(/^\/+/, "");
}

function isoUtc(date: Date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

async function hmacBase64(message: string) {
  if (!KEY) throw new Error("Azure storage is not configured.");
  const keyBytes = Uint8Array.from(atob(KEY), (char) => char.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function azureErrorMessage(detail: string, status: number) {
  const message = detail.match(/<Message>([\s\S]*?)<\/Message>/i)?.[1]?.trim();
  const code = detail.match(/<Code>([\s\S]*?)<\/Code>/i)?.[1]?.trim();
  if (message && code) return `${code}: ${message}`;
  if (message) return message;
  return detail.slice(0, 240) || `Azure upload failed (${status})`;
}

async function azurePut(blobName: string, data: Uint8Array, contentType: string) {
  const encodedBlob = blobName.split("/").map(encodeURIComponent).join("/");
  const url = `https://${ACCOUNT}.blob.core.windows.net/${CONTAINER}/${encodedBlob}`;
  const date = new Date().toUTCString();
  const headers: Record<string, string> = {
    "x-ms-blob-type": "BlockBlob",
    "x-ms-date": date,
    "x-ms-version": VERSION,
    "Content-Type": contentType,
  };
  const canonHeaders = ["x-ms-blob-type", "x-ms-date", "x-ms-version"]
    .map((key) => `${key}:${headers[key].trim()}`)
    .join("\n") + "\n";
  const stringToSign = ["PUT", "", contentType, ""].join("\n") + "\n" +
    canonHeaders + `/${ACCOUNT}/${CONTAINER}/${blobName}`;
  headers.Authorization = `SharedKeyLite ${ACCOUNT}:${await hmacBase64(stringToSign)}`;

  const response = await fetch(url, { method: "PUT", headers, body: data });
  if (!response.ok) {
    throw new Error(azureErrorMessage(await response.text(), response.status));
  }
}

async function signedReadUrl(blobName: string, minutes = 30) {
  const now = new Date();
  const start = isoUtc(new Date(now.getTime() - 60_000));
  const expiry = isoUtc(new Date(now.getTime() + minutes * 60_000));
  const permissions = "r";
  const resource = "b";
  const protocol = "https";
  const stringToSign = [
    permissions,
    start,
    expiry,
    `/blob/${ACCOUNT}/${CONTAINER}/${blobName}`,
    "",
    "",
    protocol,
    VERSION,
    resource,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ].join("\n");
  const sig = encodeURIComponent(await hmacBase64(stringToSign));
  const encodedBlob = blobName.split("/").map(encodeURIComponent).join("/");
  return `https://${ACCOUNT}.blob.core.windows.net/${CONTAINER}/${encodedBlob}?sv=${VERSION}&st=${encodeURIComponent(start)}&se=${encodeURIComponent(expiry)}&sr=${resource}&sp=${permissions}&spr=${protocol}&sig=${sig}`;
}

async function requireSession(token: string | undefined) {
  if (!token) throw new Error("Not signed in");
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) throw new Error("Storage is not configured");
  const response = await fetch(`${url}/rest/v1/rpc/sosticket_session`, {
    method: "POST",
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_token: token }),
  });
  if (!response.ok) throw new Error("Session expired. Please sign in again.");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const action = req.headers.get("x-action") ?? "";
    const token = req.headers.get("x-token") ?? "";

    if (action === "upload") {
      await requireSession(token);
      const ticketId = (req.headers.get("x-ticket-id") ?? "").trim();
      const fileName = safeName(req.headers.get("x-file-name") ?? "file");
      const contentType = req.headers.get("x-content-type") || "application/octet-stream";
      if (!ticketId) throw new Error("Ticket is required for upload.");
      const folder = isImage(fileName, contentType) ? "images" : "files";
      const blobPath = `${ROOT}/${folder}/${ticketId}/${Date.now()}-${fileName}`;
      const bytes = new Uint8Array(await req.arrayBuffer());
      if (bytes.byteLength === 0) throw new Error("The selected file is empty.");
      await azurePut(blobPath, bytes, contentType);
      return json({ path: blobPath, ok: true });
    }

    const body = await req.json().catch(() => ({}));
    await requireSession(token || body.token);
    const blobPath = blobPathFromStored(String(body.blobPath ?? req.headers.get("x-blob-path") ?? ""));
    if (!blobPath.startsWith(`${ROOT}/`)) throw new Error("File is not stored on Azure.");
    return json({ path: blobPath, url: await signedReadUrl(blobPath) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to use Azure storage.";
    return json({ error: message }, 400);
  }
});
