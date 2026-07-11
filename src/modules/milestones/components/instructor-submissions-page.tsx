"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  GraduationCap,
  Save,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { useInstructorGroups } from "@/modules/groups";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LoadingState,
  PageHeader,
  Select,
  TextInput,
} from "@/shared/components";
import { ApiError } from "@/shared/lib";
import type { MilestoneSubmissionStatus } from "@/shared/types";

import {
  useAverageGrade,
  useCourseMilestones,
  useGradeForSubmission,
  useGradeSubmission,
  useInstructorSubmissions,
  useUpdateMilestoneGrade,
} from "../hooks";
import type {
  CourseMilestoneDto,
  MilestoneGradeDto,
  MilestoneSubmissionDto,
} from "../types";

type GradeModalProps = {
  milestone: CourseMilestoneDto | null;
  onClose: () => void;
  submission: MilestoneSubmissionDto;
};

const submissionStatuses: MilestoneSubmissionStatus[] = [
  "SUBMITTED",
  "RESUBMITTED",
  "GRADED",
];

const defaultCourseCodes = ["EXE101", "EXE201", "EXE401"] as const;

function getErrorMessage(error: unknown) {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseOptionalId(value: string) {
  return value ? Number(value) : undefined;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not submitted";
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

function getSubmissionStatusTone(status: MilestoneSubmissionStatus) {
  if (status === "GRADED") return "success";
  if (status === "RESUBMITTED") return "warning";
  return "brand";
}

function getAverageValue(value: { averageGrade: number | null; average: number | null } | undefined) {
  if (!value) return null;
  return value.averageGrade ?? value.average ?? null;
}

function buildCourseOptions(courses: string[]) {
  const values = new Set<string>(defaultCourseCodes);
  courses.forEach((course) => {
    const trimmed = course.trim();
    if (trimmed) values.add(trimmed);
  });

  return Array.from(values);
}

function GradeModal({ milestone, onClose, submission }: GradeModalProps) {
  const gradeQuery = useGradeForSubmission(submission.id);
  const gradeMutation = useGradeSubmission();
  const updateGradeMutation = useUpdateMilestoneGrade();
  const [score, setScore] = useState(
    typeof submission.score === "number" ? String(submission.score) : "",
  );
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [error, setError] = useState("");

  const existingGrade: MilestoneGradeDto | undefined = gradeQuery.data?.data;
  const maxScore = submission.maxScore ?? milestone?.maxScore ?? undefined;
  const isPending = gradeMutation.isPending || updateGradeMutation.isPending;
  const mutationError = gradeMutation.error ?? updateGradeMutation.error;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!existingGrade) return;
    setScore(String(existingGrade.score));
    setFeedback(existingGrade.feedback ?? "");
  }, [existingGrade]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedScore = Number(score);

    if (!Number.isFinite(parsedScore)) {
      setError("Score is required.");
      return;
    }

    if (parsedScore < 0) {
      setError("Score must be greater than or equal to 0.");
      return;
    }

    if (typeof maxScore === "number" && parsedScore > maxScore) {
      setError(`Score cannot be higher than ${maxScore}.`);
      return;
    }

    const payload = {
      feedback: optional(feedback),
      score: parsedScore,
    };

    if (existingGrade?.id) {
      updateGradeMutation.mutate(
        {
          gradeId: existingGrade.id,
          payload,
          submissionId: submission.id,
        },
        { onSuccess: onClose },
      );
      return;
    }

    gradeMutation.mutate(
      {
        payload,
        submissionId: submission.id,
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
              Grade submission
            </h2>
            <p className="m-0 text-sm text-muted">
              Submission #{submission.id}
              {milestone ? ` for ${milestone.title}` : ""}
            </p>
          </div>
          <Button
            aria-label="Close grade form"
            className="size-8 rounded-lg p-0"
            onClick={onClose}
            variant="secondary"
          >
            <X className="size-4" />
          </Button>
        </div>

        <form className="grid gap-5 overflow-y-auto p-6" onSubmit={handleSubmit}>
          <div className="grid gap-2 rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={getSubmissionStatusTone(submission.status)}>
                {submission.status}
              </Badge>
              {submission.late && <Badge tone="danger">Late</Badge>}
              <span className="text-xs text-muted">
                Submitted {formatDateTime(submission.submittedAt)}
              </span>
            </div>
            <a
              className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-brand-primary hover:underline"
              href={submission.fileUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-4" />
              <span className="truncate">{submission.fileUrl}</span>
            </a>
            {submission.comments && (
              <p className="m-0 text-sm leading-6 text-muted">
                {submission.comments}
              </p>
            )}
          </div>

          {gradeQuery.isLoading && (
            <LoadingState className="min-h-20" title="Checking existing grade" />
          )}

          <TextInput
            label={typeof maxScore === "number" ? `Score out of ${maxScore}` : "Score"}
            min={0}
            onChange={(event) => setScore(event.target.value)}
            placeholder="8.5"
            required
            step="0.01"
            type="number"
            value={score}
          />

          <label className="grid gap-[7px]">
            <span className="text-[13px] font-medium text-foreground">
              Feedback
            </span>
            <textarea
              className="min-h-28 rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-foreground outline-0 transition-[border-color,box-shadow] focus:border-brand-secondary focus:shadow-[0_0_0_4px_rgba(237,161,47,0.12)]"
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="Feedback for the group"
              value={feedback}
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
            <Button disabled={isPending} icon={<Save size={16} />} type="submit">
              {isPending ? "Saving..." : existingGrade ? "Update grade" : "Save grade"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InstructorSubmissionsPage() {
  const [term, setTerm] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [groupId, setGroupId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [status, setStatus] = useState("");
  const [late, setLate] = useState("");
  const [activeSubmission, setActiveSubmission] =
    useState<MilestoneSubmissionDto | null>(null);

  const instructorGroupsQuery = useInstructorGroups({
    courseCode: optional(courseCode),
    term: optional(term),
  });
  const milestonesQuery = useCourseMilestones({
    courseCode: courseCode.trim(),
    term: term.trim(),
  });
  const submissionsQuery = useInstructorSubmissions({
    courseCode: optional(courseCode),
    groupId: parseOptionalId(groupId),
    late: late ? late === "true" : undefined,
    milestoneId: parseOptionalId(milestoneId),
    status: status ? (status as MilestoneSubmissionStatus) : undefined,
    term: optional(term),
  });
  const averageGradeQuery = useAverageGrade(parseOptionalId(groupId));

  const groups = useMemo(
    () => instructorGroupsQuery.data?.data ?? [],
    [instructorGroupsQuery.data?.data],
  );
  const milestones = useMemo(
    () => milestonesQuery.data?.data ?? [],
    [milestonesQuery.data?.data],
  );
  const submissions = submissionsQuery.data?.data ?? [];
  const averageGrade = getAverageValue(averageGradeQuery.data?.data);

  const milestonesById = useMemo(
    () => new Map(milestones.map((milestone) => [milestone.id, milestone])),
    [milestones],
  );
  const groupsById = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  );
  const selectedSubmissionMilestone = activeSubmission
    ? milestonesById.get(activeSubmission.milestoneId) ?? null
    : null;

  const uniqueTerms = useMemo(
    () => Array.from(new Set(groups.map((group) => group.term).filter(Boolean))).sort(),
    [groups],
  );
  const courseOptions = useMemo(
    () => buildCourseOptions(groups.map((group) => group.courseCode).filter(Boolean)),
    [groups],
  );

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        description="Review deliverables from assigned groups, grade submissions, and inspect weighted averages."
        eyebrow="Instructor"
        title="Submissions"
      />

      <Card>
        <CardHeader
          description="Filters map directly to /api/instructor/submissions query parameters."
          title="Submission filters"
        />
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-[repeat(6,minmax(130px,1fr))] items-end gap-3 max-[1180px]:grid-cols-3 max-[760px]:grid-cols-1">
            <TextInput
              icon={<SlidersHorizontal size={16} />}
              label="Term"
              list="submission-term-options"
              onChange={(event) => {
                setTerm(event.target.value);
                setMilestoneId("");
              }}
              placeholder="Summer2026"
              value={term}
            />
            <datalist id="submission-term-options">
              {uniqueTerms.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            <Select
              label="Course"
              onChange={(event) => {
                setCourseCode(event.target.value);
                setMilestoneId("");
              }}
              value={courseCode}
            >
              <option value="">All courses</option>
              {courseOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select
              label="Group"
              onChange={(event) => setGroupId(event.target.value)}
              value={groupId}
            >
              <option value="">All groups</option>
              {groups.map((group) => (
                <option key={group.id} value={String(group.id)}>
                  {group.groupNo} - {group.name}
                </option>
              ))}
            </Select>
            <Select
              label="Milestone"
              onChange={(event) => setMilestoneId(event.target.value)}
              value={milestoneId}
            >
              <option value="">All milestones</option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={String(milestone.id)}>
                  {milestone.title}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="">All statuses</option>
              {submissionStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select
              label="Late"
              onChange={(event) => setLate(event.target.value)}
              value={late}
            >
              <option value="">All</option>
              <option value="true">Late only</option>
              <option value="false">On time</option>
            </Select>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-background p-4 max-[760px]:grid-cols-1">
            <div className="grid gap-1">
              <span className="text-sm font-bold text-foreground">
                Weighted average
              </span>
              <span className="text-sm text-muted">
                Select one group to load the current weighted average from the
                student group grade endpoint.
              </span>
            </div>
            <Badge tone={averageGrade === null ? "neutral" : "brand"}>
              {groupId
                ? averageGradeQuery.isLoading
                  ? "Loading..."
                  : averageGrade === null
                    ? "No grade"
                    : averageGrade.toFixed(2)
                : "Select group"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          actions={<Badge tone="neutral">{submissions.length} submissions</Badge>}
          description="Open a submission to create or update its grade."
          title="Assigned group submissions"
        />
        <CardContent>
          {submissionsQuery.isLoading ? (
            <LoadingState title="Loading submissions" />
          ) : submissionsQuery.error ? (
            <EmptyState
              className="border-red-200 bg-red-50"
              description={getErrorMessage(submissionsQuery.error)}
              icon={<AlertTriangle size={22} />}
              title="Unable to load submissions"
            />
          ) : submissions.length === 0 ? (
            <EmptyState
              icon={<GraduationCap size={22} />}
              title="No submissions found"
              description="Try a different filter set or wait for group leaders to submit deliverables."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                      Group
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                      Milestone
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                      Submitted
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                      Score
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface text-sm">
                  {submissions.map((submission) => {
                    const milestone = milestonesById.get(submission.milestoneId);
                    const group = groupsById.get(submission.groupId);

                    return (
                      <tr className="transition-colors hover:bg-background" key={submission.id}>
                        <td className="px-5 py-4">
                          <div className="grid gap-1">
                            <span className="font-bold text-foreground">
                              {group?.groupNo ?? `Group #${submission.groupId}`}
                            </span>
                            <span className="text-xs text-muted">
                              {group?.name ?? "Assigned group"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="grid gap-1">
                            <span className="font-medium text-foreground">
                              {milestone?.title ?? `Milestone #${submission.milestoneId}`}
                            </span>
                            <span className="text-xs text-muted">
                              Max {submission.maxScore ?? milestone?.maxScore ?? "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge tone={getSubmissionStatusTone(submission.status)}>
                              {submission.status}
                            </Badge>
                            {submission.late && <Badge tone="danger">Late</Badge>}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted">
                          {formatDateTime(submission.submittedAt)}
                        </td>
                        <td className="px-5 py-4 font-medium text-foreground">
                          {formatScore(submission.score, submission.maxScore)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              icon={<ExternalLink size={15} />}
                              onClick={() => window.open(submission.fileUrl, "_blank", "noreferrer")}
                              size="sm"
                              variant="secondary"
                            >
                              File
                            </Button>
                            <Button
                              icon={<GraduationCap size={15} />}
                              onClick={() => setActiveSubmission(submission)}
                              size="sm"
                            >
                              Grade
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {activeSubmission && (
        <GradeModal
          milestone={selectedSubmissionMilestone}
          onClose={() => setActiveSubmission(null)}
          submission={activeSubmission}
        />
      )}
    </div>
  );
}
