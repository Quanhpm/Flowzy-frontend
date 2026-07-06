import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import {
  getMentorDashboardGroups,
  getMentorDashboardMeetings,
} from "../api";

export function useMentorDashboardGroups() {
  return useQuery({
    queryFn: getMentorDashboardGroups,
    queryKey: queryKeys.dashboard.mentorGroups(),
  });
}

export function useMentorDashboardMeetings() {
  return useQuery({
    queryFn: getMentorDashboardMeetings,
    queryKey: queryKeys.dashboard.mentorMeetings(),
  });
}
