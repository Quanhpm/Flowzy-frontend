"use client";

import {
  isAuthSessionValid,
  useAuthHydrated,
  useAuthStore,
} from "@/modules/auth";
import { LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { COLORS } from "@/shared/constants/colors";

export default function DashboardPage() {
  const router = useRouter();
  const isHydrated = useAuthHydrated();
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);
  const hasValidSession = isAuthSessionValid(session);

  useEffect(() => {
    if (!isHydrated || hasValidSession) return;

    clearSession();
    router.replace("/login");
  }, [clearSession, hasValidSession, isHydrated, router]);

  if (!isHydrated || !hasValidSession) {
    return (
      <main
        style={{
          display: "grid",
          minHeight: "100svh",
          placeItems: "center",
          color: COLORS.muted,
          background: COLORS.background,
          fontFamily: "var(--font-roboto), sans-serif",
        }}
      >
        Restoring your session...
      </main>
    );
  }

  return (
    <main
      style={{
        display: "grid",
        minHeight: "100svh",
        placeItems: "center",
        padding: 24,
        background: COLORS.background,
        fontFamily: "var(--font-roboto), sans-serif",
      }}
    >
      <section
        style={{
          width: "min(560px, 100%)",
          padding: 40,
          border: `1px solid ${COLORS.borderWarm}`,
          borderRadius: 16,
          background: COLORS.surface,
          boxShadow: "0 20px 45px rgba(26, 26, 26, 0.04)",
          textAlign: "center",
        }}
      >
        <Sparkles size={42} color={COLORS.brandPrimary} />
        <h1 style={{ margin: "20px 0 10px", fontSize: 28, fontWeight: 700, color: COLORS.foreground }}>
          Sign in successful
        </h1>
        <p style={{ margin: 0, color: COLORS.muted, lineHeight: 1.7, fontSize: 15, fontWeight: 400 }}>
          {session
            ? `${session.user.email} · ${session.user.role}`
            : "Restoring your session."}
        </p>
        <button
          type="button"
          onClick={() => {
            window.google?.accounts.id.disableAutoSelect();
            clearSession();
            router.replace("/login");
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 26,
            padding: "12px 20px",
            border: 0,
            borderRadius: 12,
            color: "#fff",
            background: COLORS.brandPrimary,
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
            transition: "background 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.brandPrimaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = COLORS.brandPrimary;
          }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </section>
    </main>
  );
}
