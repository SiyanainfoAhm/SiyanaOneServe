/**
 * Portal mapping (must match `sosticket_is_client_role` in Postgres).
 *
 * Government Nodal Officer + Government Requester → Client Portal.
 * Every other role → Operations Console. Access is equal inside each portal.
 */
export const CLIENT_ROLE_KEYS = ["government_nodal_officer", "government_requester"] as const;

export function isClientRole(role?: string | null): boolean {
  // Accepts RPC keys and UI labels ("Government Nodal Officer", leftover "Nodal Officer").
  const value = (role ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  return (
    value === "government_nodal_officer" ||
    value === "government_requester" ||
    role === "Government Nodal Officer" ||
    role === "Government Requester" ||
    role === "Nodal Officer"
  );
}

export function portalForRole(role?: string | null): "client" | "console" {
  return isClientRole(role) ? "client" : "console";
}
