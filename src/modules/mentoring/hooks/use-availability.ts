import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import { getMentorAvailability, listMyAvailability } from "../api";

export function useMyAvailability() {
  return useQuery({
    queryFn: listMyAvailability,
    queryKey: queryKeys.mentoring.availability(),
  });
}

export function useMentorAvailabilityForGroup(
  groupId: number | null | undefined,
) {
  return useQuery({
    enabled: typeof groupId === "number",
    queryFn: () => {
      if (typeof groupId !== "number") {
        throw new Error("A group id is required.");
      }

      return getMentorAvailability(groupId);
    },
    queryKey:
      typeof groupId === "number"
        ? queryKeys.mentoring.groupAvailability(groupId)
        : [...queryKeys.mentoring.all, "groups", "empty", "availability"],
  });
}
