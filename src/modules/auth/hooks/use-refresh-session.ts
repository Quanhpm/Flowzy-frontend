import { useMutation } from "@tanstack/react-query";

import { refreshAuthSession } from "../services/auth-session.service";
import { useAuthStore } from "../stores/auth.store";

export function useRefreshSession() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: () => {
      const currentSession = useAuthStore.getState().session;

      if (!currentSession) {
        throw new Error("No auth session is available to refresh.");
      }

      return refreshAuthSession(currentSession);
    },
    onSuccess: setSession,
  });
}
