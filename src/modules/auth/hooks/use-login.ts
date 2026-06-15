import { useMutation } from "@tanstack/react-query";

import { login } from "../api/auth.api";
import { createAuthSession } from "../services/auth-session.service";
import { useAuthStore } from "../stores/auth.store";
import type { LoginCredentials } from "../types/auth.types";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const loginResponse = await login(credentials);
      return createAuthSession(loginResponse.data);
    },
    onSuccess: setSession,
  });
}
