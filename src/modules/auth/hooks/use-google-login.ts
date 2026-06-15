import { useMutation } from "@tanstack/react-query";

import { loginWithGoogle } from "../api/auth.api";
import { createAuthSession } from "../services/auth-session.service";
import { useAuthStore } from "../stores/auth.store";

export function useGoogleLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (idToken: string) => {
      const loginResponse = await loginWithGoogle({ idToken });
      return createAuthSession(loginResponse.data);
    },
    onSuccess: setSession,
  });
}
