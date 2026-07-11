import { apiGet, apiPatch, apiPost } from "@/shared/lib";
import type { ApiResponse, EntityId } from "@/shared/types";

import type {
  CreateTaskBoardRequest,
  TaskBoardDto,
  UpdateTaskBoardRequest,
  BoardFilters,
  GroupTaskBoardDto,
} from "../types";

export function getTaskBoards(groupId: EntityId) {
  return apiGet<ApiResponse<TaskBoardDto[]>>(`/api/groups/${groupId}/boards`);
}

export function createTaskBoard(
  groupId: EntityId,
  payload: CreateTaskBoardRequest,
) {
  return apiPost<ApiResponse<TaskBoardDto>>(
    `/api/groups/${groupId}/boards`,
    payload,
  );
}

export function updateTaskBoard(
  groupId: EntityId,
  boardId: EntityId,
  payload: UpdateTaskBoardRequest,
) {
  return apiPatch<ApiResponse<TaskBoardDto>>(
    `/api/groups/${groupId}/boards/${boardId}`,
    payload,
  );
}

export function getTaskBoardDetail(
  groupId: EntityId,
  boardId: EntityId,
  filters?: BoardFilters,
) {
  return apiGet<ApiResponse<GroupTaskBoardDto>>(
    `/api/groups/${groupId}/boards/${boardId}`,
    { query: filters },
  );
}
