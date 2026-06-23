import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import { getAdminUser } from "../api";

export function useAdminUser(userId: number | null | undefined) {
  return useQuery({
    enabled: typeof userId === "number",
    queryFn: () => {
      if (typeof userId !== "number") {
        throw new Error("A user id is required.");
      }

      return getAdminUser(userId);
    },
    queryKey:
      typeof userId === "number"
        ? queryKeys.users.detail(userId)
        : [...queryKeys.users.all, "detail", "empty"],
  });
}
