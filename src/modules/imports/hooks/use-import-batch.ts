import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import { getImportBatch, getImportBatchErrors } from "../api";

export function useImportBatch(batchId: number | null | undefined) {
  return useQuery({
    enabled: typeof batchId === "number",
    queryFn: () => {
      if (typeof batchId !== "number") {
        throw new Error("A batch id is required.");
      }

      return getImportBatch(batchId);
    },
    queryKey:
      typeof batchId === "number"
        ? queryKeys.imports.batch(batchId)
        : [...queryKeys.imports.all, "batch", "empty"],
  });
}

export function useImportBatchErrors(batchId: number | null | undefined) {
  return useQuery({
    enabled: typeof batchId === "number",
    queryFn: () => {
      if (typeof batchId !== "number") {
        throw new Error("A batch id is required.");
      }

      return getImportBatchErrors(batchId);
    },
    queryKey:
      typeof batchId === "number"
        ? queryKeys.imports.batchErrors(batchId)
        : [...queryKeys.imports.all, "batch", "empty", "errors"],
  });
}
