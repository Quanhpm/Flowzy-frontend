import type { AuthSession } from "../types/auth.types";

export function isAuthSessionValid(session: AuthSession | null) {
  return Boolean(session && session.expiresAt > Date.now());
}
