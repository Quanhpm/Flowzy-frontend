import { apiGet } from "@/shared/lib";
import type { ApiResponse } from "@/shared/types";

import type {
  DashboardGroupProgressDto,
  DashboardMeetingDto,
  DashboardProjectDto,
  DashboardStudentProgressDto,
} from "../types";

export function getStudentDashboardGroups() {
  return apiGet<ApiResponse<DashboardGroupProgressDto[]>>(
    "/api/dashboard/student/groups",
  );
}

export function getStudentDashboardProjects() {
  return apiGet<ApiResponse<DashboardProjectDto[]>>(
    "/api/dashboard/student/projects",
  );
}

export function getStudentDashboardProgress() {
  return apiGet<ApiResponse<DashboardStudentProgressDto>>(
    "/api/dashboard/student/progress",
  );
}

export function getMentorDashboardGroups() {
  return apiGet<ApiResponse<DashboardGroupProgressDto[]>>(
    "/api/dashboard/mentor/groups",
  );
}

export function getMentorDashboardMeetings() {
  return apiGet<ApiResponse<DashboardMeetingDto[]>>(
    "/api/dashboard/mentor/meetings",
  );
}
