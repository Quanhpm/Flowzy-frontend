import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { getTaskActivities } from "../api";
import type { EntityId } from "@/shared/types";

export function useTaskActivities(
  groupId: EntityId,
  taskId: EntityId,
  query?: { page?: number; size?: number },
) {
  return useQuery({
    queryKey: [...queryKeys.tasks.detail(groupId, taskId), "activities", query ?? {}],
    queryFn: () => getTaskActivities(groupId, taskId, query),
    enabled: !!groupId && !!taskId,
  });
}
