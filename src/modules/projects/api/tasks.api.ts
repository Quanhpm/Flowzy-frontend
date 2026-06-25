import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/shared/lib";
import type { ApiResponse, EmptyApiResponse, EntityId, PageResponse } from "@/shared/types";
import type {
  AddChecklistItemRequest,
  AddCommentRequest,
  BoardFilters,
  ChecklistItemDto,
  CreateTaskRequest,
  GroupTaskBoardDto,
  GroupDetailDto,
  MoveTaskRequest,
  MyTasksQuery,
  ReplaceAssigneesRequest,
  TaskActivityDto,
  TaskCommentDto,
  TaskDetailDto,
  TaskSummaryDto,
  GroupSummaryDto,
  UpdateChecklistItemRequest,
  UpdateCommentRequest,
  UpdateTaskRequest,
} from "../types";

export function getGroupBoard(groupId: EntityId, filters?: BoardFilters) {
  return apiGet<ApiResponse<GroupTaskBoardDto>>(
    `/api/groups/${groupId}/board`,
    { query: filters },
  );
}

export function createTask(groupId: EntityId, payload: CreateTaskRequest) {
  return apiPost<ApiResponse<TaskDetailDto>>(
    `/api/groups/${groupId}/tasks`,
    payload,
  );
}

export function getTask(groupId: EntityId, taskId: EntityId) {
  return apiGet<ApiResponse<TaskDetailDto>>(
    `/api/groups/${groupId}/tasks/${taskId}`,
  );
}

export function updateTask(
  groupId: EntityId,
  taskId: EntityId,
  payload: UpdateTaskRequest,
) {
  return apiPatch<ApiResponse<TaskDetailDto>>(
    `/api/groups/${groupId}/tasks/${taskId}`,
    payload,
  );
}

export function moveTask(
  groupId: EntityId,
  taskId: EntityId,
  payload: MoveTaskRequest,
) {
  return apiPatch<ApiResponse<TaskDetailDto>>(
    `/api/groups/${groupId}/tasks/${taskId}/move`,
    payload,
  );
}

export function replaceTaskAssignees(
  groupId: EntityId,
  taskId: EntityId,
  payload: ReplaceAssigneesRequest,
) {
  return apiPut<ApiResponse<TaskDetailDto>>(
    `/api/groups/${groupId}/tasks/${taskId}/assignees`,
    payload,
  );
}

export function archiveTask(groupId: EntityId, taskId: EntityId) {
  return apiDelete<ApiResponse<TaskDetailDto>>(
    `/api/groups/${groupId}/tasks/${taskId}`,
  );
}

export function restoreTask(groupId: EntityId, taskId: EntityId) {
  return apiPost<ApiResponse<TaskDetailDto>>(
    `/api/groups/${groupId}/tasks/${taskId}/restore`,
  );
}

export function addChecklistItem(
  groupId: EntityId,
  taskId: EntityId,
  payload: AddChecklistItemRequest,
) {
  return apiPost<ApiResponse<ChecklistItemDto>>(
    `/api/groups/${groupId}/tasks/${taskId}/checklist-items`,
    payload,
  );
}

export function updateChecklistItem(
  groupId: EntityId,
  taskId: EntityId,
  itemId: EntityId,
  payload: UpdateChecklistItemRequest,
) {
  return apiPatch<ApiResponse<ChecklistItemDto>>(
    `/api/groups/${groupId}/tasks/${taskId}/checklist-items/${itemId}`,
    payload,
  );
}

export function deleteChecklistItem(
  groupId: EntityId,
  taskId: EntityId,
  itemId: EntityId,
) {
  return apiDelete<EmptyApiResponse>(
    `/api/groups/${groupId}/tasks/${taskId}/checklist-items/${itemId}`,
  );
}

export function addTaskComment(
  groupId: EntityId,
  taskId: EntityId,
  payload: AddCommentRequest,
) {
  return apiPost<ApiResponse<TaskCommentDto>>(
    `/api/groups/${groupId}/tasks/${taskId}/comments`,
    payload,
  );
}

export function getTaskComments(
  groupId: EntityId,
  taskId: EntityId,
  query?: { page?: number; size?: number },
) {
  return apiGet<ApiResponse<PageResponse<TaskCommentDto>>>(
    `/api/groups/${groupId}/tasks/${taskId}/comments`,
    { query },
  );
}

export function updateTaskComment(
  groupId: EntityId,
  taskId: EntityId,
  commentId: EntityId,
  payload: UpdateCommentRequest,
) {
  return apiPatch<ApiResponse<TaskCommentDto>>(
    `/api/groups/${groupId}/tasks/${taskId}/comments/${commentId}`,
    payload,
  );
}

export function deleteTaskComment(
  groupId: EntityId,
  taskId: EntityId,
  commentId: EntityId,
) {
  return apiDelete<EmptyApiResponse>(
    `/api/groups/${groupId}/tasks/${taskId}/comments/${commentId}`,
  );
}

export function getTaskActivities(
  groupId: EntityId,
  taskId: EntityId,
  query?: { page?: number; size?: number },
) {
  return apiGet<ApiResponse<PageResponse<TaskActivityDto>>>(
    `/api/groups/${groupId}/tasks/${taskId}/activities`,
    { query },
  );
}

export function getMyTasks(query?: MyTasksQuery) {
  return apiGet<ApiResponse<PageResponse<TaskSummaryDto>>>(
    "/api/tasks/me",
    { query },
  );
}

export function getGroupDetails(groupId: EntityId) {
  return apiGet<ApiResponse<GroupDetailDto>>(`/api/groups/${groupId}`);
}

export function getMyGroups() {
  return apiGet<ApiResponse<GroupSummaryDto[]>>("/api/groups/student/me");
}


