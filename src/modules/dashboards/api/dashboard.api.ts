import { apiGet } from "@/shared/lib";
import type { ApiResponse } from "@/shared/types";

import type {
  AdminDashboardExecutionStatusDto,
  AdminDashboardGroupProgressDto,
  AdminDashboardMeetingDto,
  AdminDashboardMentorDto,
  AdminDashboardProjectDto,
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

export function getAdminDashboardTimeline() {
  return apiGet<ApiResponse<AdminDashboardMeetingDto[]>>(
    "/api/dashboard/admin/timeline",
  );
}

export function getAdminDashboardProjects() {
  return apiGet<ApiResponse<AdminDashboardProjectDto[]>>(
    "/api/dashboard/admin/projects",
  );
}

export function getAdminDashboardMentors() {
  return apiGet<ApiResponse<AdminDashboardMentorDto[]>>(
    "/api/dashboard/admin/mentors",
  );
}

export function getAdminDashboardGroups() {
  return apiGet<ApiResponse<AdminDashboardGroupProgressDto[]>>(
    "/api/dashboard/admin/groups",
  );
}

export function getAdminDashboardExecutionStatus() {
  return apiGet<ApiResponse<AdminDashboardExecutionStatusDto>>(
    "/api/dashboard/admin/execution-status",
  );
}
