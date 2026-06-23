import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import {
  downloadMentorImportTemplate,
  downloadStudentImportTemplate,
  importMentors,
  importProblemBank,
  importStudents,
} from "../api";

type ImportFileInput = Blob | File | FormData;

function useImportMutation(importer: (file: ImportFileInput) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importer,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.imports.all }),
  });
}

export function useImportStudents() {
  return useImportMutation(importStudents);
}

export function useImportMentors() {
  return useImportMutation(importMentors);
}

export function useImportProblemBank() {
  return useImportMutation(importProblemBank);
}

export function useDownloadStudentImportTemplate() {
  return useMutation({
    mutationFn: downloadStudentImportTemplate,
  });
}

export function useDownloadMentorImportTemplate() {
  return useMutation({
    mutationFn: downloadMentorImportTemplate,
  });
}
