import { getCurrentUser, refreshAccessToken } from "../api/auth.api";
import type { AuthSession, AuthTokens } from "../types/auth.types";

export async function createAuthSession(
  tokens: AuthTokens,
): Promise<AuthSession> {
  const userResponse = await getCurrentUser(tokens.accessToken);

  return {
    tokens,
    user: userResponse.data,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
  };
}

export async function refreshAuthSession(
  session: AuthSession,
): Promise<AuthSession> {
  const refreshResponse = await refreshAccessToken(session.tokens.refreshToken);

  return createAuthSession(refreshResponse.data);
}
