import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { listEvaluationCriteria } from "../api";

export function useEvaluationCriteria() {
  return useQuery({
    queryKey: queryKeys.problems.criteria(),
    queryFn: () => listEvaluationCriteria(),
  });
}
