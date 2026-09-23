/**
 * OneServe API surface.
 *
 * Most methods call a `sosticket_*` RPC with `p_token`.
 * Files go through Azure (`uploadToAzure`); forgot-password mail goes through
 * the Power Automate edge function, not pg_net, so the nested payload matches
 * `email.toEmail` / `email.bodyHtml`.
 */
import { getSessionToken } from "@/lib/session";
import { uploadToAzure } from "@/lib/azureStorage";
import { sendForgotPasswordEmail } from "@/lib/testEmail";
import { rpc } from "@/services/rpc";
import type {
  DashboardStats,
  LoginResult,
  NotificationRecord,
  OrgRecord,
  ProjectRecord,
  SessionResult,
  SessionUser,
  TicketRecord,
} from "@/types/oneserve";

function tokenOrThrow(token?: string | null) {
  const value = token ?? getSessionToken();
  if (!value) throw new Error("Not signed in");
  return value;
}

export const api = {
  /** Rejects if this role is not allowed on `portal` (see sosticket_login). */
  login(email: string, password: string, keepSignedIn: boolean, portal: "console" | "client") {
    return rpc<LoginResult>("sosticket_login", {
      p_email: email,
      p_password: password,
      p_keep_signed_in: keepSignedIn,
      p_portal: portal,
    });
  },
  logout(token?: string | null) {
    const value = token ?? getSessionToken();
    if (!value) return Promise.resolve({ ok: true });
    return rpc<{ ok: boolean }>("sosticket_logout", { p_token: value });
  },
  session(token?: string | null) {
    return rpc<SessionResult>("sosticket_session", { p_token: tokenOrThrow(token) });
  },
  changePassword(oldPassword: string, nextPassword: string) {
    return rpc<{ ok: boolean }>("sosticket_change_password", {
      p_token: tokenOrThrow(),
      p_old: oldPassword,
      p_new: nextPassword,
    });
  },
  /** Resets the password and emails it via Power Automate (nested `email` body). */
  async forgotPassword(email: string) {
    const result = await sendForgotPasswordEmail(email);
    return {
      ok: true as const,
      sent: true as const,
      portal: result.portal,
      email: result.email ?? email,
    };
  },
  listOrganizations() {
    return rpc<OrgRecord[]>("sosticket_list_organizations", { p_token: tokenOrThrow() });
  },
  listProjects() {
    return rpc<ProjectRecord[]>("sosticket_list_projects", { p_token: tokenOrThrow() });
  },
  getProject(code: string) {
    return rpc<ProjectRecord>("sosticket_get_project", { p_token: tokenOrThrow(), p_code: code });
  },
  /** Creates the org row if `organization` is a new name (fixes 400 on first project). */
  upsertProject(payload: Record<string, unknown>) {
    return rpc<ProjectRecord>("sosticket_upsert_project", { p_token: tokenOrThrow(), p_payload: payload });
  },
  listUsers(projectId?: string | null) {
    return rpc<SessionUser[]>("sosticket_list_users", {
      p_token: tokenOrThrow(),
      p_project_id: projectId ?? null,
    });
  },
  inviteUser(payload: Record<string, unknown>) {
    // Role decides portal: government_* → client, everyone else → console.
    return rpc<SessionUser>("sosticket_invite_user", { p_token: tokenOrThrow(), p_payload: payload });
  },
  resendInvite(userId: string, password?: string) {
    return rpc<SessionUser>("sosticket_resend_invite", {
      p_token: tokenOrThrow(),
      p_user_id: userId,
      p_password: password ?? null,
    });
  },
  updateUser(payload: Record<string, unknown>) {
    return rpc<SessionUser>("sosticket_update_user", { p_token: tokenOrThrow(), p_payload: payload });
  },
  listTickets(filters: Record<string, unknown> = {}) {
    return rpc<TicketRecord[]>("sosticket_list_tickets", { p_token: tokenOrThrow(), p_filters: filters });
  },
  getTicket(id: string) {
    return rpc<TicketRecord>("sosticket_get_ticket", { p_token: tokenOrThrow(), p_ticket_id: id });
  },
  createTicket(payload: Record<string, unknown>) {
    return rpc<TicketRecord>("sosticket_create_ticket", { p_token: tokenOrThrow(), p_payload: payload });
  },
  updateTicket(payload: Record<string, unknown>) {
    return rpc<TicketRecord>("sosticket_update_ticket", { p_token: tokenOrThrow(), p_payload: payload });
  },
  addMessage(ticketId: string, body: string, visibility: "client" | "internal" = "client") {
    // Client-visible notes appear on both the government request thread and the staff workbench.
    return rpc<TicketRecord>("sosticket_add_message", {
      p_token: tokenOrThrow(),
      p_ticket_id: ticketId,
      p_body: body,
      p_visibility: visibility,
    });
  },
  registerAttachment(ticketId: string, fileName: string, filePath: string, fileSize?: number, mimeType?: string) {
    // filePath is the Azure blob path returned by uploadToAzure, not a Supabase Storage key.
    return rpc<TicketRecord>("sosticket_register_attachment", {
      p_token: tokenOrThrow(),
      p_ticket_id: ticketId,
      p_file_name: fileName,
      p_file_path: filePath,
      p_file_size: fileSize ?? null,
      p_mime_type: mimeType ?? null,
    });
  },
  async uploadAttachment(ticketUuid: string, file: File) {
    // Proxy through sosticket-azure-sas. Never PUT from the browser.
    return uploadToAzure(ticketUuid, file);
  },
  dashboard(projectId?: string | null) {
    return rpc<DashboardStats>("sosticket_dashboard_stats", {
      p_token: tokenOrThrow(),
      p_project_id: projectId ?? null,
    });
  },
  reports(projectId?: string | null) {
    return rpc<Record<string, unknown>>("sosticket_reports", {
      p_token: tokenOrThrow(),
      p_project_id: projectId ?? null,
    });
  },
  updateProfile(fullName?: string, notifyEmail?: boolean, notifyInApp?: boolean) {
    return rpc<SessionUser>("sosticket_update_profile", {
      p_token: tokenOrThrow(),
      p_full_name: fullName ?? null,
      p_notify_email: notifyEmail ?? null,
      p_notify_in_app: notifyInApp ?? null,
    });
  },
  listNotifications() {
    return rpc<NotificationRecord[]>("sosticket_list_notifications", { p_token: tokenOrThrow() });
  },
  markNotificationsRead(ids?: string[]) {
    return rpc<NotificationRecord[]>("sosticket_mark_notifications_read", {
      p_token: tokenOrThrow(),
      p_ids: ids ?? null,
    });
  },
};
