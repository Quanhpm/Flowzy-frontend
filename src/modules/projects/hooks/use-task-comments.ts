import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { getTaskComments } from "../api";
import type { EntityId } from "@/shared/types";

export function useTaskComments(
  groupId: EntityId,
  taskId: EntityId,
  query?: { page?: number; size?: number },
) {
  return useQuery({
    queryKey: [...queryKeys.tasks.detail(groupId, taskId), "comments", query ?? {}],
    queryFn: () => getTaskComments(groupId, taskId, query),
    enabled: !!groupId && !!taskId,
  });
}
