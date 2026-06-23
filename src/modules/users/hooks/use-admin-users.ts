import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import { listAdminUsers } from "../api";
import type { AdminUsersQuery } from "../types";

export function useAdminUsers(query: AdminUsersQuery = {}) {
  return useQuery({
    queryFn: () => listAdminUsers(query),
    queryKey: queryKeys.users.list(query),
  });
}
