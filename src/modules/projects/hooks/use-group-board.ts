import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { getGroupBoard } from "../api";
import type { BoardFilters } from "../types";
import type { EntityId } from "@/shared/types";

export function useGroupBoard(groupId: EntityId, filters?: BoardFilters) {
  return useQuery({
    queryKey: queryKeys.tasks.board(groupId, filters),
    queryFn: () => getGroupBoard(groupId, filters),
    enabled: !!groupId,
  });
}
