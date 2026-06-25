import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { getGroupDetails } from "../api";
import type { EntityId } from "@/shared/types";

export function useGroupDetails(groupId: EntityId) {
  return useQuery({
    queryKey: queryKeys.groups.detail(Number(groupId)),
    queryFn: () => getGroupDetails(groupId),
    enabled: !!groupId,
  });
}
