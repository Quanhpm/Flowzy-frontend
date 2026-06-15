"use client";

import { useSyncExternalStore } from "react";

import { useAuthStore } from "../stores/auth.store";

function subscribeToHydration(onStoreChange: () => void) {
  return useAuthStore.persist.onFinishHydration(onStoreChange);
}

export function useAuthHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
