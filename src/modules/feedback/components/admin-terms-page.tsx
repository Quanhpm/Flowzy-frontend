"use client";

import { useState } from "react";
import { LockKeyhole, X } from "lucide-react";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import { ApiError, cn } from "@/shared/lib";

import { useAcademicTerms, useCloseAcademicTerm } from "../hooks";
import type { AcademicTermResponseDto } from "../types";
import { useDialogAccessibility } from "./use-dialog-accessibility";

const pageClassName = "grid min-w-0 gap-6";
const tableWrapClassName = "w-full overflow-x-auto";
const tableClassName = "w-full min-w-[900px] border-collapse";
const tableHeadCellClassName =
  "border-b border-border px-4 py-3 text-left text-xs font-bold tracking-[0.04em] text-muted uppercase";
const tableCellClassName =
  "border-b border-border px-4 py-4 align-middle text-sm text-foreground";
const modalBackdropClassName =
  "fixed inset-0 z-40 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6 max-[680px]:p-3";
const modalClassName =
  "grid w-[min(510px,100%)] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal";
const modalHeaderClassName =
  "flex items-start justify-between gap-4 border-b border-border px-6 py-5 max-[680px]:px-[18px]";
const modalFooterClassName =
  "flex justify-end gap-2.5 border-t border-border px-6 py-4 max-[680px]:px-[18px]";

function getLoadErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Unable to load academic terms. Please try again.";
}

function getCloseErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Unable to complete this action. Please try again.";
}

function formatDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getFeedbackProgress(term: AcademicTermResponseDto) {
  if (!term.totalExpectedFeedbacks) return 0;
  return Math.round(
    (term.totalSubmittedFeedbacks / term.totalExpectedFeedbacks) * 100,
  );
}

type CloseTermModalProps = {
  onClose: () => void;
  term: AcademicTermResponseDto;
};

function CloseTermModal({ onClose, term }: CloseTermModalProps) {
  const dialogRef = useDialogAccessibility<HTMLDivElement>(onClose);
  const closeTermMutation = useCloseAcademicTerm();
  const [error, setError] = useState("");

  async function handleClose() {
    setError("");

    try {
      await closeTermMutation.mutateAsync(term.code);
      onClose();
    } catch (mutationError) {
      setError(getCloseErrorMessage(mutationError));
    }
  }

  return (
    <div className={modalBackdropClassName}>
      <div
        aria-label={`Close ${term.code}`}
        aria-modal="true"
        className={modalClassName}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className={modalHeaderClassName}>
          <div className="grid gap-1">
            <h2 className="m-0 text-xl font-bold text-foreground">Close academic term</h2>
            <p className="m-0 text-sm leading-relaxed text-muted">
              Close {term.code} and finalize the current term snapshot.
            </p>
          </div>
          <Button
            aria-label="Close confirmation dialog"
            icon={<X size={16} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>
        <div className="grid gap-3 px-6 py-5 text-sm leading-relaxed text-foreground max-[680px]:px-[18px]">
          <p className="m-0">
            This action closes the term. It cannot be undone from the frontend.
          </p>
          <div className="rounded-xl border border-border bg-background p-4">
            <span className="block text-xs font-bold text-muted uppercase">Feedback progress</span>
            <strong className="mt-1 block text-lg text-foreground">
              {term.totalSubmittedFeedbacks}/{term.totalExpectedFeedbacks} submitted
            </strong>
          </div>
          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
        </div>
        <footer className={modalFooterClassName}>
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button
            disabled={closeTermMutation.isPending}
            icon={<LockKeyhole size={16} />}
            onClick={handleClose}
            variant="danger"
          >
            {closeTermMutation.isPending ? "Closing..." : "Close term"}
          </Button>
        </footer>
      </div>
    </div>
  );
}

export function AdminTermsPage() {
  const termsQuery = useAcademicTerms();
  const [termToClose, setTermToClose] = useState<AcademicTermResponseDto | null>(null);
  const terms = termsQuery.data?.data ?? [];

  return (
    <div className={pageClassName}>
      <PageHeader
        description="Review term-level feedback progress and close a term when its academic cycle is complete."
        eyebrow="Admin"
        title="Academic terms"
      />

      {termsQuery.isLoading ? (
        <LoadingState title="Loading academic terms" />
      ) : termsQuery.isError ? (
        <EmptyState
          description={getLoadErrorMessage(termsQuery.error)}
          title="Terms unavailable"
        />
      ) : terms.length === 0 ? (
        <EmptyState
          description="No academic terms have been returned by the backend."
          title="No terms"
        />
      ) : (
        <Card>
          <div className={tableWrapClassName}>
            <table className={tableClassName}>
              <thead>
                <tr>
                  <th className={tableHeadCellClassName}>Term</th>
                  <th className={tableHeadCellClassName}>Groups</th>
                  <th className={tableHeadCellClassName}>Feedback progress</th>
                  <th className={tableHeadCellClassName}>Closed by</th>
                  <th className={tableHeadCellClassName}>Status</th>
                  <th className={tableHeadCellClassName} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => {
                  const progress = getFeedbackProgress(term);

                  return (
                    <tr key={term.id}>
                      <td className={tableCellClassName}>
                        <span className="font-bold">{term.code}</span>
                      </td>
                      <td className={tableCellClassName}>{term.groupCount}</td>
                      <td className={tableCellClassName}>
                        <div className="grid min-w-[180px] gap-1.5">
                          <div className="flex justify-between gap-3 text-xs text-muted">
                            <span>{term.totalSubmittedFeedbacks}/{term.totalExpectedFeedbacks} submitted</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-background">
                            <div
                              className="h-full rounded-full bg-brand-primary"
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={cn(tableCellClassName, "text-muted")}>
                        <div className="grid gap-1">
                          <span>{term.closedByEmail ?? "-"}</span>
                          <span className="text-xs">{formatDateTime(term.closedAt)}</span>
                        </div>
                      </td>
                      <td className={tableCellClassName}>
                        <Badge tone={term.status === "OPEN" ? "success" : "neutral"}>
                          {term.status}
                        </Badge>
                      </td>
                      <td className={tableCellClassName}>
                        {term.status === "OPEN" ? (
                          <Button
                            icon={<LockKeyhole size={15} />}
                            onClick={() => setTermToClose(term)}
                            size="sm"
                            variant="danger"
                          >
                            Close term
                          </Button>
                        ) : (
                          <span className="text-sm text-muted">Closed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {termToClose && (
        <CloseTermModal onClose={() => setTermToClose(null)} term={termToClose} />
      )}
    </div>
  );
}
