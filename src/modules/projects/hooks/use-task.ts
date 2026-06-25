import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { getTask } from "../api";
import type { EntityId } from "@/shared/types";

export function useTask(groupId: EntityId, taskId: EntityId) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(groupId, taskId),
    queryFn: () => getTask(groupId, taskId),
    enabled: !!groupId && !!taskId,
  });
}
