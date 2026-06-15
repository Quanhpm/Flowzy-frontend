import { apiRequest } from "@/shared/lib";

import type {
  ApiResponse,
  AuthTokens,
  AuthUser,
  GoogleLoginCredentials,
  LoginCredentials,
} from "../types/auth.types";

export function login(credentials: LoginCredentials) {
  return apiRequest<ApiResponse<AuthTokens>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function loginWithGoogle(credentials: GoogleLoginCredentials) {
  return apiRequest<ApiResponse<AuthTokens>>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getCurrentUser(accessToken: string) {
  return apiRequest<ApiResponse<AuthUser>>("/api/auth/me", {
    accessToken,
  });
}
