/**
 * Signed-in user and session token.
 *
 * `login(..., portal)` must be `"console"` or `"client"`. The RPC rejects
 * government roles on staff sign-in and staff roles on client sign-in.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/session";
import { portalForRole } from "@/lib/roles";
import { api } from "@/services/api";
import type { Portal, SessionUser } from "@/types/oneserve";

interface AuthContextValue {
  ready: boolean;
  user: SessionUser | null;
  portal: Portal | null;
  token: string | null;
  queueOpen: number;
  login: (email: string, password: string, keepSignedIn: boolean, portal: Portal) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: SessionUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [queueOpen, setQueueOpen] = useState(0);

  const hydrate = useCallback(async () => {
    // Custom token, not a Supabase JWT. Invalid/expired tokens are cleared locally.
    const existing = getSessionToken();
    if (!existing) {
      setUser(null);
      setToken(null);
      setReady(true);
      return;
    }
    try {
      const session = await api.session(existing);
      setToken(existing);
      setUser(session.user);
      setQueueOpen(session.queue_open ?? 0);
    } catch {
      clearSessionToken();
      setToken(null);
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // portal must be "console" or "client"; the RPC rejects the wrong role for that shell.
  const login = useCallback(async (email: string, password: string, keepSignedIn: boolean, portal: Portal) => {
    const result = await api.login(email, password, keepSignedIn, portal);
    setSessionToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout(token);
    } catch {
      /* still clear locally */
    }
    clearSessionToken();
    setToken(null);
    setUser(null);
    setQueueOpen(0);
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!getSessionToken()) return;
    const session = await api.session();
    setUser(session.user);
    setQueueOpen(session.queue_open ?? 0);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      portal: user ? portalForRole(user.role_key || user.role) : null,
      token,
      queueOpen,
      login,
      logout,
      refreshUser,
      setUser,
    }),
    [ready, user, token, queueOpen, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
