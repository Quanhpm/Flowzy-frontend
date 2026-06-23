import { apiGet, apiPost } from "@/shared/lib";
import type { ApiResponse } from "@/shared/types";

import type {
  AuthTokens,
  AuthUser,
  GoogleLoginCredentials,
  LoginCredentials,
} from "../types/auth.types";

export function login(credentials: LoginCredentials) {
  return apiPost<ApiResponse<AuthTokens>>("/api/auth/login", credentials, {
    auth: false,
  });
}

export function loginWithGoogle(credentials: GoogleLoginCredentials) {
  return apiPost<ApiResponse<AuthTokens>>("/api/auth/google", credentials, {
    auth: false,
  });
}

export function refreshAccessToken(refreshToken: string) {
  return apiPost<ApiResponse<AuthTokens>>(
    "/api/auth/refresh",
    { refreshToken },
    { auth: false },
  );
}

export function logout(accessToken?: string) {
  return apiPost<ApiResponse<null>>("/api/auth/logout", undefined, {
    accessToken,
  });
}

export function getCurrentUser(accessToken?: string) {
  return apiGet<ApiResponse<AuthUser>>("/api/auth/me", {
    accessToken,
  });
}
