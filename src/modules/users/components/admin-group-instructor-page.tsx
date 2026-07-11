"use client";

import { FormEvent, useState } from "react";
import { Search, UserRoundPlus } from "lucide-react";

import { useAssignGroupInstructor, useGroups } from "@/modules/groups";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  LoadingState,
  PageHeader,
  Select,
  TextInput,
} from "@/shared/components";
import { ApiError, cn } from "@/shared/lib";

import { useAdminUsers } from "../hooks/use-admin-users";

const INSTRUCTOR_PAGE_SIZE = 50;
const pageClassName = "grid min-w-0 gap-6";
const filterClassName =
  "grid grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto] items-end gap-3 max-[760px]:grid-cols-[minmax(0,1fr)]";
const tableWrapClassName = "w-full overflow-x-auto";
const tableClassName = "w-full min-w-[1180px] border-collapse";
const tableHeadCellClassName =
  "border-b border-border px-4 py-3 text-left text-xs font-bold tracking-[0.04em] text-muted uppercase";
const tableCellClassName =
  "border-b border-border px-4 py-4 align-middle text-sm text-foreground";

type AppliedFilters = {
  groupSearch: string;
  instructorSearch: string;
};

type RowFeedback = {
  message: string;
  tone: "error" | "success";
};

function optional(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function getLoadErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Unable to load groups or active instructors. Please try again.";
}

function getMutationErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Unable to assign the instructor. Please try again.";
}

export function AdminGroupInstructorPage() {
  const [groupSearchInput, setGroupSearchInput] = useState("");
  const [instructorSearchInput, setInstructorSearchInput] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    groupSearch: "",
    instructorSearch: "",
  });
  const [instructorPage, setInstructorPage] = useState(0);
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<
    Record<number, string>
  >({});
  const [assigningGroupId, setAssigningGroupId] = useState<number | null>(null);
  const [rowFeedback, setRowFeedback] = useState<
    Record<number, RowFeedback | undefined>
  >({});

  const groupsQuery = useGroups({
    search: optional(appliedFilters.groupSearch),
  });
  const instructorsQuery = useAdminUsers({
    page: instructorPage,
    role: "INSTRUCTOR",
    search: optional(appliedFilters.instructorSearch),
    size: INSTRUCTOR_PAGE_SIZE,
    status: "ACTIVE",
  });
  const assignInstructorMutation = useAssignGroupInstructor();
  const groups = groupsQuery.data?.data ?? [];
  const instructorPageData = instructorsQuery.data?.data;
  const instructors = instructorPageData?.content ?? [];

  function clearSelections() {
    setSelectedInstructorIds({});
    setRowFeedback({});
  }

  function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters({
      groupSearch: groupSearchInput.trim(),
      instructorSearch: instructorSearchInput.trim(),
    });
    setInstructorPage(0);
    clearSelections();
  }

  function handleInstructorPageChange(nextPage: number) {
    setInstructorPage(nextPage);
    clearSelections();
  }

  function setFeedback(groupId: number, feedback: RowFeedback) {
    setRowFeedback((current) => ({ ...current, [groupId]: feedback }));
  }

  async function handleAssign(
    groupId: number,
    currentInstructorId: number | null,
  ) {
    const instructorId = Number(selectedInstructorIds[groupId]);

    if (!Number.isInteger(instructorId) || instructorId < 1) {
      setFeedback(groupId, {
        message: "Choose an active instructor before assigning the group.",
        tone: "error",
      });
      return;
    }

    if (instructorId === currentInstructorId) {
      setFeedback(groupId, {
        message: "This instructor is already assigned to the group.",
        tone: "error",
      });
      return;
    }

    setAssigningGroupId(groupId);
    setRowFeedback((current) => ({ ...current, [groupId]: undefined }));

    try {
      await assignInstructorMutation.mutateAsync({
        groupId,
        payload: { instructorId },
      });
      setSelectedInstructorIds((current) => ({ ...current, [groupId]: "" }));
      await groupsQuery.refetch();
      setFeedback(groupId, {
        message: "Instructor assignment saved.",
        tone: "success",
      });
    } catch (mutationError) {
      setFeedback(groupId, {
        message: getMutationErrorMessage(mutationError),
        tone: "error",
      });
    } finally {
      setAssigningGroupId(null);
    }
  }

  return (
    <div className={pageClassName}>
      <PageHeader
        description="Review the current assignment and choose an active Instructor account for each group."
        eyebrow="Admin"
        title="Assign instructors"
      />

      <Card>
        <CardContent className="grid gap-4">
          <form className={filterClassName} onSubmit={handleApplyFilters}>
            <TextInput
              icon={<Search size={16} />}
              label="Search groups"
              onChange={(event) => setGroupSearchInput(event.target.value)}
              placeholder="Group name, term, or course"
              value={groupSearchInput}
            />
            <TextInput
              icon={<Search size={16} />}
              label="Search active instructors"
              onChange={(event) => setInstructorSearchInput(event.target.value)}
              placeholder="Name, code, or email"
              value={instructorSearchInput}
            />
            <Button type="submit">Apply filters</Button>
          </form>

          {instructorPageData && instructorPageData.totalElements > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-sm text-muted">
                Instructor page {instructorPageData.page + 1} of{" "}
                {instructorPageData.totalPages} ({instructorPageData.totalElements}{" "}
                active accounts)
              </span>
              <div className="flex gap-2">
                <Button
                  disabled={
                    assigningGroupId !== null || !instructorPageData.hasPrevious
                  }
                  onClick={() =>
                    handleInstructorPageChange(Math.max(0, instructorPage - 1))
                  }
                  size="sm"
                  variant="secondary"
                >
                  Previous
                </Button>
                <Button
                  disabled={
                    assigningGroupId !== null || !instructorPageData.hasNext
                  }
                  onClick={() => handleInstructorPageChange(instructorPage + 1)}
                  size="sm"
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {!instructorsQuery.isLoading &&
            !instructorsQuery.isError &&
            instructors.length === 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm text-muted">
                <UserRoundPlus size={18} />
                No active instructors match the current instructor filter.
              </div>
            )}
        </CardContent>
      </Card>

      {groupsQuery.isLoading || instructorsQuery.isLoading ? (
        <LoadingState title="Loading groups and active instructors" />
      ) : groupsQuery.isError || instructorsQuery.isError ? (
        <EmptyState
          description={getLoadErrorMessage(
            groupsQuery.error ?? instructorsQuery.error,
          )}
          title="Assignment data unavailable"
        />
      ) : groups.length === 0 ? (
        <EmptyState
          description="No groups match the current group filter."
          title="No groups found"
        />
      ) : (
        <Card>
          <div className={tableWrapClassName}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>Group</th>
                  <th className={tableHeadCellClassName}>Term / course</th>
                  <th className={tableHeadCellClassName}>Mentor</th>
                  <th className={tableHeadCellClassName}>Current instructor</th>
                  <th className={tableHeadCellClassName}>Assign new instructor</th>
                  <th className={tableHeadCellClassName} aria-label="Assign" />
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const selectedInstructorId = selectedInstructorIds[group.id] ?? "";
                  const isSameInstructor =
                    Boolean(selectedInstructorId) &&
                    Number(selectedInstructorId) === group.instructorId;
                  const isCurrentRowPending = assigningGroupId === group.id;
                  const feedback = rowFeedback[group.id];

                  return (
                    <tr key={group.id}>
                      <td className={tableCellClassName}>
                        <div className="grid gap-1">
                          <span className="font-bold">{group.name}</span>
                          <span className="text-xs text-muted">{group.groupNo}</span>
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <div className="grid gap-1">
                          <span>{group.term}</span>
                          <span className="text-xs text-muted">
                            {group.courseCode}
                          </span>
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        {group.mentorName ? (
                          <Badge tone="neutral">{group.mentorName}</Badge>
                        ) : (
                          <span className="text-muted">Unassigned</span>
                        )}
                      </td>
                      <td className={tableCellClassName}>
                        {group.instructorName || group.instructorCode ? (
                          <div className="grid gap-1">
                            <Badge tone="neutral">
                              {group.instructorName ?? "Assigned instructor"}
                            </Badge>
                            <span className="text-xs text-muted">
                              {group.instructorCode ?? "No instructor code"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">Unassigned</span>
                        )}
                      </td>
                      <td className={cn(tableCellClassName, "min-w-[280px]")}>
                        <div className="grid gap-2">
                          <Select
                            aria-label={`New instructor for ${group.name}`}
                            disabled={
                              assigningGroupId !== null || instructors.length === 0
                            }
                            onChange={(event) => {
                              const value = event.target.value;
                              setSelectedInstructorIds((current) => ({
                                ...current,
                                [group.id]: value,
                              }));
                              setRowFeedback((current) => ({
                                ...current,
                                [group.id]: undefined,
                              }));
                            }}
                            value={selectedInstructorId}
                          >
                            <option value="">Choose active instructor</option>
                            {instructors.map((instructor) => (
                              <option key={instructor.id} value={instructor.id}>
                                {instructor.fullName ?? instructor.email} ({
                                  instructor.code ?? "-"
                                })
                              </option>
                            ))}
                          </Select>
                          {feedback && (
                            <span
                              className={cn(
                                "text-xs",
                                feedback.tone === "success"
                                  ? "text-green-800"
                                  : "text-red-700",
                              )}
                            >
                              {feedback.message}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <Button
                          disabled={
                            assigningGroupId !== null ||
                            !selectedInstructorId ||
                            isSameInstructor
                          }
                          onClick={() =>
                            handleAssign(group.id, group.instructorId)
                          }
                          size="sm"
                        >
                          {isCurrentRowPending ? "Saving..." : "Assign"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
