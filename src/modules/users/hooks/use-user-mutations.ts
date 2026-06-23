import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import {
  changePasswordByEmail,
  createAdminUser,
  deleteAdminUser,
  resetUserPassword,
  updateAdminUser,
} from "../api";
import type {
  ChangePasswordByEmailRequest,
  CreateAdminUserRequest,
  ResetUserPasswordRequest,
  UpdateAdminUserRequest,
} from "../types";

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminUserRequest) => createAdminUser(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      userId,
    }: {
      userId: number;
      payload: UpdateAdminUserRequest;
    }) => updateAdminUser(userId, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => deleteAdminUser(userId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({
      payload,
      userId,
    }: {
      userId: number;
      payload: ResetUserPasswordRequest;
    }) => resetUserPassword(userId, payload),
  });
}

export function useChangePasswordByEmail() {
  return useMutation({
    mutationFn: (payload: ChangePasswordByEmailRequest) =>
      changePasswordByEmail(payload),
  });
}
