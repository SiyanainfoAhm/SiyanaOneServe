/**
 * Power Automate mail via `sosticket-test-email`.
 *
 * `action: "test"` sends a probe. `action: "forgot"` resets the password then
 * emails it. The function posts `{ success, email: { toEmail, bodyHtml, … } }`
 * — a flat `toemail` field leaves To empty and the flow returns Bad Request.
 */
const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sosticket-test-email`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function postMail(payload: Record<string, string>) {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    sent?: boolean;
    status?: number;
    detail?: string;
    error?: string;
    to?: string;
    email?: string;
    portal?: "client" | "console";
  };
  if (!response.ok || !result.ok) {
    throw new Error(result.error || result.detail || `Email failed (${result.status || response.status})`);
  }
  return result;
}

export async function sendTestEmail(email: string) {
  return postMail({ email, action: "test" });
}

export async function sendForgotPasswordEmail(email: string) {
  return postMail({ email, action: "forgot" });
}
