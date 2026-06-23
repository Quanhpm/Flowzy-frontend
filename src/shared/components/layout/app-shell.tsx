"use client";

import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  Database,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";

import {
  isAuthSessionValid,
  useAuthHydrated,
  useAuthStore,
  useLogout,
} from "@/modules/auth";
import { cn } from "@/shared/lib";
import type { UserRole } from "@/shared/types";

import { Button, EmptyState, LoadingState } from "../ui";
import styles from "./app-shell.module.css";

type AppShellProps = {
  children: ReactNode;
  role: UserRole;
};

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin Workspace",
  STUDENT: "Student Workspace",
  MENTOR: "Mentor Workspace",
};

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/imports", icon: Database, label: "Imports" },
    { href: "/admin/problems", icon: BookOpen, label: "Problem Bank" },
  ],
  STUDENT: [
    { href: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/student/groups", icon: Users, label: "Groups" },
    { href: "/student/tasks", icon: ClipboardList, label: "Tasks" },
    { href: "/student/problems", icon: BookOpen, label: "Problems" },
  ],
  MENTOR: [
    { href: "/mentor/groups", icon: Users, label: "Groups" },
    {
      href: "/mentor/availability",
      icon: CalendarClock,
      label: "Availability",
    },
  ],
};

function getActiveItem(pathname: string, items: NavItem[]) {
  return (
    items.find((item) => pathname === item.href) ??
    items.find((item) => pathname.startsWith(`${item.href}/`)) ??
    items[0]
  );
}

export function AppShell({ children, role }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHydrated = useAuthHydrated();
  const logoutMutation = useLogout();
  const session = useAuthStore((state) => state.session);
  const hasValidSession = isAuthSessionValid(session);
  const navItems = NAV_ITEMS[role];
  const activeItem = useMemo(
    () => getActiveItem(pathname, navItems),
    [navItems, pathname],
  );

  async function handleSignOut() {
    await logoutMutation.mutateAsync().catch(() => undefined);
    router.replace("/login");
  }

  useEffect(() => {
    if (!isHydrated || hasValidSession) return;
    router.replace("/login");
  }, [hasValidSession, isHydrated, router]);

  if (!isHydrated || !session || !hasValidSession) {
    return (
      <main className={styles.guard}>
        <div className={styles.guardPanel}>
          <LoadingState
            description="Checking your sign-in session before opening the workspace."
            title="Restoring session"
          />
        </div>
      </main>
    );
  }

  if (session.user.role !== role) {
    return (
      <main className={styles.guard}>
        <div className={styles.guardPanel}>
          <EmptyState
            actions={
              <Button
                icon={<LogOut size={16} />}
                onClick={handleSignOut}
                variant="secondary"
              >
                Sign out
              </Button>
            }
            description="This workspace is not available for your current account role."
            title="Workspace unavailable"
          />
        </div>
      </main>
    );
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href={navItems[0].href}>
          <span className={styles.brandMark}>
            <Sparkles size={18} />
          </span>
          F-Spark
        </Link>

        <nav className={styles.nav} aria-label="Workspace navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                className={cn(
                  styles.navItem,
                  isActive && styles.navItemActive,
                )}
                href={item.href}
                key={item.href}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.profile}>
            <span className={styles.profileEmail}>{session.user.email}</span>
            <span className={styles.profileRole}>{session.user.role}</span>
          </div>
          <Button
            disabled={logoutMutation.isPending}
            icon={<LogOut size={16} />}
            isFullWidth
            onClick={handleSignOut}
            variant="secondary"
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            <span className={styles.sectionLabel}>{ROLE_LABELS[role]}</span>
            <span className={styles.currentPage}>{activeItem.label}</span>
          </div>
          <div className={styles.topbarActions}>
            <Button
              disabled={logoutMutation.isPending}
              icon={<LogOut size={16} />}
              onClick={handleSignOut}
              size="sm"
              variant="ghost"
            >
              Sign out
            </Button>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
