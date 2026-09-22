/**
 * Power Automate mailer used by Test email and Forgot password.
 *
 * Payload MUST be nested: { success, email: { toEmail, ccEmail, replyTo, subject,
 * bodyHtml, leadTypeHtml, submittedAtHtml, detailsTableHtml } }.
 * A flat toemail field leaves Send Email V2 "To" empty (Bad Request).
 *
 * action=test  → probe message
 * action=forgot → service-role RPC sosticket_prepare_password_reset, then send the new password
 *
 * Reply-To: tickets@siyanainfo.com (Outlook From still follows the flow connection).
 */
const WEBHOOK =
  "https://default25ff3e19eb6b4343af6d1f96004e62.ab.environment.api.powerplatform.com/powerautomate/automations/direct/cu/18/workflows/4f70bd1565c140a78621b2ad2a3d618f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_FpfAY_F-d0VpUpINYLRtjFMY_t4mu58TCRruIP62u4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function sendFlowEmail(to: string, subject: string, bodyhtml: string) {
  const submittedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const payload = {
    success: true,
    email: {
      toEmail: to,
      ccEmail: "",
      fromEmail: "tickets@siyanainfo.com",
      replyTo: "tickets@siyanainfo.com",
      subject,
      bodyHtml: bodyhtml,
      leadTypeHtml: "",
      submittedAtHtml: submittedAt,
      detailsTableHtml: "",
    },
  };
  const response = await fetch(WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const detail = await response.text();
  return {
    ok: response.ok || response.status === 202,
    status: response.status,
    detail: detail.slice(0, 500),
    to,
  };
}

async function prepareReset(email: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !service) throw new Error("Mail service is not configured.");
  const response = await fetch(`${url}/rest/v1/rpc/sosticket_prepare_password_reset`, {
    method: "POST",
    headers: {
      apikey: service,
      Authorization: `Bearer ${service}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_email: email }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || "Unable to reset this password.");
  return result as {
    found?: boolean;
    email?: string;
    portal?: "client" | "console";
    subject?: string;
    html?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim();
    const action = String(body.action ?? "test");
    if (!email.includes("@")) return json({ ok: false, error: "Enter a valid email address." }, 400);

    if (action === "forgot") {
      const reset = await prepareReset(email);
      if (!reset.found || !reset.email || !reset.html) {
        return json({ ok: false, error: "No OneServe account uses this email" }, 400);
      }
      const sent = await sendFlowEmail(reset.email, reset.subject || "Your Siyana OneServe password has been reset", reset.html);
      if (!sent.ok) {
        return json({ ok: false, error: sent.detail || `Password email failed (${sent.status})` }, 400);
      }
      return json({ ok: true, sent: true, portal: reset.portal, email: reset.email, status: sent.status });
    }

    const sent = await sendFlowEmail(
      email,
      "Siyana OneServe test email",
      "<p>This is a Siyana OneServe test email from tickets@siyanainfo.com.</p><p>If you received this, Power Automate is working.</p>",
    );
    return json(sent);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send email.";
    return json({ ok: false, error: message }, 400);
  }
});
