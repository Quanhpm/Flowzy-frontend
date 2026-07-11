import type { ReactNode } from "react";
import {
  AlertTriangle,
  Award,
  Compass,
  ExternalLink,
  FileText,
  Users,
} from "lucide-react";

import { Button, LoadingState, Select } from "@/shared/components";
import type { EntityId, ProblemStatus } from "@/shared/types";

import { useProblem, useEvaluationCriteria } from "../hooks";
import {
  useClearGroupProblem,
  useSelectGroupProblem,
  useUpdateProblemStatus,
} from "../hooks/use-problem-mutations";
import { ProblemDifficultyBadge } from "./problem-difficulty-badge";
import { ProblemStatusBadge } from "./problem-status-badge";

type ProblemDetailModalProps = {
  problemId: EntityId;
  onClose: () => void;
  isGroupLeader?: boolean;
  currentGroupId?: EntityId | null;
  selectedProblemId?: EntityId | null;
  isAdmin?: boolean;
  onEditClick?: () => void;
  onReviewClick?: () => void;
};

type DetailSectionProps = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
  tone?: "default" | "danger";
};

type MetadataItemProps = {
  label: string;
  value: ReactNode;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function DetailSection({
  children,
  icon,
  title,
  tone = "default",
}: DetailSectionProps) {
  const isDanger = tone === "danger";

  return (
    <section className="grid gap-2.5">
      <h3
        className={
          isDanger
            ? "m-0 flex items-center gap-2 text-xs font-bold tracking-[0.05em] text-red-700 uppercase"
            : "m-0 flex items-center gap-2 text-xs font-bold tracking-[0.05em] text-muted uppercase"
        }
      >
        {icon}
        {title}
      </h3>
      <div
        className={
          isDanger
            ? "rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-relaxed text-red-800"
            : "rounded-xl border border-border bg-surface px-4 py-3.5 text-sm leading-relaxed text-foreground shadow-card"
        }
      >
        {children}
      </div>
    </section>
  );
}

function MetadataItem({ label, value }: MetadataItemProps) {
  return (
    <div className="rounded-lg border border-border bg-background px-3.5 py-3">
      <span className="block text-[10px] font-bold tracking-[0.05em] text-muted uppercase">
        {label}
      </span>
      <span className="mt-1 block text-sm leading-snug font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

export function ProblemDetailModal({
  problemId,
  onClose,
  isGroupLeader = false,
  currentGroupId = null,
  selectedProblemId = null,
  isAdmin = false,
  onEditClick,
  onReviewClick,
}: ProblemDetailModalProps) {
  const { data: problemResponse, isLoading } = useProblem(problemId);
  const { data: criteriaResponse } = useEvaluationCriteria();

  const selectProblemMutation = useSelectGroupProblem(currentGroupId || 0);
  const clearProblemMutation = useClearGroupProblem(currentGroupId || 0);
  const updateStatusMutation = useUpdateProblemStatus(problemId);

  const problem = problemResponse?.data;
  const criteria = criteriaResponse?.data || [];
  const isSelected =
    selectedProblemId && Number(selectedProblemId) === Number(problemId);

  function handleSelect() {
    if (!currentGroupId) return;
    selectProblemMutation.mutate(
      { problemId: Number(problemId) },
      {
        onSuccess: () => onClose(),
      },
    );
  }

  function handleClear() {
    if (!currentGroupId) return;
    if (
      window.confirm(
        "Are you sure you want to deselect this problem for your group?",
      )
    ) {
      clearProblemMutation.mutate(undefined, {
        onSuccess: () => onClose(),
      });
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6">
        <div className="w-[min(680px,100%)] rounded-2xl border border-border bg-surface p-8 shadow-modal">
          <LoadingState title="Loading problem details..." />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6">
        <div className="w-[min(480px,100%)] rounded-2xl border border-border bg-surface p-6 text-center shadow-modal">
          <h3 className="mb-2 text-lg font-bold text-red-600">
            Error loading problem
          </h3>
          <p className="text-sm text-muted">
            Problem details could not be retrieved.
          </p>
          <Button className="mt-4" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        aria-label="Close problem details"
        className="fixed inset-0 z-40 cursor-default border-0 bg-[rgba(26,26,26,0.36)]"
        onClick={onClose}
        type="button"
      />

      <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4 max-[640px]:p-2">
        <section
          aria-label="Problem details"
          className="pointer-events-auto flex max-h-[calc(100svh-32px)] w-[min(980px,100%)] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-modal max-[640px]:max-h-[calc(100svh-16px)]"
          role="dialog"
        >
          <header className="border-b border-border bg-surface px-6 py-5 max-[640px]:px-4">
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="grid min-w-0 gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ProblemDifficultyBadge
                    difficulty={problem.difficultyLevel}
                  />
                  <span className="rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-xs font-bold text-muted">
                    {problem.code || "PROPOSAL"}
                  </span>
                  <ProblemStatusBadge status={problem.status} size="sm" />
                </div>
                <h2 className="m-0 text-[clamp(22px,2.6vw,30px)] leading-tight font-bold text-foreground">
                  {problem.title}
                </h2>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-background/60 px-6 py-5 max-[640px]:px-4">
            <div className="grid min-w-0 grid-cols-[minmax(0,1.45fr)_minmax(260px,0.75fr)] gap-5 max-[860px]:grid-cols-1">
              <div className="grid min-w-0 content-start gap-5">
                <DetailSection
                  icon={<FileText className="size-4" />}
                  title="Problem Statement"
                >
                  <p className="m-0 whitespace-pre-wrap">
                    {problem.statement}
                  </p>
                </DetailSection>

                {problem.expectedOutput && (
                  <DetailSection
                    icon={<Compass className="size-4" />}
                    title="Expected Deliverables / Output"
                  >
                    <p className="m-0 whitespace-pre-wrap">
                      {problem.expectedOutput}
                    </p>
                  </DetailSection>
                )}

                {(problem.status === "REJECTED" ||
                  problem.reviewComment) && (
                  <DetailSection
                    icon={<AlertTriangle className="size-4" />}
                    title="Review Feedback"
                    tone="danger"
                  >
                    <p className="m-0 font-semibold">
                      {problem.reviewComment ||
                        "Rejected by administrator with no additional comments."}
                    </p>
                    {problem.reviewedBy && (
                      <p className="mt-2 mb-0 text-xs text-red-700/80">
                        Reviewed by {problem.reviewedBy.email}
                      </p>
                    )}
                  </DetailSection>
                )}

                {criteria.length > 0 && (
                  <section className="grid gap-3">
                    <h3 className="m-0 flex items-center gap-2 text-xs font-bold tracking-[0.05em] text-muted uppercase">
                      <Award className="size-4" />
                      Evaluation & Feasibility Rubric
                    </h3>
                    <div className="grid gap-3">
                      {criteria.map((crit) => (
                        <div
                          className="rounded-xl border border-border bg-surface p-4 shadow-card"
                          key={crit.id}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="m-0 text-sm font-bold text-foreground">
                                {crit.category} - {crit.code}
                              </h4>
                              <p className="m-0 mt-1 text-sm leading-relaxed text-muted">
                                {crit.question}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-surface-warm px-2.5 py-1 text-xs font-bold text-brand-primary">
                              Max {crit.maxScore}
                            </span>
                          </div>
                          {crit.suggestion && (
                            <p className="mt-3 mb-0 rounded-lg border border-border-warm bg-surface-warm px-3 py-2 text-xs leading-relaxed text-muted">
                              Suggestion: {crit.suggestion}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="grid min-w-0 content-start gap-4">
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                  <h3 className="m-0 border-b border-border pb-3 text-xs font-bold tracking-[0.05em] text-foreground uppercase">
                    Specifications
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {problem.domain && (
                      <MetadataItem
                        label="Domain"
                        value={`${problem.domain.name} (${problem.domain.code})`}
                      />
                    )}
                    {problem.ownerLab && (
                      <MetadataItem
                        label="Owner Lab"
                        value={problem.ownerLab}
                      />
                    )}
                    {problem.suggestedCourses && (
                      <MetadataItem
                        label="Suggested Courses"
                        value={problem.suggestedCourses}
                      />
                    )}
                    {problem.strategicTheme && (
                      <MetadataItem
                        label="Strategic Theme"
                        value={problem.strategicTheme}
                      />
                    )}
                    {problem.researchArea && (
                      <MetadataItem
                        label="Research Area"
                        value={problem.researchArea}
                      />
                    )}
                    {problem.driveFolderLink && (
                      <a
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-bold text-brand-primary transition-colors duration-[160ms] hover:bg-background"
                        href={problem.driveFolderLink}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="size-4" />
                        Drive Workspace Link
                      </a>
                    )}
                  </div>
                </div>

                {problem.sourceType === "SELF_PROPOSED" &&
                  (problem.proposedByGroup || problem.proposedByStudent) && (
                    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
                      <h3 className="m-0 flex items-center gap-2 border-b border-border pb-3 text-xs font-bold tracking-[0.05em] text-foreground uppercase">
                        <Users className="size-4 text-muted" />
                        Proposer Information
                      </h3>
                      <div className="mt-4 grid gap-3">
                        {problem.proposedByGroup && (
                          <MetadataItem
                            label="Group Proposer"
                            value={`${problem.proposedByGroup.groupNo} - ${problem.proposedByGroup.name}`}
                          />
                        )}
                        {problem.proposedByStudent && (
                          <MetadataItem
                            label="Student Contact"
                            value={`${problem.proposedByStudent.fullName} (${problem.proposedByStudent.studentCode})`}
                          />
                        )}
                      </div>
                    </div>
                  )}
              </aside>
            </div>
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-border bg-surface px-6 py-4 max-[760px]:grid max-[760px]:px-4">
            <div className="text-xs text-muted">
              Created: {formatDate(problem.createdAt)}
            </div>

            <div className="flex flex-wrap justify-end gap-2 max-[760px]:justify-start">
              {!isAdmin &&
                problem.status === "ACTIVE" &&
                isGroupLeader &&
                currentGroupId &&
                (isSelected ? (
                  <Button onClick={handleClear} variant="danger">
                    Clear Selected Problem
                  </Button>
                ) : (
                  <Button onClick={handleSelect}>Select for Group</Button>
                ))}

              {isAdmin && (
                <>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                    <span className="text-xs font-bold tracking-[0.05em] text-muted uppercase">
                      Status
                    </span>
                    <Select
                      className="pr-8 pl-2 text-xs"
                      disabled={updateStatusMutation.isPending}
                      onChange={(event) => {
                        const newStatus = event.target.value as ProblemStatus;
                        if (
                          window.confirm(
                            `Are you sure you want to change the status to ${newStatus}?`,
                          )
                        ) {
                          updateStatusMutation.mutate(
                            { status: newStatus },
                            {
                              onError: (err) => {
                                alert(
                                  `Failed to update status: ${err.message}`,
                                );
                              },
                              onSuccess: () => {
                                alert("Status updated successfully!");
                              },
                            },
                          );
                        }
                      }}
                      shellClassName="h-9 rounded-lg bg-surface"
                      value={problem.status}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="ARCHIVED">Archived</option>
                    </Select>
                  </div>

                  {onEditClick && (
                    <Button onClick={onEditClick} variant="secondary">
                      Edit Problem
                    </Button>
                  )}
                  {problem.status === "PENDING_REVIEW" && onReviewClick && (
                    <Button onClick={onReviewClick}>Review Proposal</Button>
                  )}
                </>
              )}

              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            </div>
          </footer>
        </section>
      </div>
    </>
  );
}
