import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import {
  approveJoinRequest,
  cancelJoinRequest,
  createJoinRequest,
  getGroupJoinRequests,
  getMyJoinRequests,
  rejectJoinRequest,
} from "../api";
import type { CreateJoinRequestDto } from "../types";

export function useGroupJoinRequests(groupId: number | null | undefined) {
  return useQuery({
    enabled: typeof groupId === "number",
    queryFn: () => {
      if (typeof groupId !== "number") {
        throw new Error("A group id is required.");
      }

      return getGroupJoinRequests(groupId);
    },
    queryKey:
      typeof groupId === "number"
        ? queryKeys.groups.joinRequests(groupId)
        : [...queryKeys.groups.all, "join-requests", "empty"],
  });
}

export function useMyJoinRequests() {
  return useQuery({
    queryFn: getMyJoinRequests,
    queryKey: queryKeys.groups.myJoinRequests(),
  });
}

export function useCreateJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: number;
      payload: CreateJoinRequestDto;
    }) => createJoinRequest(groupId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.joinRequests(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.myJoinRequests(),
      });
    },
  });
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      requestId,
    }: {
      groupId: number;
      requestId: number;
    }) => approveJoinRequest(groupId, requestId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.joinRequests(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.myJoinRequests(),
      });
    },
  });
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      requestId,
    }: {
      groupId: number;
      requestId: number;
    }) => rejectJoinRequest(groupId, requestId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.joinRequests(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.myJoinRequests(),
      });
    },
  });
}

export function useCancelJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      requestId,
    }: {
      groupId: number;
      requestId: number;
    }) => cancelJoinRequest(groupId, requestId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.joinRequests(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.myJoinRequests(),
      });
    },
  });
}
