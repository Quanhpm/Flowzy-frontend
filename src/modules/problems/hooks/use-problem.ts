import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { getProblem } from "../api";
import type { EntityId } from "@/shared/types";

export function useProblem(id: EntityId) {
  return useQuery({
    queryKey: queryKeys.problems.detail(id),
    queryFn: () => getProblem(id),
    enabled: !!id,
  });
}
