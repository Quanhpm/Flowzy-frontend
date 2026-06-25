import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/shared/lib";
import type { ApiResponse, EmptyApiResponse } from "@/shared/types";

import type {
  CreateGroupRequest,
  GroupDetailDto,
  GroupsQuery,
  GroupSummaryDto,
  InvitationDto,
  InviteStudentRequest,
  TransferLeaderRequest,
  UpdateGroupCriteriaRequest,
  UpdateGroupRequest,
} from "../types";

export function listGroups(query?: GroupsQuery) {
  return apiGet<ApiResponse<GroupSummaryDto[]>>("/api/groups", { query });
}

export function getGroup(groupId: number) {
  return apiGet<ApiResponse<GroupDetailDto>>(`/api/groups/${groupId}`);
}

export function createGroup(payload: CreateGroupRequest) {
  return apiPost<ApiResponse<GroupDetailDto>>("/api/groups", payload);
}

export function updateGroup(groupId: number, payload: UpdateGroupRequest) {
  return apiPatch<ApiResponse<GroupDetailDto>>(
    `/api/groups/${groupId}`,
    payload,
  );
}

export function updateGroupCriteria(
  groupId: number,
  payload: UpdateGroupCriteriaRequest,
) {
  return apiPatch<ApiResponse<GroupDetailDto>>(
    `/api/groups/${groupId}/criteria`,
    payload,
  );
}

export function transferLeadership(
  groupId: number,
  payload: TransferLeaderRequest,
) {
  return apiPatch<ApiResponse<GroupDetailDto>>(
    `/api/groups/${groupId}/leader`,
    payload,
  );
}

export function removeMember(groupId: number, studentId: number) {
  return apiDelete<EmptyApiResponse>(
    `/api/groups/${groupId}/members/${studentId}`,
  );
}

export function leaveGroup(groupId: number) {
  return apiDelete<EmptyApiResponse>(`/api/groups/${groupId}/members/me`);
}

export function getMyGroups() {
  return apiGet<ApiResponse<GroupSummaryDto[]>>("/api/groups/student/me");
}

export function getMentorGroups() {
  return apiGet<ApiResponse<GroupSummaryDto[]>>("/api/groups/mentor/me");
}

export function inviteStudent(
  groupId: number,
  payload: InviteStudentRequest,
) {
  return apiPost<ApiResponse<InvitationDto>>(
    `/api/groups/${groupId}/invitations`,
    payload,
  );
}

export function getGroupInvitations(groupId: number) {
  return apiGet<ApiResponse<InvitationDto[]>>(
    `/api/groups/${groupId}/invitations`,
  );
}

export function getMyInvitations() {
  return apiGet<ApiResponse<InvitationDto[]>>("/api/groups/invitations/me");
}

export function acceptInvitation(invitationId: number) {
  return apiPost<ApiResponse<InvitationDto>>(
    `/api/groups/invitations/${invitationId}/accept`,
  );
}

export function declineInvitation(invitationId: number) {
  return apiPost<ApiResponse<InvitationDto>>(
    `/api/groups/invitations/${invitationId}/decline`,
  );
}

export function cancelInvitation(invitationId: number) {
  return apiPost<ApiResponse<InvitationDto>>(
    `/api/groups/invitations/${invitationId}/cancel`,
  );
}
