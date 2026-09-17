/**
 * Opaque OneServe session token in localStorage.
 * The token is hashed server-side; this is not a Supabase JWT.
 */
const TOKEN_KEY = "sosticket_token";

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSessionToken() {
  localStorage.removeItem(TOKEN_KEY);
}
