"use client";

import { useState } from "react";
import { cn } from "@/shared/lib";
import {
  Button,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import type { ProblemDifficulty, ProblemStatus, EntityId } from "@/shared/types";
import { useProblems, useProblem, useImportProblemBank } from "../hooks";
import { ProblemDifficultyBadge } from "./problem-difficulty-badge";
import { ProblemStatusBadge } from "./problem-status-badge";
import { ProblemFilters } from "./problem-filters";
import { ProblemDetailModal } from "./problem-detail-modal";
import { AdminProblemForm } from "./admin-problem-form";
import { ReviewProposalModal } from "./review-proposal-modal";
import { DomainManager } from "./domain-manager";
import { Plus, Compass, Library, Edit3, Upload } from "lucide-react";

export function AdminProblemsPage() {
  const [activeTab, setActiveTab] = useState<"problems" | "domains">("problems");

  // Filter states
  const [search, setSearch] = useState("");
  const [domainCode, setDomainCode] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  // Modals state
  const [selectedProblemId, setSelectedProblemId] = useState<EntityId | null>(null);
  
  // Creation/Edit modal
  const [activeEditProblemId, setActiveEditProblemId] = useState<EntityId | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Review modal
  const [activeReviewProblemId, setActiveReviewProblemId] = useState<EntityId | null>(null);
  const [activeReviewProblemTitle, setActiveReviewProblemTitle] = useState("");

  // Query problem list
  const problemsQuery = {
    search: search || undefined,
    domainCode: domainCode || undefined,
    difficulty: difficulty ? (difficulty as ProblemDifficulty) : undefined,
    status: status ? (status as ProblemStatus) : undefined,
    page,
    size: 10,
  };

  const { data: problemsResponse, isLoading: isProblemsLoading } = useProblems(problemsQuery);
  const problems = problemsResponse?.data;

  // Fetch full details of the problem being edited
  const { data: editProblemDetails } = useProblem(activeEditProblemId || 0);

  const importMutation = useImportProblemBank();

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "csv" && extension !== "xlsx") {
      alert("Invalid file format. Please upload a CSV or XLSX file.");
      return;
    }

    if (window.confirm(`Are you sure you want to import/update problem bank from ${file.name}?`)) {
      importMutation.mutate(file, {
        onSuccess: (response) => {
          const res = response.data;
          alert(
            `Import batch completed successfully!\n` +
            `- Total Rows: ${res.totalRows}\n` +
            `- Success Rows: ${res.successRows}\n` +
            `- Failed Rows: ${res.failedRows}`
          );
          e.target.value = "";
        },
        onError: (err) => {
          alert(`Import failed: ${err.message}`);
          e.target.value = "";
        },
      });
    } else {
      e.target.value = "";
    }
  };

  const handleOpenEdit = (id: EntityId) => {
    setSelectedProblemId(null);
    setActiveEditProblemId(id);
  };

  const handleOpenReview = (id: EntityId, title: string) => {
    setSelectedProblemId(null);
    setActiveReviewProblemId(id);
    setActiveReviewProblemTitle(title);
  };

  return (
    <div className="grid min-w-0 gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Problem Bank Administration"
          description="Manage graduation thesis topics, review student proposals, and edit problem domains."
        />

        {activeTab === "problems" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              id="problem-bank-import-input"
              accept=".csv, .xlsx"
              className="hidden"
              onChange={handleFileImport}
            />
            
            <Button
              variant="secondary"
              onClick={() => document.getElementById("problem-bank-import-input")?.click()}
              disabled={importMutation.isPending}
              size="md"
            >
              <Upload className="size-4 mr-1.5" />
              <span>{importMutation.isPending ? "Importing..." : "Import CSV/XLSX"}</span>
            </Button>

            <Button onClick={() => setIsCreating(true)} size="md">
              <Plus className="size-4 mr-1.5" />
              <span>Create Topic</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab("problems");
            setPage(0);
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-[2px] transition-all",
            activeTab === "problems"
              ? "border-brand-primary text-brand-primary font-extrabold"
              : "border-transparent text-muted hover:text-foreground"
          )}
        >
          <Compass className="size-4" />
          Thesis Topics List
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("domains")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 -mb-[2px] transition-all",
            activeTab === "domains"
              ? "border-brand-primary text-brand-primary font-extrabold"
              : "border-transparent text-muted hover:text-foreground"
          )}
        >
          <Library className="size-4" />
          Domain Manager
        </button>
      </div>

      {/* Tab details view */}
      {activeTab === "problems" ? (
        <div className="space-y-6">
          {/* Filters */}
          <ProblemFilters
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setPage(0);
            }}
            domainCode={domainCode}
            onDomainChange={(val) => {
              setDomainCode(val);
              setPage(0);
            }}
            difficulty={difficulty}
            onDifficultyChange={(val) => {
              setDifficulty(val);
              setPage(0);
            }}
            status={status}
            onStatusChange={(val) => {
              setStatus(val);
              setPage(0);
            }}
            showAdminFilters
          />

          {/* List content */}
          {isProblemsLoading ? (
            <LoadingState title="Loading topics..." />
          ) : problems?.content && problems.content.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-surface-base">
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Code</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground font-semibold">Title</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Domain</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Source</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {problems.content.map((prob) => (
                      <tr
                        key={prob.id}
                        onClick={() => setSelectedProblemId(prob.id)}
                        className="hover:bg-neutral-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-muted">
                          {prob.code || "PROPOSAL"}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-foreground max-w-xs truncate">
                          {prob.title}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {prob.domainCode}
                        </td>
                        <td className="px-5 py-3.5">
                          <ProblemDifficultyBadge difficulty={prob.difficultyLevel} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "text-xs font-bold uppercase tracking-wider",
                              prob.sourceType === "OFFICIAL" ? "text-blue-600" : "text-amber-600"
                            )}
                          >
                            {prob.sourceType === "OFFICIAL" ? "Official" : "Proposal"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <ProblemStatusBadge status={prob.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            {/* Review proposal */}
                            {prob.status === "PENDING_REVIEW" && (
                              <Button
                                size="sm"
                                onClick={() => handleOpenReview(prob.id, prob.title)}
                                className="h-8 text-xs px-2.5 rounded-lg"
                              >
                                Review
                              </Button>
                            )}

                            {/* Edit official problem */}
                            {prob.sourceType === "OFFICIAL" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleOpenEdit(prob.id)}
                                className="size-8 min-w-0 min-h-0 p-0 px-0 rounded-lg flex items-center justify-center"
                              >
                                <Edit3 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {problems.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted">
                    Page {problems.page + 1} of {problems.totalPages} ({problems.totalElements} topics)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={problems.page === 0}
                      onClick={() => setPage(problems.page - 1)}
                      variant="secondary"
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      disabled={problems.page >= problems.totalPages - 1}
                      onClick={() => setPage(problems.page + 1)}
                      variant="secondary"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState title="No topics found" description="Adjust your filters or click Create Topic above." />
          )}
        </div>
      ) : (
        /* Domains Manager */
        <DomainManager />
      )}

      {/* Detail Modal */}
      {selectedProblemId !== null && (
        <ProblemDetailModal
          problemId={selectedProblemId}
          onClose={() => setSelectedProblemId(null)}
          isAdmin={true}
          onEditClick={
            problems?.content.find((p) => p.id === selectedProblemId)?.sourceType === "OFFICIAL"
              ? () => handleOpenEdit(selectedProblemId)
              : undefined
          }
          onReviewClick={
            problems?.content.find((p) => p.id === selectedProblemId)?.status === "PENDING_REVIEW"
              ? () => {
                  const prob = problems.content.find((p) => p.id === selectedProblemId);
                  if (prob) handleOpenReview(prob.id, prob.title);
                }
              : undefined
          }
        />
      )}

      {/* Creation Modal */}
      {isCreating && (
        <AdminProblemForm
          onClose={() => setIsCreating(false)}
          onSuccess={() => alert("Official topic created successfully.")}
        />
      )}

      {/* Edit Modal */}
      {activeEditProblemId !== null && (
        <AdminProblemForm
          problemId={activeEditProblemId}
          initialValues={editProblemDetails?.data}
          onClose={() => setActiveEditProblemId(null)}
          onSuccess={() => alert("Thesis topic updated successfully.")}
        />
      )}

      {/* Review Proposal Modal */}
      {activeReviewProblemId !== null && (
        <ReviewProposalModal
          problemId={activeReviewProblemId}
          problemTitle={activeReviewProblemTitle}
          onClose={() => {
            setActiveReviewProblemId(null);
            setActiveReviewProblemTitle("");
          }}
          onSuccess={() => alert("Proposal review completed successfully.")}
        />
      )}
    </div>
  );
}
