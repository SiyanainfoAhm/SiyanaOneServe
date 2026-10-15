/**
 * SharePoint/Graph proxy for OneServe attachments.
 *
 * Browser requests are authenticated with the existing OneServe session token.
 * Microsoft credentials stay in Edge Function secrets.
 */
const TENANT_ID = Deno.env.get("MS_TENANT_ID") ?? "";
const CLIENT_ID = Deno.env.get("MS_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("MS_CLIENT_SECRET") ?? "";
const SITE_ID = Deno.env.get("SHAREPOINT_SITE_ID") ?? "";
const DRIVE_ID = Deno.env.get("SHAREPOINT_DRIVE_ID") ?? "";
const ROOT_FOLDER = (Deno.env.get("SHAREPOINT_ROOT_FOLDER") ?? "OneServe Attachments").replace(/^\/+|\/+$/g, "");
const GRAPH = "https://graph.microsoft.com/v1.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-action, x-token, x-ticket-id, x-file-name, x-content-type, x-file-path",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function requiredConfig() {
  const missing = [
    ["MS_TENANT_ID", TENANT_ID],
    ["MS_CLIENT_ID", CLIENT_ID],
    ["MS_CLIENT_SECRET", CLIENT_SECRET],
    ["SHAREPOINT_SITE_ID", SITE_ID],
    ["SHAREPOINT_DRIVE_ID", DRIVE_ID],
    ["SHAREPOINT_ROOT_FOLDER", ROOT_FOLDER],
  ].filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error(`SharePoint storage is not configured. Missing secret(s): ${missing.join(", ")}`);
}

function safeName(name: string) {
  return decodeURIComponent(name).replace(/[\\/:*?"<>|\r\n]+/g, "_").trim().slice(0, 160) || "file";
}

function encodePath(path: string) {
  return path.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

async function graphToken() {
  requiredConfig();
  const response = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(TENANT_ID)}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description || `Unable to authenticate with Microsoft Graph (${response.status}).`);
  }
  return String(result.access_token);
}

async function graphFetch(token: string, path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(`${GRAPH}${path}`, { ...init, headers });
  const result = await response.json().catch(() => ({}));
  return { response, result };
}

async function requireSession(token: string | undefined) {
  if (!token) throw new Error("Not signed in");
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) throw new Error("Storage is not configured.");
  const response = await fetch(`${url}/rest/v1/rpc/sosticket_session`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_token: token }),
  });
  if (!response.ok) throw new Error("Session expired. Please sign in again.");
}

async function getItem(token: string, path: string) {
  return graphFetch(token, `/drives/${encodeURIComponent(DRIVE_ID)}/root:/${encodePath(path)}`);
}

async function ensureFolder(token: string, path: string) {
  const parts = path.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    const next = current ? `${current}/${part}` : part;
    const found = await getItem(token, next);
    if (found.response.ok) {
      current = next;
      continue;
    }
    if (found.response.status !== 404) throw new Error(found.result?.error?.message || "Unable to inspect SharePoint folder.");
    const parent = current
      ? await getItem(token, current)
      : await graphFetch(token, `/drives/${encodeURIComponent(DRIVE_ID)}/root`);
    if (!parent.response.ok) throw new Error(parent.result?.error?.message || "Unable to create SharePoint folder.");
    const created = await graphFetch(token, `/drives/${encodeURIComponent(DRIVE_ID)}/items/${encodeURIComponent(parent.result.id)}/children`, {
      method: "POST",
      body: JSON.stringify({ name: part, folder: {}, "@microsoft.graph.conflictBehavior": "fail" }),
    });
    if (!created.response.ok && created.response.status !== 409) {
      throw new Error(created.result?.error?.message || "Unable to create SharePoint folder.");
    }
    current = next;
  }
}

async function upload(token: string, ticketId: string, fileName: string, contentType: string, bytes: Uint8Array) {
  if (!ticketId) throw new Error("Ticket is required for upload.");
  if (!bytes.byteLength) throw new Error("The selected file is empty.");
  const folder = `${ROOT_FOLDER}/tickets/${safeName(ticketId)}`;
  await ensureFolder(token, folder);
  const storedName = `${Date.now()}-${safeName(fileName)}`;
  const path = `${folder}/${storedName}`;
  const result = await graphFetch(token, `/drives/${encodeURIComponent(DRIVE_ID)}/root:/${encodePath(path)}:/content`, {
    method: "PUT",
    headers: { "Content-Type": contentType || "application/octet-stream" },
    body: bytes,
  });
  if (!result.response.ok) throw new Error(result.result?.error?.message || `SharePoint upload failed (${result.response.status}).`);
  return `sharepoint:${result.result.id}`;
}

async function download(token: string, storedPath: string) {
  const itemId = storedPath.replace(/^sharepoint:/, "").trim();
  if (!itemId) throw new Error("File is not stored in SharePoint.");
  const response = await fetch(`${GRAPH}/drives/${encodeURIComponent(DRIVE_ID)}/items/${encodeURIComponent(itemId)}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail?.error?.message || `Unable to open SharePoint file (${response.status}).`);
  }
  const headers = new Headers(CORS);
  headers.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");
  headers.set("Content-Disposition", "inline");
  return new Response(response.body, { status: 200, headers });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const token = req.headers.get("x-token") ?? "";
    await requireSession(token);
    const graph = await graphToken();
    const action = req.headers.get("x-action") ?? "";
    if (action === "upload") {
      const bytes = new Uint8Array(await req.arrayBuffer());
      const path = await upload(graph, req.headers.get("x-ticket-id") ?? "", req.headers.get("x-file-name") ?? "file", req.headers.get("x-content-type") ?? "application/octet-stream", bytes);
      return json({ path, ok: true });
    }
    if (action === "download") {
      const body = await req.json().catch(() => ({}));
      return download(graph, String(body.filePath ?? req.headers.get("x-file-path") ?? ""));
    }
    throw new Error("Unsupported file action.");
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unable to use SharePoint storage." }, 400);
  }
});
