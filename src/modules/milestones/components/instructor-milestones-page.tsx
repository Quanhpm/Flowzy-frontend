"use client";

import { type FormEvent, useId, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Pencil,
  Plus,
  Save,
  Trash2,
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
  ResponsiveDialog,
  Select,
  TextInput,
} from "@/shared/components";
import { ApiError, getMinimumDateTimeLocal } from "@/shared/lib";
import type { CourseMilestoneStatus } from "@/shared/types";

import {
  useCourseMilestones,
  useCreateCourseMilestone,
  useDeleteCourseMilestone,
  useUpdateCourseMilestone,
} from "../hooks";
import type {
  CourseMilestoneDto,
  CreateCourseMilestoneRequest,
  UpdateCourseMilestoneRequest,
} from "../types";

type MilestoneFormProps = {
  filters: {
    courseCode: string;
    term: string;
  };
  milestone?: CourseMilestoneDto;
  onClose: () => void;
};

const milestoneStatuses: CourseMilestoneStatus[] = [
  "ACTIVE",
  "CLOSED",
  "INACTIVE",
  "ARCHIVED",
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

function toLocalDateTimeValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoDateTime(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function toOptionalNumber(value: string) {
  if (!value.trim()) return undefined;
  return Number(value);
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

function formatNumber(value: number | null | undefined, suffix = "") {
  return typeof value === "number" ? `${value}${suffix}` : "Not set";
}

function getStatusTone(status: CourseMilestoneStatus) {
  if (status === "ACTIVE") return "success";
  if (status === "CLOSED") return "warning";
  if (status === "ARCHIVED") return "danger";
  return "neutral";
}

function sortMilestones(milestones: CourseMilestoneDto[]) {
  return [...milestones].sort((left, right) => {
    const byPosition = (left.position ?? 0) - (right.position ?? 0);
    if (byPosition !== 0) return byPosition;
    return left.id - right.id;
  });
}

function buildCourseOptions(courses: string[]) {
  const values = new Set<string>(defaultCourseCodes);
  courses.forEach((course) => {
    const trimmed = course.trim();
    if (trimmed) values.add(trimmed);
  });

  return Array.from(values);
}

function MilestoneForm({ filters, milestone, onClose }: MilestoneFormProps) {
  const formId = useId();
  const isEditing = Boolean(milestone);
  const createMutation = useCreateCourseMilestone();
  const updateMutation = useUpdateCourseMilestone();
  const [error, setError] = useState("");
  const [term, setTerm] = useState(milestone?.term ?? filters.term);
  const courseOptions = useMemo(
    () =>
      buildCourseOptions([
        milestone?.courseCode ?? "",
        filters.courseCode,
      ]),
    [filters.courseCode, milestone?.courseCode],
  );
  const [courseCode, setCourseCode] = useState(
    milestone?.courseCode ?? filters.courseCode,
  );
  const [title, setTitle] = useState(milestone?.title ?? "");
  const [description, setDescription] = useState(
    milestone?.description ?? "",
  );
  const [weight, setWeight] = useState(
    typeof milestone?.weight === "number" ? String(milestone.weight) : "",
  );
  const [deadlineAt, setDeadlineAt] = useState(
    toLocalDateTimeValue(milestone?.deadlineAt),
  );
  const [maxScore, setMaxScore] = useState(
    typeof milestone?.maxScore === "number"
      ? String(milestone.maxScore)
      : "10",
  );
  const [position, setPosition] = useState(
    typeof milestone?.position === "number" ? String(milestone.position) : "",
  );
  const [status, setStatus] = useState<CourseMilestoneStatus>(
    milestone?.status ?? "ACTIVE",
  );

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  function buildSharedPayload() {
    const parsedWeight = toOptionalNumber(weight);
    const parsedMaxScore = toOptionalNumber(maxScore);
    const parsedPosition = toOptionalNumber(position);

    if (!title.trim()) {
      throw new Error("Title is required.");
    }

    if (
      parsedWeight !== undefined &&
      (!Number.isFinite(parsedWeight) || parsedWeight < 0 || parsedWeight > 100)
    ) {
      throw new Error("Weight must be between 0 and 100.");
    }

    if (
      parsedMaxScore !== undefined &&
      (!Number.isFinite(parsedMaxScore) || parsedMaxScore <= 0)
    ) {
      throw new Error("Max score must be greater than 0.");
    }

    if (
      parsedPosition !== undefined &&
      (!Number.isInteger(parsedPosition) || parsedPosition < 0)
    ) {
      throw new Error("Position must be a whole number greater than or equal to 0.");
    }

    if (deadlineAt) {
      const deadline = new Date(deadlineAt).getTime();
      if (!Number.isFinite(deadline) || deadline <= Date.now()) {
        throw new Error("Deadline must be in the future.");
      }
    }

    return {
      deadlineAt: toIsoDateTime(deadlineAt),
      description: optional(description),
      maxScore: parsedMaxScore,
      position: parsedPosition,
      title: title.trim(),
      weight: parsedWeight,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const sharedPayload = buildSharedPayload();

      if (milestone) {
        const payload: UpdateCourseMilestoneRequest = {
          ...sharedPayload,
          status,
        };

        updateMutation.mutate(
          { milestoneId: milestone.id, payload },
          { onSuccess: onClose },
        );
        return;
      }

      if (!term.trim() || !courseCode.trim()) {
        throw new Error("Term and course code are required.");
      }

      const payload: CreateCourseMilestoneRequest = {
        ...sharedPayload,
        courseCode: courseCode.trim(),
        term: term.trim(),
      };

      createMutation.mutate(payload, { onSuccess: onClose });
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
    }
  }

  return (
    <ResponsiveDialog
      className="min-[761px]:max-w-[720px]"
      closeLabel="Close milestone form"
      closeOnBackdrop={false}
      description="Manage the instructor timeline used by assigned project groups."
      footer={
        <>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={isPending}
            form={formId}
            icon={<Save size={16} />}
            type="submit"
          >
            {isPending ? "Saving..." : "Save milestone"}
          </Button>
        </>
      }
      mobileMode="fullscreen"
      onClose={onClose}
      title={isEditing ? "Edit milestone" : "Create milestone"}
    >
        <form className="grid min-w-0 gap-5" id={formId} onSubmit={handleSubmit}>
          {!isEditing && (
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              <TextInput
                label="Term"
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Summer2026"
                required
                value={term}
              />
              <Select
                label="Course code"
                onChange={(event) => setCourseCode(event.target.value)}
                required
                value={courseCode}
              >
                <option value="">Select course</option>
                {courseOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <TextInput
            label="Title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Prototype review"
            required
            value={title}
          />

          <label className="grid gap-[7px]">
            <span className="text-[13px] font-medium text-foreground">
              Description
            </span>
            <textarea
              className="min-h-28 min-w-0 rounded-xl border border-border bg-surface px-3.5 py-3 text-base text-foreground outline-0 transition-[border-color,box-shadow] focus:border-brand-secondary focus:shadow-[0_0_0_4px_rgba(237,161,47,0.12)] min-[761px]:text-sm"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Submission expectation, review focus, or grading note"
              value={description}
            />
          </label>

          <div className="grid grid-cols-4 gap-4 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
            <TextInput
              label="Weight"
              max={100}
              min={0}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="20"
              type="number"
              value={weight}
            />
            <TextInput
              label="Max score"
              min={0.01}
              onChange={(event) => setMaxScore(event.target.value)}
              placeholder="10"
              step="0.01"
              type="number"
              value={maxScore}
            />
            <TextInput
              label="Position"
              min={0}
              onChange={(event) => setPosition(event.target.value)}
              placeholder="1"
              type="number"
              value={position}
            />
            {isEditing && (
              <Select
                label="Status"
                onChange={(event) =>
                  setStatus(event.target.value as CourseMilestoneStatus)
                }
                value={status}
              >
                {milestoneStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <label className="grid gap-[7px]">
            <span className="text-[13px] font-medium text-foreground">
              Deadline
            </span>
            <input
              className="h-[50px] min-w-0 rounded-xl border border-border bg-surface px-3.5 text-base outline-0 transition-[border-color,box-shadow] focus:border-brand-secondary focus:shadow-[0_0_0_4px_rgba(237,161,47,0.12)] min-[761px]:text-sm"
              onChange={(event) => setDeadlineAt(event.target.value)}
              min={getMinimumDateTimeLocal()}
              type="datetime-local"
              value={deadlineAt}
            />
          </label>

          {(error || mutationError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error || getErrorMessage(mutationError)}
            </div>
          )}

        </form>
    </ResponsiveDialog>
  );
}

export function InstructorMilestonesPage() {
  const [term, setTerm] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [activeMilestone, setActiveMilestone] =
    useState<CourseMilestoneDto | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const groupFilters = {
    courseCode: optional(courseCode),
    term: optional(term),
  };
  const instructorGroupsQuery = useInstructorGroups(groupFilters);
  const milestonesQuery = useCourseMilestones({
    courseCode: courseCode.trim(),
    term: term.trim(),
  });
  const deleteMutation = useDeleteCourseMilestone();

  const assignedGroups = useMemo(
    () => instructorGroupsQuery.data?.data ?? [],
    [instructorGroupsQuery.data?.data],
  );
  const milestones = useMemo(
    () => sortMilestones(milestonesQuery.data?.data ?? []),
    [milestonesQuery.data?.data],
  );

  const uniqueTerms = useMemo(
    () =>
      Array.from(new Set(assignedGroups.map((group) => group.term).filter(Boolean))).sort(),
    [assignedGroups],
  );
  const courseOptions = useMemo(
    () =>
      buildCourseOptions(
        assignedGroups.map((group) => group.courseCode).filter(Boolean),
      ),
    [assignedGroups],
  );

  const hasRequiredFilters = Boolean(term.trim() && courseCode.trim());

  function handleArchive(milestone: CourseMilestoneDto) {
    const confirmed = window.confirm(
      `Archive "${milestone.title}"? Submissions and grades will be preserved.`,
    );

    if (!confirmed) return;

    deleteMutation.mutate({ milestoneId: milestone.id });
  }

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        actions={
          <Button
            className="max-[480px]:w-full"
            icon={<Plus size={16} />}
            onClick={() => setIsCreating(true)}
          >
            New milestone
          </Button>
        }
        description="Create and maintain weighted timeline milestones for your assigned project groups."
        eyebrow="Instructor"
        title="Milestones"
      />

      <Card>
        <CardContent className="grid gap-5">
          <div className="grid grid-cols-[repeat(2,minmax(180px,240px))_minmax(0,1fr)] items-end gap-3 max-[760px]:grid-cols-1">
            <TextInput
              label="Term"
              list="milestone-term-options"
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Summer2026"
              value={term}
            />
            <datalist id="milestone-term-options">
              {uniqueTerms.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            <Select
              label="Course code"
              onChange={(event) => setCourseCode(event.target.value)}
              value={courseCode}
            >
              <option value="">All courses</option>
              {courseOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Button
              className="w-fit justify-self-end border-neutral-200 bg-neutral-100 px-4 text-muted [&:hover:not(:disabled)]:border-neutral-300 [&:hover:not(:disabled)]:bg-neutral-200 max-[760px]:w-full max-[760px]:justify-self-stretch"
              onClick={() => {
                setTerm("");
                setCourseCode("");
              }}
              variant="secondary"
            >
              Clear filters
            </Button>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-xl border border-border bg-background p-4 max-[760px]:grid-cols-1">
            <div className="grid gap-1">
              <span className="text-sm font-bold text-foreground">
                Assigned group scope
              </span>
              <span className="break-words text-sm text-muted">
                Use one of your assigned groups to choose the term and course
                before loading milestones.
              </span>
            </div>
            <Badge tone="neutral">{assignedGroups.length} groups</Badge>
            {instructorGroupsQuery.isLoading ? (
              <LoadingState className="col-span-full min-h-24" title="Loading assigned groups" />
            ) : assignedGroups.length > 0 ? (
              <div className="col-span-full flex flex-wrap gap-2">
                {assignedGroups.map((group) => (
                  <button
                    className="inline-flex min-h-11 min-w-0 flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-left text-xs font-medium text-muted transition-colors hover:border-brand-secondary hover:text-foreground"
                    key={group.id}
                    onClick={() => {
                      setTerm(group.term);
                      setCourseCode(group.courseCode);
                    }}
                    type="button"
                  >
                    <span className="font-bold text-foreground">
                      {group.groupNo}
                    </span>
                    <span>{group.term}</span>
                    <span>{group.courseCode}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="col-span-full m-0 text-sm text-muted">
                No assigned groups were returned for the current filters.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          actions={
            hasRequiredFilters && (
              <Badge tone="brand">
                {term.trim()} / {courseCode.trim()}
              </Badge>
            )
          }
          description="Only canonical /api/instructor/milestones endpoints are used here."
          title="Timeline milestones"
        />
        <CardContent>
          {!hasRequiredFilters ? (
            <EmptyState
              icon={<CalendarClock size={22} />}
              title="Select a term and course"
              description="Milestones load after both filters are set."
            />
          ) : milestonesQuery.isLoading ? (
            <LoadingState title="Loading milestones" />
          ) : milestonesQuery.error ? (
            <EmptyState
              className="border-red-200 bg-red-50"
              description={getErrorMessage(milestonesQuery.error)}
              icon={<AlertTriangle size={22} />}
              title="Unable to load milestones"
            />
          ) : milestones.length === 0 ? (
            <EmptyState
              title="No milestones yet"
              description="Create the first timeline item for this term and course."
            />
          ) : (
            <div className="grid gap-3">
              {milestones.map((milestone) => (
                <div
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-card-interactive max-[760px]:grid-cols-1"
                  key={milestone.id}
                >
                  <div className="grid min-w-0 gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <Badge tone={getStatusTone(milestone.status)}>
                        {milestone.status}
                      </Badge>
                      <span className="text-xs font-medium text-muted">
                        Position {formatNumber(milestone.position)}
                      </span>
                      <span className="text-xs font-medium text-muted">
                        {formatDateTime(milestone.deadlineAt)}
                      </span>
                    </div>
                    <div className="grid min-w-0 gap-1">
                      <h3 className="m-0 break-words text-base font-bold text-foreground">
                        {milestone.title}
                      </h3>
                      {milestone.description && (
                        <p className="m-0 break-words text-sm leading-6 text-muted">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted">
                      <span className="rounded-full border border-border bg-background px-3 py-1">
                        Weight {formatNumber(milestone.weight, "%")}
                      </span>
                      <span className="rounded-full border border-border bg-background px-3 py-1">
                        Max score {formatNumber(milestone.maxScore)}
                      </span>
                      <span className="rounded-full border border-border bg-background px-3 py-1">
                        #{milestone.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-end gap-2 max-[480px]:grid max-[480px]:[&>button]:min-h-11 max-[480px]:[&>button]:w-full">
                    <Button
                      icon={<Pencil size={15} />}
                      onClick={() => setActiveMilestone(milestone)}
                      size="sm"
                      variant="secondary"
                    >
                      Edit
                    </Button>
                    <Button
                      disabled={deleteMutation.isPending}
                      icon={<Trash2 size={15} />}
                      onClick={() => handleArchive(milestone)}
                      size="sm"
                      variant="danger"
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isCreating && (
        <MilestoneForm
          filters={{ courseCode, term }}
          onClose={() => setIsCreating(false)}
        />
      )}
      {activeMilestone && (
        <MilestoneForm
          filters={{ courseCode, term }}
          milestone={activeMilestone}
          onClose={() => setActiveMilestone(null)}
        />
      )}
    </div>
  );
}
