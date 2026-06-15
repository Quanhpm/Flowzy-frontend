import { getCurrentUser } from "../api/auth.api";
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
