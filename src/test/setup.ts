/**
 * Vitest setup. jsdom + Testing Library matchers.
 * Supabase URL/anon key come from vite.config.ts `test.env` so the client can construct.
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
});
