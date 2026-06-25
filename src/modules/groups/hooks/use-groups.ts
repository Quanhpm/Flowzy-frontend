import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import {
  getGroup,
  getMentorGroups,
  getMyGroups,
  listGroups,
} from "../api";
import type { GroupsQuery } from "../types";

export function useGroups(query: GroupsQuery = {}) {
  return useQuery({
    queryFn: () => listGroups(query),
    queryKey: queryKeys.groups.list(query),
  });
}

export function useGroup(groupId: number | null | undefined) {
  return useQuery({
    enabled: typeof groupId === "number",
    queryFn: () => {
      if (typeof groupId !== "number") {
        throw new Error("A group id is required.");
      }

      return getGroup(groupId);
    },
    queryKey:
      typeof groupId === "number"
        ? queryKeys.groups.detail(groupId)
        : [...queryKeys.groups.all, "detail", "empty"],
  });
}

export function useMyGroups() {
  return useQuery({
    queryFn: getMyGroups,
    queryKey: queryKeys.groups.studentMe(),
  });
}

export function useMentorGroups() {
  return useQuery({
    queryFn: getMentorGroups,
    queryKey: queryKeys.groups.mentorMe(),
  });
}
