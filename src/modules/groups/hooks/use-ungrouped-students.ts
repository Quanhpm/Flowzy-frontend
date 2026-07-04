import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import { getUngroupedStudents } from "../api";
import type { UngroupedStudentsQuery } from "../types";

export function useUngroupedStudents(query: UngroupedStudentsQuery) {
  return useQuery({
    enabled: Boolean(query.term && query.courseCode),
    queryFn: () => getUngroupedStudents(query),
    queryKey: queryKeys.students.ungrouped(query),
  });
}
