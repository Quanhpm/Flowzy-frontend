import { apiGet, apiPatch, apiPost } from "@/shared/lib";
import type { ApiResponse, EntityId } from "@/shared/types";

import type {
  CreateTaskBoardRequest,
  TaskBoardDto,
  UpdateTaskBoardRequest,
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
