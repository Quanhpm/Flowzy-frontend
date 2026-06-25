import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/lib";

import {
  cancelAvailabilitySlot,
  createAvailabilitySlot,
  updateAvailabilitySlot,
} from "../api";
import type {
  CreateAvailabilitySlotRequest,
  UpdateAvailabilitySlotRequest,
} from "../types";

export function useCreateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAvailabilitySlotRequest) =>
      createAvailabilitySlot(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentoring.availability(),
      }),
  });
}

export function useUpdateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      slotId,
    }: {
      slotId: number;
      payload: UpdateAvailabilitySlotRequest;
    }) => updateAvailabilitySlot(slotId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentoring.availability(),
      }),
  });
}

export function useCancelSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId: number) => cancelAvailabilitySlot(slotId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentoring.availability(),
      }),
  });
}
