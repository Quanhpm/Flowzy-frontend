import { useProblem, useEvaluationCriteria } from "../hooks";
import {
  useSelectGroupProblem,
  useClearGroupProblem,
  useUpdateProblemStatus,
} from "../hooks/use-problem-mutations";
import { Button, LoadingState, Select } from "@/shared/components";
import type { EntityId, ProblemStatus } from "@/shared/types";
import { ProblemDifficultyBadge } from "./problem-difficulty-badge";
import { ProblemStatusBadge } from "./problem-status-badge";
import {
  X,
  ExternalLink,
  Award,
  Users,
  Compass,
  FileText,
  AlertTriangle,
} from "lucide-react";

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
  // Queries
  const { data: problemResponse, isLoading } = useProblem(problemId);
  const { data: criteriaResponse } = useEvaluationCriteria();

  // Mutations
  const selectProblemMutation = useSelectGroupProblem(currentGroupId || 0);
  const clearProblemMutation = useClearGroupProblem(currentGroupId || 0);
  const updateStatusMutation = useUpdateProblemStatus(problemId);

  const problem = problemResponse?.data;
  const criteria = criteriaResponse?.data || [];

  const isSelected = selectedProblemId && Number(selectedProblemId) === Number(problemId);

  const handleSelect = () => {
    if (!currentGroupId) return;
    selectProblemMutation.mutate(
      { problemId: Number(problemId) },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  const handleClear = () => {
    if (!currentGroupId) return;
    if (window.confirm("Are you sure you want to deselect this problem for your group?")) {
      clearProblemMutation.mutate(undefined, {
        onSuccess: () => onClose(),
      });
    }
  };

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
        <div className="w-[min(480px,100%)] rounded-2xl border border-border bg-surface p-6 shadow-modal text-center">
          <h3 className="text-red-500 font-bold mb-2">Error loading problem</h3>
          <p className="text-sm text-muted">Problem details could not be retrieved.</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-45 bg-[rgba(26,26,26,0.36)]" onClick={onClose} />
      
      <div className="fixed inset-y-6 right-6 z-50 flex w-[760px] max-w-[calc(100vw-48px)] flex-col rounded-2xl border border-border bg-surface shadow-modal overflow-hidden animate-in slide-in-from-right duration-250">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4.5 bg-surface-base">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <ProblemDifficultyBadge difficulty={problem.difficultyLevel} />
              <span className="text-xs font-mono font-bold text-muted bg-neutral-200/60 px-2 py-0.5 rounded">
                {problem.code || "PROPOSAL"}
              </span>
              <ProblemStatusBadge status={problem.status} size="sm" />
            </div>
            <h2 className="m-0 text-lg font-bold text-foreground leading-tight mt-1">
              {problem.title}
            </h2>
          </div>
          <Button
            variant="secondary"
            onClick={onClose}
            className="size-8 p-0 rounded-lg shrink-0 self-start"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left columns - Statement & Output */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  <FileText className="size-4 text-muted" />
                  Problem Statement
                </h3>
                <div className="text-sm leading-relaxed text-muted whitespace-pre-wrap border border-border/60 rounded-xl p-4 bg-neutral-50/20">
                  {problem.statement}
                </div>
              </div>

              {problem.expectedOutput && (
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    <Compass className="size-4 text-muted" />
                    Expected Deliverables / Output
                  </h3>
                  <div className="text-sm leading-relaxed text-muted border border-border/60 rounded-xl p-4 bg-neutral-50/20">
                    {problem.expectedOutput}
                  </div>
                </div>
              )}

              {/* Review Comments / Proposal Status */}
              {(problem.status === "REJECTED" || problem.reviewComment) && (
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-800">
                  <h4 className="m-0 font-bold flex items-center gap-1.5 text-red-700">
                    <AlertTriangle className="size-4 shrink-0" />
                    Review Feedback
                  </h4>
                  <p className="mt-1.5 mb-0 leading-relaxed font-semibold">
                    {problem.reviewComment || "Rejected by administrator with no additional comments."}
                  </p>
                  {problem.reviewedBy && (
                    <div className="mt-2 text-xs text-red-600/80">
                      Reviewed by {problem.reviewedBy.email}
                    </div>
                  )}
                </div>
              )}

              {/* Evaluation criteria section */}
              {criteria.length > 0 && (
                <div className="border-t border-border pt-5">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    <Award className="size-4 text-muted" />
                    Evaluation & Feasibility Rubric
                  </h3>
                  <div className="space-y-3.5">
                    {criteria.map((crit) => (
                      <div key={crit.id} className="text-xs border border-border/55 rounded-xl p-3 bg-surface shadow-sm">
                        <div className="flex items-center justify-between font-bold text-foreground">
                          <span>{crit.category} — {crit.code}</span>
                          <span className="text-brand-primary">Max: {crit.maxScore} pts</span>
                        </div>
                        <p className="m-0 mt-1 font-semibold text-muted leading-relaxed">
                          {crit.question}
                        </p>
                        {crit.suggestion && (
                          <p className="m-0 mt-1 text-muted-foreground/60 leading-normal italic">
                            Suggestion: {crit.suggestion}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Metadata panel */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-border p-4 bg-surface-base space-y-4 text-xs">
                <h4 className="m-0 font-bold text-foreground uppercase tracking-wider text-[11px] border-b border-border pb-2">
                  Specifications
                </h4>

                {problem.domain && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Domain</span>
                    <span className="font-bold text-foreground">{problem.domain.name} ({problem.domain.code})</span>
                  </div>
                )}

                {problem.ownerLab && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Owner Lab</span>
                    <span className="font-bold text-foreground">{problem.ownerLab}</span>
                  </div>
                )}

                {problem.suggestedCourses && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Suggested Courses</span>
                    <span className="font-bold text-foreground">{problem.suggestedCourses}</span>
                  </div>
                )}

                {problem.strategicTheme && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Strategic Theme</span>
                    <span className="font-bold text-foreground">{problem.strategicTheme}</span>
                  </div>
                )}

                {problem.researchArea && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Research Area</span>
                    <span className="font-bold text-foreground">{problem.researchArea}</span>
                  </div>
                )}

                {problem.driveFolderLink && (
                  <div className="pt-1.5">
                    <a
                      href={problem.driveFolderLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white border border-border px-3 py-2 text-xs font-bold text-brand-primary shadow-sm hover:bg-neutral-50 transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                      Drive Workspace Link
                    </a>
                  </div>
                )}
              </div>

              {/* Proposed by group info */}
              {problem.sourceType === "SELF_PROPOSED" && (problem.proposedByGroup || problem.proposedByStudent) && (
                <div className="rounded-2xl border border-border p-4 bg-surface-base space-y-3.5 text-xs">
                  <h4 className="m-0 font-bold text-foreground uppercase tracking-wider text-[11px] border-b border-border pb-2 flex items-center gap-1.5">
                    <Users className="size-4 text-muted" />
                    Proposer Information
                  </h4>

                  {problem.proposedByGroup && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Group Proposer</span>
                      <span className="font-bold text-foreground">{problem.proposedByGroup.groupNo} - {problem.proposedByGroup.name}</span>
                    </div>
                  )}

                  {problem.proposedByStudent && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Student Contact</span>
                      <span className="font-bold text-foreground">{problem.proposedByStudent.fullName} ({problem.proposedByStudent.studentCode})</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex justify-between items-center border-t border-border bg-surface-base px-6 py-4.5">
          <div className="text-xs text-muted-foreground">
            Created: {new Date(problem.createdAt).toLocaleDateString()}
          </div>

          <div className="flex gap-2">
            {/* Student actions */}
            {!isAdmin && problem.status === "ACTIVE" && isGroupLeader && currentGroupId && (
              <>
                {isSelected ? (
                  <Button
                    onClick={handleClear}
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                    variant="secondary"
                  >
                    Clear Selected Problem
                  </Button>
                ) : (
                  <Button onClick={handleSelect} className="rounded-lg">
                    Select for Group
                  </Button>
                )}
              </>
            )}

            {/* Admin actions */}
            {isAdmin && (
              <>
                {/* Status Quick Select */}
                <div className="flex items-center gap-2 border border-border p-1 px-3 rounded-xl bg-surface">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
                  <Select
                    value={problem.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as ProblemStatus;
                      if (window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
                        updateStatusMutation.mutate({ status: newStatus }, {
                          onSuccess: () => {
                            alert("Status updated successfully!");
                          },
                          onError: (err) => {
                            alert(`Failed to update status: ${err.message}`);
                          }
                        });
                      }
                    }}
                    className="h-8 py-0 px-2 text-xs"
                    disabled={updateStatusMutation.isPending}
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
                  <Button onClick={onEditClick} variant="secondary" className="rounded-lg">
                    Edit Problem
                  </Button>
                )}
                {problem.status === "PENDING_REVIEW" && onReviewClick && (
                  <Button onClick={onReviewClick} className="rounded-lg">
                    Review Proposal
                  </Button>
                )}
              </>
            )}

            <Button variant="secondary" onClick={onClose} className="rounded-lg">
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
