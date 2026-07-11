import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";
import {
  addChecklistItem,
  addTaskComment,
  createTask,
  deleteChecklistItem,
  deleteTaskComment,
  moveTask,
  replaceTaskAssignees,
  updateChecklistItem,
  updateTaskComment,
  updateTask,
  archiveTask,
  restoreTask,
  reorderTask,
} from "../api";
import type {
  AddChecklistItemRequest,
  AddCommentRequest,
  CreateTaskRequest,
  MoveTaskRequest,
  ReplaceAssigneesRequest,
  UpdateChecklistItemRequest,
  UpdateCommentRequest,
  UpdateTaskRequest,
  ReorderTaskRequest,
} from "../types";
import type { EntityId } from "@/shared/types";

export function useCreateTask(groupId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskRequest) => createTask(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "board"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      });
    },
  });
}

export function useUpdateTask(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTaskRequest) => updateTask(groupId, taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(groupId, taskId),
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "board"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      });
    },
  });
}

export function useMoveTask(groupId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: EntityId;
      payload: MoveTaskRequest;
    }) => moveTask(groupId, taskId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(groupId, variables.taskId),
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "board"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      });
    },
  });
}

export function useReorderTask(groupId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderTaskRequest) => reorderTask(groupId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(groupId, variables.taskId),
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "board"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      });
    },
  });
}

export function useReplaceTaskAssignees(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReplaceAssigneesRequest) =>
      replaceTaskAssignees(groupId, taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(groupId, taskId),
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "board"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      });
    },
  });
}

export function useArchiveTask(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => archiveTask(groupId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(groupId, taskId),
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "board"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      });
    },
  });
}

export function useRestoreTask(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => restoreTask(groupId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(groupId, taskId),
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", groupId, "board"],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      });
    },
  });
}

export function useAddChecklistItem(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddChecklistItemRequest) =>
      addChecklistItem(groupId, taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(groupId, taskId),
      });
    },
  });
}

export function useUpdateChecklistItem(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: EntityId;
      payload: UpdateChecklistItemRequest;
    }) => updateChecklistItem(groupId, taskId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(groupId, taskId),
      });
    },
  });
}

export function useDeleteChecklistItem(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: EntityId) => deleteChecklistItem(groupId, taskId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(groupId, taskId),
      });
    },
  });
}

export function useAddTaskComment(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCommentRequest) => addTaskComment(groupId, taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.tasks.detail(groupId, taskId), "comments"],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.tasks.detail(groupId, taskId), "activities"],
      });
    },
  });
}

export function useUpdateTaskComment(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: EntityId;
      payload: UpdateCommentRequest;
    }) => updateTaskComment(groupId, taskId, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.tasks.detail(groupId, taskId), "comments"],
      });
    },
  });
}

export function useDeleteTaskComment(groupId: EntityId, taskId: EntityId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: EntityId) => deleteTaskComment(groupId, taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.tasks.detail(groupId, taskId), "comments"],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.tasks.detail(groupId, taskId), "activities"],
      });
    },
  });
}
