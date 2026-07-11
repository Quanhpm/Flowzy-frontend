import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import { closeAcademicTerm, listAcademicTerms } from "../api";

export function useAcademicTerms() {
  return useQuery({
    queryFn: listAcademicTerms,
    queryKey: queryKeys.terms.list(),
  });
}

export function useCloseAcademicTerm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeAcademicTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.terms.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin.all });
    },
  });
}
