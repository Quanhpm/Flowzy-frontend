import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";
import type { EntityId } from "@/shared/types";

import {
  createTaskBoard,
  getTaskBoards,
  updateTaskBoard,
} from "../api";
import type {
  CreateTaskBoardRequest,
  UpdateTaskBoardRequest,
} from "../types";

export function useTaskBoards(groupId: EntityId | null | undefined) {
  return useQuery({
    enabled: typeof groupId === "number",
    queryFn: () => {
      if (typeof groupId !== "number") {
        throw new Error("A group id is required.");
      }

      return getTaskBoards(groupId);
    },
    queryKey:
      typeof groupId === "number"
        ? queryKeys.tasks.boards(groupId)
        : [...queryKeys.tasks.all, "boards", "empty"],
  });
}

export function useCreateTaskBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: EntityId;
      payload: CreateTaskBoardRequest;
    }) => createTaskBoard(groupId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.boards(variables.groupId),
      });
    },
  });
}

export function useUpdateTaskBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      groupId,
      payload,
    }: {
      boardId: EntityId;
      groupId: EntityId;
      payload: UpdateTaskBoardRequest;
    }) => updateTaskBoard(groupId, boardId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.boards(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.boardDetail(variables.groupId, variables.boardId),
      });
    },
  });
}
