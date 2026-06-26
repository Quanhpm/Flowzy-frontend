import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { getMyTasks } from "../api";
import type { MyTasksQuery } from "../types";

export function useMyTasks(query?: MyTasksQuery) {
  return useQuery({
    queryKey: queryKeys.tasks.mine(query),
    queryFn: () => getMyTasks(query),
  });
}
