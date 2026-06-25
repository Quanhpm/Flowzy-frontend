import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import { listProblemDomains } from "../api";
import type { DomainsQuery } from "../types";

export function useProblemDomains(query?: DomainsQuery) {
  return useQuery({
    queryKey: queryKeys.problems.domains(query),
    queryFn: () => listProblemDomains(query),
  });
}
