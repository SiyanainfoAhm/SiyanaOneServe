/**
 * Thin wrapper around `supabase.rpc`. All `sosticket_*` functions are
 * SECURITY DEFINER with RLS deny-all; the anon key is enough to execute them.
 */
import { supabase } from "@/lib/supabase";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function parseError(error: { message?: string } | null): string {
  const raw = error?.message ?? "Request failed";
  return raw.replace(/^.*ERROR:\s*/i, "").split("\n")[0] ?? raw;
}

export async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new ApiError(parseError(error));
  return data as T;
}
