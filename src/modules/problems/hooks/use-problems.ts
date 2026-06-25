import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { listProblems } from "../api";
import type { ProblemsQuery } from "../types";

export function useProblems(query: ProblemsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.problems.list(query),
    queryFn: () => listProblems(query),
  });
}
