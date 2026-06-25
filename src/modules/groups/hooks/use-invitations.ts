import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import {
  acceptInvitation,
  cancelInvitation,
  declineInvitation,
  getGroupInvitations,
  getMyInvitations,
  inviteStudent,
} from "../api";
import type { InviteStudentRequest } from "../types";

export function useGroupInvitations(groupId: number | null | undefined) {
  return useQuery({
    enabled: typeof groupId === "number",
    queryFn: () => {
      if (typeof groupId !== "number") {
        throw new Error("A group id is required.");
      }

      return getGroupInvitations(groupId);
    },
    queryKey:
      typeof groupId === "number"
        ? queryKeys.groups.invitations(groupId)
        : [...queryKeys.groups.all, "invitations", "empty"],
  });
}

export function useMyInvitations() {
  return useQuery({
    queryFn: getMyInvitations,
    queryKey: queryKeys.groups.myInvitations(),
  });
}

export function useInviteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      payload,
    }: {
      groupId: number;
      payload: InviteStudentRequest;
    }) => inviteStudent(groupId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.invitations(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.myInvitations(),
      });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.myInvitations(),
      });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => declineInvitation(invitationId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.myInvitations(),
      }),
  });
}

export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => cancelInvitation(invitationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),
  });
}
