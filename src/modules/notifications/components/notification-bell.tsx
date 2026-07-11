"use client";

import { useId, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Button,
  EmptyState,
  LoadingState,
} from "@/shared/components";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks";
import type { NotificationDto } from "../types";
import {
  getNotificationErrorMessage,
  isSafeNotificationActionUrl,
} from "./notification-utils";
import { NotificationListItem } from "./notification-list-item";

const recentNotificationsQuery = {
  page: 0,
  size: 5,
  unreadOnly: true,
} as const;

function formatUnreadCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function NotificationBell() {
  const router = useRouter();
  const popoverId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [actionError, setActionError] = useState("");
  const unreadCountQuery = useUnreadNotificationCount();
  const notificationsQuery = useNotifications(recentNotificationsQuery);
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const notifications = notificationsQuery.data?.data.content ?? [];
  const unreadCount = unreadCountQuery.data?.data ?? 0;
  const isMutating = markReadMutation.isPending || markAllMutation.isPending;

  async function activateNotification(notification: NotificationDto) {
    setActionError("");
    setFeedback("");

    try {
      if (!notification.read) {
        await markReadMutation.mutateAsync(notification.id);
        setFeedback("Notification marked as read.");
      }

      if (isSafeNotificationActionUrl(notification.actionUrl)) {
        setIsOpen(false);
        router.push(notification.actionUrl);
      }
    } catch (error) {
      setActionError(getNotificationErrorMessage(error));
    }
  }

  async function markAllRead() {
    setActionError("");
    setFeedback("");

    try {
      await markAllMutation.mutateAsync();
      setFeedback("All notifications marked as read.");
    } catch (error) {
      setActionError(getNotificationErrorMessage(error));
    }
  }

  return (
    <div className="relative">
      <Button
        aria-controls={isOpen ? popoverId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Notifications"
        className="size-12 px-0"
        icon={<Bell size={26} />}
        onClick={() => setIsOpen((current) => !current)}
        variant="ghost"
      >
        <span className="sr-only">Notifications</span>
      </Button>

      {unreadCount > 0 && (
        <span
          aria-label={`${unreadCount} unread notifications`}
          className="pointer-events-none absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-brand-primary px-1 text-[11px] font-bold leading-5 text-white"
        >
          {formatUnreadCount(unreadCount)}
        </span>
      )}

      {isOpen && (
        <section
          aria-label="Recent unread notifications"
          className="absolute top-12 right-0 z-50 grid w-[min(420px,calc(100vw-2rem))] gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card"
          id={popoverId}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
          role="dialog"
        >
          <header className="flex items-start justify-between gap-3">
            <div className="grid gap-1">
              <h2 className="m-0 text-base font-bold text-foreground">
                Notifications
              </h2>
              <p className="m-0 text-sm text-muted">
                Your latest unread updates.
              </p>
            </div>
            <Button
              aria-label="Close notifications"
              icon={<X size={16} />}
              onClick={() => setIsOpen(false)}
              size="sm"
              variant="ghost"
            />
          </header>

          {actionError && (
            <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </p>
          )}
          {feedback && (
            <p className="m-0 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
              {feedback}
            </p>
          )}

          {notificationsQuery.isLoading ? (
            <LoadingState className="min-h-44" title="Loading notifications" />
          ) : notificationsQuery.isError ? (
            <EmptyState
              className="min-h-44 border-red-200 bg-red-50"
              description={getNotificationErrorMessage(notificationsQuery.error)}
              title="Unable to load notifications"
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              className="min-h-44"
              description="New updates will appear here."
              title="All caught up"
            />
          ) : (
            <div className="grid max-h-96 gap-3 overflow-y-auto pr-1">
              {notifications.map((notification) => (
                <NotificationListItem
                  disabled={isMutating}
                  key={notification.id}
                  notification={notification}
                  onActivate={activateNotification}
                />
              ))}
            </div>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            {unreadCountQuery.isError ? (
              <span className="text-xs text-red-700" role="status">
                {getNotificationErrorMessage(unreadCountQuery.error)}
              </span>
            ) : (
              <span className="text-xs text-muted">{unreadCount} unread</span>
            )}
            <Button
              disabled={isMutating || unreadCount === 0}
              icon={<CheckCheck size={16} />}
              onClick={markAllRead}
              size="sm"
              variant="secondary"
            >
              {markAllMutation.isPending ? "Marking..." : "Mark all read"}
            </Button>
          </footer>
        </section>
      )}
    </div>
  );
}
