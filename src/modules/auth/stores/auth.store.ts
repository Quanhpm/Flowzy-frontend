import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthSession } from "../types/auth.types";

type AuthState = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,
      setSession: (session) => set({ session, isAuthenticated: true }),
      clearSession: () => set({ session: null, isAuthenticated: false }),
    }),
    {
      name: "fspark-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
