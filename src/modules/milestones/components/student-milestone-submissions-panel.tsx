"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  ExternalLink,
  Send,
  Upload,
  X,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LoadingState,
  Select,
  TextInput,
} from "@/shared/components";
import { ApiError } from "@/shared/lib";
import type {
  CourseMilestoneStatus,
  EntityId,
  MilestoneSubmissionStatus,
} from "@/shared/types";

import {
  useAverageGrade,
  useGroupMilestoneSubmissions,
  useGroupMilestones,
  useSubmitMilestone,
  useUpdateMilestoneSubmission,
} from "../hooks";
import type { CourseMilestoneDto, MilestoneSubmissionDto } from "../types";

export type StudentMilestoneGroupOption = {
  courseCode: string;
  groupNo: string;
  id: EntityId;
  name: string;
  projectName: string | null;
  status: string;
  term: string;
};

type StudentMilestoneSubmissionsPanelProps = {
  groups: StudentMilestoneGroupOption[];
  initialGroupId?: EntityId | null;
};

type SubmissionModalProps = {
  existingSubmission?: MilestoneSubmissionDto;
  groupId: EntityId;
  milestone: CourseMilestoneDto;
  onClose: () => void;
};

function getErrorMessage(error: unknown) {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatScore(value: number | null | undefined, maxScore?: number | null) {
  if (typeof value !== "number") return "Not graded";
  if (typeof maxScore === "number") return `${value} / ${maxScore}`;
  return String(value);
}

function getMilestoneStatusTone(status: CourseMilestoneStatus) {
  if (status === "ACTIVE") return "success";
  if (status === "CLOSED") return "warning";
  if (status === "ARCHIVED") return "danger";
  return "neutral";
}

function getSubmissionStatusTone(status: MilestoneSubmissionStatus) {
  if (status === "GRADED") return "success";
  if (status === "RESUBMITTED") return "warning";
  return "brand";
}

function getAverageValue(value: { averageGrade: number | null; average: number | null } | undefined) {
  if (!value) return null;
  return value.averageGrade ?? value.average ?? null;
}

function getLatestSubmissionByMilestone(
  submissions: MilestoneSubmissionDto[],
) {
  const latestByMilestone = new Map<EntityId, MilestoneSubmissionDto>();

  submissions.forEach((submission) => {
    const current = latestByMilestone.get(submission.milestoneId);
    if (!current) {
      latestByMilestone.set(submission.milestoneId, submission);
      return;
    }

    const currentTime = current.submittedAt
      ? new Date(current.submittedAt).getTime()
      : 0;
    const nextTime = submission.submittedAt
      ? new Date(submission.submittedAt).getTime()
      : 0;

    if (nextTime >= currentTime) {
      latestByMilestone.set(submission.milestoneId, submission);
    }
  });

  return latestByMilestone;
}

function SubmissionModal({
  existingSubmission,
  groupId,
  milestone,
  onClose,
}: SubmissionModalProps) {
  const submitMutation = useSubmitMilestone();
  const updateMutation = useUpdateMilestoneSubmission();
  const [fileUrl, setFileUrl] = useState(existingSubmission?.fileUrl ?? "");
  const [comments, setComments] = useState(existingSubmission?.comments ?? "");
  const [error, setError] = useState("");

  const isPending = submitMutation.isPending || updateMutation.isPending;
  const mutationError = submitMutation.error ?? updateMutation.error;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fileUrl.trim()) {
      setError("Deliverable URL is required.");
      return;
    }

    if (fileUrl.trim().length > 1000) {
      setError("Deliverable URL cannot exceed 1,000 characters.");
      return;
    }

    if (existingSubmission) {
      updateMutation.mutate(
        {
          payload: {
            comments: optional(comments),
            fileUrl: fileUrl.trim(),
            version: existingSubmission.version ?? undefined,
          },
          submissionId: existingSubmission.id,
        },
        { onSuccess: onClose },
      );
      return;
    }

    submitMutation.mutate(
      {
        payload: {
          comments: optional(comments),
          fileUrl: fileUrl.trim(),
          groupId,
          milestoneId: milestone.id,
        },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6">
      <div className="grid max-h-[92vh] w-[min(620px,100%)] grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="grid gap-1">
            <h2 className="m-0 text-lg font-bold text-foreground">
              {existingSubmission ? "Resubmit deliverable" : "Submit deliverable"}
            </h2>
            <p className="m-0 text-sm text-muted">{milestone.title}</p>
          </div>
          <Button
            aria-label="Close submission form"
            className="size-8 rounded-lg p-0"
            onClick={onClose}
            variant="secondary"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form className="grid gap-5 overflow-y-auto p-6" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background p-4 text-sm text-muted">
            <Badge tone={getMilestoneStatusTone(milestone.status)}>
              {milestone.status}
            </Badge>
            <span>Deadline {formatDateTime(milestone.deadlineAt)}</span>
            <span>Weight {milestone.weight ?? "N/A"}%</span>
            <span>Max {milestone.maxScore ?? "N/A"}</span>
          </div>

          <TextInput
            icon={<Upload size={16} />}
            label="Deliverable URL"
            onChange={(event) => setFileUrl(event.target.value)}
            placeholder="https://drive.google.com/..."
            required
            value={fileUrl}
          />

          <label className="grid gap-[7px]">
            <span className="text-[13px] font-medium text-foreground">
              Comments
            </span>
            <textarea
              className="min-h-28 rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-foreground outline-0 transition-[border-color,box-shadow] focus:border-brand-secondary focus:shadow-[0_0_0_4px_rgba(237,161,47,0.12)]"
              onChange={(event) => setComments(event.target.value)}
              placeholder="Notes for the instructor"
              value={comments}
            />
          </label>

          {(error || mutationError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error || getErrorMessage(mutationError)}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-5">
            <Button onClick={onClose} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={isPending} icon={<Send size={16} />} type="submit">
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StudentMilestoneSubmissionsPanel({
  groups,
  initialGroupId,
}: StudentMilestoneSubmissionsPanelProps) {
  const [selectedGroupId, setSelectedGroupId] = useState(
    initialGroupId ? String(initialGroupId) : "",
  );
  const [activeMilestone, setActiveMilestone] =
    useState<CourseMilestoneDto | null>(null);

  const effectiveGroupId =
    selectedGroupId || !groups[0] ? Number(selectedGroupId) || null : groups[0].id;
  const activeGroup =
    groups.find((group) => Number(group.id) === Number(effectiveGroupId)) ??
    null;

  const milestonesQuery = useGroupMilestones(effectiveGroupId);
  const submissionsQuery = useGroupMilestoneSubmissions(effectiveGroupId);
  const averageGradeQuery = useAverageGrade(effectiveGroupId);
  const milestones = useMemo(
    () =>
      [...(milestonesQuery.data?.data ?? [])].sort((left, right) => {
        const byPosition = (left.position ?? 0) - (right.position ?? 0);
        if (byPosition !== 0) return byPosition;
        return left.id - right.id;
      }),
    [milestonesQuery.data?.data],
  );
  const submissionsByMilestone = useMemo(
    () => getLatestSubmissionByMilestone(submissionsQuery.data?.data ?? []),
    [submissionsQuery.data?.data],
  );
  const averageGrade = getAverageValue(averageGradeQuery.data?.data);

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock size={22} />}
        title="No group timeline"
        description="Join or create a group before submitting milestone deliverables."
      />
    );
  }

  return (
    <div className="grid min-w-0 gap-6">
      <Card>
        <CardHeader
          actions={
            <Badge tone={averageGrade === null ? "neutral" : "brand"}>
              {averageGradeQuery.isLoading
                ? "Loading average"
                : averageGrade === null
                  ? "No grade"
                  : `Average ${averageGrade.toFixed(2)}`}
            </Badge>
          }
          description="Submit or resubmit deliverable URLs for your group's instructor milestones."
          title="Milestone submissions"
        />
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-[minmax(240px,360px)_minmax(0,1fr)] gap-4 max-[760px]:grid-cols-1">
            <Select
              label="Group"
              onChange={(event) => {
                setSelectedGroupId(event.target.value);
                setActiveMilestone(null);
              }}
              value={String(effectiveGroupId ?? "")}
            >
              {groups.map((group) => (
                <option key={group.id} value={String(group.id)}>
                  {group.groupNo} - {group.name}
                </option>
              ))}
            </Select>

            <div className="grid content-center gap-1 rounded-xl border border-border bg-background px-4 py-3">
              <span className="text-sm font-bold text-foreground">
                {activeGroup?.projectName ?? activeGroup?.name ?? "Selected group"}
              </span>
              <span className="text-sm text-muted">
                {activeGroup
                  ? `${activeGroup.term} / ${activeGroup.courseCode}`
                  : "Group scope"}
              </span>
            </div>
          </div>

          {milestonesQuery.isLoading || submissionsQuery.isLoading ? (
            <LoadingState title="Loading milestone timeline" />
          ) : milestonesQuery.error || submissionsQuery.error ? (
            <EmptyState
              className="border-red-200 bg-red-50"
              description={getErrorMessage(
                milestonesQuery.error ?? submissionsQuery.error,
              )}
              icon={<AlertTriangle size={22} />}
              title="Unable to load timeline"
            />
          ) : milestones.length === 0 ? (
            <EmptyState
              title="No milestones published"
              description="Your instructor has not published milestones for this group yet."
            />
          ) : (
            <div className="grid gap-3">
              {milestones.map((milestone) => {
                const submission = submissionsByMilestone.get(milestone.id);
                const isClosed =
                  milestone.status === "ARCHIVED" ||
                  milestone.status === "CLOSED" ||
                  milestone.status === "INACTIVE";

                return (
                  <div
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-xl border border-border bg-surface p-4 max-[860px]:grid-cols-1"
                    key={milestone.id}
                  >
                    <div className="grid min-w-0 gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={getMilestoneStatusTone(milestone.status)}>
                          {milestone.status}
                        </Badge>
                        {submission ? (
                          <Badge tone={getSubmissionStatusTone(submission.status)}>
                            {submission.status}
                          </Badge>
                        ) : (
                          <Badge tone="neutral">Not submitted</Badge>
                        )}
                        {submission?.late && <Badge tone="danger">Late</Badge>}
                      </div>
                      <div className="grid gap-1">
                        <h3 className="m-0 text-base font-bold text-foreground">
                          {milestone.title}
                        </h3>
                        {milestone.description && (
                          <p className="m-0 text-sm leading-6 text-muted">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted">
                        <span className="rounded-full border border-border bg-background px-3 py-1">
                          Deadline {formatDateTime(milestone.deadlineAt)}
                        </span>
                        <span className="rounded-full border border-border bg-background px-3 py-1">
                          Weight {milestone.weight ?? "N/A"}%
                        </span>
                        <span className="rounded-full border border-border bg-background px-3 py-1">
                          Score{" "}
                          {formatScore(
                            submission?.score,
                            submission?.maxScore ?? milestone.maxScore,
                          )}
                        </span>
                      </div>
                      {submission?.feedback && (
                        <p className="m-0 rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-muted">
                          {submission.feedback}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start justify-end gap-2">
                      {submission?.fileUrl && (
                        <Button
                          icon={<ExternalLink size={15} />}
                          onClick={() =>
                            window.open(submission.fileUrl, "_blank", "noreferrer")
                          }
                          size="sm"
                          variant="secondary"
                        >
                          File
                        </Button>
                      )}
                      <Button
                        disabled={isClosed}
                        icon={<Upload size={15} />}
                        onClick={() => setActiveMilestone(milestone)}
                        size="sm"
                      >
                        {submission ? "Resubmit" : "Submit"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {activeMilestone && effectiveGroupId && (
        <SubmissionModal
          existingSubmission={submissionsByMilestone.get(activeMilestone.id)}
          groupId={effectiveGroupId}
          milestone={activeMilestone}
          onClose={() => setActiveMilestone(null)}
        />
      )}
    </div>
  );
}
