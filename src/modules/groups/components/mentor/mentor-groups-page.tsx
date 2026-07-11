"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  Eye,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  MentorDashboardSection,
  useMentorDashboardGroups,
} from "@/modules/dashboards";
import type { DashboardGroupProgressDto } from "@/modules/dashboards";
import { useCancelMeeting, useGroupMeetings } from "@/modules/mentoring";
import type { MentorMeetingDto } from "@/modules/mentoring";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import { ApiError } from "@/shared/lib";
import type { GroupStatus } from "@/shared/types";

import { useGroup, useMentorGroups } from "../../hooks";
import type { GroupDetailDto, GroupSummaryDto } from "../../types";
import { ConfirmDialog } from "../student/confirm-dialog";

const pageClassName = "grid min-w-0 gap-6";
const gridClassName =
  "grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-4";
const errorPanelClassName =
  "rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-normal text-red-700";
const detailGridClassName =
  "grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3";
const labelClassName = "text-xs font-bold tracking-[0.04em] text-muted uppercase";
const valueClassName = "mt-1 text-sm leading-[1.5] text-foreground";

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

function formatNullable(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getGroupStatusTone(status: GroupStatus) {
  return status === "ACTIVE" ? "success" : "neutral";
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface px-4 py-3">
      <div className={labelClassName}>{label}</div>
      <div className={valueClassName}>{formatNullable(value)}</div>
    </div>
  );
}

function ProgressSummary({
  progress,
}: {
  progress?: DashboardGroupProgressDto;
}) {
  if (!progress) return null;

  return (
    <div className="grid gap-2 rounded-xl border border-border bg-background px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">
          Tasks: {progress.completedTasks}/{progress.totalTasks} done
        </span>
        <strong className="text-foreground">
          {clampPercent(progress.progressPercent)}%
        </strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-200"
          style={{ width: `${clampPercent(progress.progressPercent)}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted">
        <span>{progress.inProgressTasks} in progress</span>
        <span>{progress.overdueTasks} overdue</span>
      </div>
    </div>
  );
}

function MentorGroupDetail({ group }: { group: GroupDetailDto }) {
  const meetingsQuery = useGroupMeetings(group.id);
  const cancelMeetingMutation = useCancelMeeting();
  const meetings = meetingsQuery.data?.data ?? [];
  const [meetingToCancel, setMeetingToCancel] =
    useState<MentorMeetingDto | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div className="grid gap-5">
      <div className={detailGridClassName}>
        <InfoItem label="Project" value={group.projectName} />
        <InfoItem label="Domain" value={group.researchDomain} />
        <InfoItem label="Required GPA" value={group.requiredGpa} />
        <InfoItem label="Target grade" value={group.targetGrade} />
      </div>

      {group.ideaDescription && (
        <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm leading-[1.55] text-foreground">
          {group.ideaDescription}
        </div>
      )}

      <div className="grid gap-3">
        <h3 className="m-0 text-sm font-bold text-foreground">Members</h3>
        {group.members.map((member) => (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
            key={member.studentId}
          >
            <div className="min-w-0">
              <div className="font-bold text-foreground">{member.fullName}</div>
              <p className="mt-1 mb-0 text-[13px] text-muted">
                {member.studentCode} - {member.email}
              </p>
            </div>
            <Badge tone={member.role === "LEADER" ? "brand" : "neutral"}>
              {member.role}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <h3 className="m-0 text-sm font-bold text-foreground">
          Upcoming meetings
        </h3>
        {successMessage && (
          <p className="m-0 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            {successMessage}
          </p>
        )}
        {meetingsQuery.isLoading ? (
          <LoadingState title="Loading meetings" />
        ) : meetingsQuery.isError ? (
          <div className={errorPanelClassName}>
            {getErrorMessage(meetingsQuery.error)}
          </div>
        ) : meetings.length === 0 ? (
          <EmptyState
            description="No meetings are scheduled for this group."
            title="No meetings"
          />
        ) : (
          <div className="grid gap-3">
            {meetings.map((meeting) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
                key={meeting.id}
              >
                <div className="min-w-0">
                  <div className="font-bold text-foreground">
                    {formatDateTime(meeting.startAt)}
                  </div>
                  <p className="mt-1 mb-0 text-[13px] text-muted">
                    Booked by {meeting.bookedByStudentName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge
                    tone={
                      meeting.status === "SCHEDULED" ? "success" : "danger"
                    }
                  >
                    {meeting.status}
                  </Badge>
                  <Button
                    icon={<CalendarClock size={15} />}
                    onClick={() => window.open(meeting.meetLink, "_blank")}
                    size="sm"
                    variant="secondary"
                  >
                    Meet
                  </Button>
                  {meeting.status === "SCHEDULED" && (
                    <Button
                      disabled={cancelMeetingMutation.isPending}
                      icon={<XCircle size={15} />}
                      onClick={() => {
                        setSuccessMessage("");
                        setMeetingToCancel(meeting);
                      }}
                      size="sm"
                      variant="danger"
                    >
                      Cancel meeting
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {meetingToCancel && (
        <ConfirmDialog
          confirmLabel="Cancel meeting"
          description={`Cancel the meeting scheduled for ${formatDateTime(
            meetingToCancel.startAt,
          )}?`}
          onClose={() => setMeetingToCancel(null)}
          onConfirm={async () => {
            await cancelMeetingMutation.mutateAsync({
              groupId: group.id,
              meetingId: meetingToCancel.id,
            });
            setSuccessMessage("Meeting canceled successfully.");
          }}
          title="Cancel mentor meeting"
          tone="danger"
        />
      )}
    </div>
  );
}

function MentorGroupDetailModal({
  groupId,
  onClose,
}: {
  groupId: number;
  onClose: () => void;
}) {
  const groupDetailQuery = useGroup(groupId);
  const group = groupDetailQuery.data?.data;
  const dialogTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const activeElement = document.activeElement as HTMLElement | null;

    dialogTitleRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      activeElement?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-describedby="mentor-group-detail-description"
        aria-labelledby="mentor-group-detail-title"
        aria-modal="true"
        className="grid max-h-[calc(100svh-2rem)] w-[min(920px,100%)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="grid min-w-0 gap-1">
            <h2
              className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-lg font-bold text-foreground"
              id="mentor-group-detail-title"
              ref={dialogTitleRef}
              tabIndex={-1}
            >
              {group?.name ?? "Group details"}
            </h2>
            <p
              className="m-0 text-sm leading-relaxed text-muted"
              id="mentor-group-detail-description"
            >
              {group
                ? `${group.groupNo} · ${group.term} · ${group.courseCode}`
                : "Review group members, project context, and meetings."}
            </p>
          </div>
          <Button
            aria-label="Close group details"
            icon={<X size={17} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        <div className="min-h-0 overflow-y-auto px-6 py-5 max-[640px]:px-4">
          {groupDetailQuery.isLoading ? (
            <LoadingState title="Loading group detail" />
          ) : groupDetailQuery.isError ? (
            <div className={errorPanelClassName}>
              {getErrorMessage(groupDetailQuery.error)}
            </div>
          ) : group ? (
            <MentorGroupDetail group={group} />
          ) : (
            <EmptyState
              description="The selected group could not be loaded."
              title="Group detail unavailable"
            />
          )}
        </div>
      </section>
    </div>
  );
}

function MentorGroupCard({
  group,
  onViewDetails,
  progress,
}: {
  group: GroupSummaryDto;
  onViewDetails: (trigger: HTMLButtonElement) => void;
  progress?: DashboardGroupProgressDto;
}) {
  return (
    <Card className="flex h-full flex-col transition-all duration-200 ease-in-out hover:shadow-card-interactive">
      <CardContent className="flex h-full flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="m-0 text-[17px] leading-tight font-bold text-foreground">
              {group.name}
            </h2>
            <p className="mt-1 mb-0 text-sm text-muted">
              {group.groupNo} - {group.term} - {group.courseCode}
            </p>
          </div>
          <Badge tone={getGroupStatusTone(group.status)}>{group.status}</Badge>
        </div>

        <div className={detailGridClassName}>
          <InfoItem label="Leader" value={group.leaderName} />
          <InfoItem label="Members" value={group.memberCount} />
          <InfoItem label="Project" value={group.projectName} />
        </div>

        <ProgressSummary progress={progress} />

        {group.selectedProblem && (
          <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm leading-[1.55] text-muted">
            <span className="font-medium text-foreground">
              {group.selectedProblem.code}
            </span>{" "}
            {group.selectedProblem.title}
          </div>
        )}

        <div className="mt-auto flex justify-end pt-2">
          <Button
            icon={<Eye size={16} />}
            onClick={(event) => onViewDetails(event.currentTarget)}
            size="sm"
            variant="secondary"
          >
            View details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function MentorGroupsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mentorGroupsQuery = useMentorGroups();
  const dashboardGroupsQuery = useMentorDashboardGroups();
  const groups = mentorGroupsQuery.data?.data ?? [];
  const progressByGroupId = useMemo(() => {
    const dashboardGroups = dashboardGroupsQuery.data?.data ?? [];
    return new Map(dashboardGroups.map((group) => [group.groupId, group]));
  }, [dashboardGroupsQuery.data?.data]);
  const closeGroupDetail = useCallback(() => {
    setSelectedGroupId(null);
    detailTriggerRef.current?.focus();
  }, []);

  return (
    <div className={pageClassName}>
      <PageHeader
        description="Review assigned groups, members, selected problems, task progress, and scheduled meetings."
        eyebrow="Mentor"
        title="My Groups"
      />

      <MentorDashboardSection />

      {mentorGroupsQuery.isLoading ? (
        <Card isPadded>
          <LoadingState title="Loading assigned groups" />
        </Card>
      ) : mentorGroupsQuery.isError ? (
        <Card isPadded>
          <div className={errorPanelClassName}>
            {getErrorMessage(mentorGroupsQuery.error)}
          </div>
        </Card>
      ) : groups.length === 0 ? (
        <Card isPadded>
          <EmptyState
            description="Assigned groups will appear here once the admin connects you with teams."
            icon={<Users size={22} />}
            title="No assigned groups"
          />
        </Card>
      ) : (
        <div className={gridClassName}>
          {groups.map((group) => (
            <MentorGroupCard
              group={group}
              key={group.id}
              onViewDetails={(trigger) => {
                detailTriggerRef.current = trigger;
                setSelectedGroupId(group.id);
              }}
              progress={progressByGroupId.get(group.id)}
            />
          ))}
        </div>
      )}

      {selectedGroupId && (
        <MentorGroupDetailModal
          groupId={selectedGroupId}
          onClose={closeGroupDetail}
        />
      )}
    </div>
  );
}
