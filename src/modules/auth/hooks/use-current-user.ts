import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import { getCurrentUser } from "../api/auth.api";
import { useAuthStore } from "../stores/auth.store";

export function useCurrentUser() {
  const accessToken = useAuthStore(
    (state) => state.session?.tokens.accessToken,
  );

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => getCurrentUser(accessToken),
    queryKey: queryKeys.auth.me,
  });
}
