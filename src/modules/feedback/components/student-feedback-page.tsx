"use client";

import { FormEvent, useState } from "react";
import { MessageSquareText, Star, UserRoundCheck, X } from "lucide-react";

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
import { useDialogAccessibility } from "@/shared/hooks";
import { ApiError, cn } from "@/shared/lib";
import type { FeedbackStatus } from "@/shared/types";

import { useMyFeedback, useSubmitFeedback } from "../hooks";
import type { SubmitFeedbackRequest, TermFeedbackDto } from "../types";

const pageClassName = "grid min-w-0 gap-6";
const filterClassName =
  "grid grid-cols-[minmax(220px,1fr)_minmax(180px,220px)_auto] items-end gap-3 max-[760px]:grid-cols-[minmax(0,1fr)]";
const cardsClassName =
  "grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4";
const modalBackdropClassName =
  "fixed inset-0 z-40 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6 max-[680px]:p-3";
const modalClassName =
  "grid w-[min(620px,100%)] max-h-[calc(100svh-48px)] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal max-[680px]:max-h-[calc(100svh-24px)]";
const modalHeaderClassName =
  "flex items-start justify-between gap-4 border-b border-border px-6 py-5 max-[680px]:px-[18px]";
const modalBodyClassName =
  "grid gap-4 overflow-y-auto p-6 max-[680px]:px-[18px]";
const modalFooterClassName =
  "flex justify-end gap-2.5 border-t border-border px-6 py-4 max-[680px]:px-[18px]";
const errorClassName =
  "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700";

function getLoadErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Unable to load feedback requests. Please try again.";
}

function getSubmitErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Unable to save feedback. Please try again.";
}

function getTargetName(feedback: TermFeedbackDto) {
  if (feedback.targetType === "MENTOR") {
    return feedback.mentorName ?? "Assigned mentor";
  }

  return feedback.instructorName ?? "Assigned instructor";
}

function formatDateTime(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function RatingDisplay({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          className={cn(
            "text-border-warm",
            index < value && "fill-brand-secondary text-brand-secondary",
          )}
          key={index}
          size={17}
        />
      ))}
    </span>
  );
}

type FeedbackEditorModalProps = {
  feedback: TermFeedbackDto;
  onClose: () => void;
};

function FeedbackEditorModal({ feedback, onClose }: FeedbackEditorModalProps) {
  const dialogRef = useDialogAccessibility<HTMLFormElement>(onClose);
  const submitMutation = useSubmitFeedback();
  const [rating, setRating] = useState(
    feedback.rating ? String(feedback.rating) : "",
  );
  const [comment, setComment] = useState(feedback.comment ?? "");
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      setFormError("Choose a rating from 1 to 5.");
      return;
    }

    const payload: SubmitFeedbackRequest = {
      rating: numericRating,
      comment: comment.trim() || undefined,
    };

    try {
      await submitMutation.mutateAsync({ feedbackId: feedback.id, payload });
      onClose();
    } catch (error) {
      setFormError(getSubmitErrorMessage(error));
    }
  }

  return (
    <div className={modalBackdropClassName}>
      <form
        aria-label={`${feedback.status === "PENDING" ? "Submit" : "Update"} feedback`}
        aria-modal="true"
        className={modalClassName}
        onSubmit={handleSubmit}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className={modalHeaderClassName}>
          <div className="grid min-w-0 gap-1">
            <h2 className="m-0 text-xl font-bold text-foreground">
              {feedback.status === "PENDING" ? "Submit feedback" : "Update feedback"}
            </h2>
            <p className="m-0 text-sm text-muted">
              {getTargetName(feedback)} · {feedback.groupName}
            </p>
          </div>
          <Button
            aria-label="Close feedback form"
            icon={<X size={16} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        <div className={modalBodyClassName}>
          {formError && <div className={errorClassName}>{formError}</div>}

          <Select
            label="Rating"
            onChange={(event) => setRating(event.target.value)}
            required
            value={rating}
          >
            <option value="">Choose a rating</option>
            <option value="5">5 — Excellent</option>
            <option value="4">4 — Good</option>
            <option value="3">3 — Satisfactory</option>
            <option value="2">2 — Needs improvement</option>
            <option value="1">1 — Poor</option>
          </Select>

          <label className="grid min-w-0 gap-[7px]">
            <span className="flex items-center justify-between gap-3 text-[13px] font-medium text-foreground">
              Comment
              <span className="text-xs text-muted">{comment.length}/2000</span>
            </span>
            <textarea
              className="min-h-36 resize-y rounded-xl border border-border bg-surface px-3.5 py-3 font-sans text-sm leading-relaxed text-foreground outline-0 transition-[border-color,box-shadow] focus:border-brand-secondary focus:shadow-[0_0_0_4px_rgba(237,161,47,0.12)]"
              maxLength={2000}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share specific, constructive feedback (optional)."
              value={comment}
            />
          </label>
        </div>

        <footer className={modalFooterClassName}>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button disabled={submitMutation.isPending} type="submit">
            {submitMutation.isPending ? "Saving..." : "Save feedback"}
          </Button>
        </footer>
      </form>
    </div>
  );
}

function FeedbackCard({
  feedback,
  onEdit,
}: {
  feedback: TermFeedbackDto;
  onEdit: (feedback: TermFeedbackDto) => void;
}) {
  const submittedAt = formatDateTime(feedback.submittedAt);

  return (
    <Card className="grid content-start overflow-hidden">
      <CardHeader
        actions={
          <Badge tone={feedback.status === "SUBMITTED" ? "success" : "warning"}>
            {feedback.status}
          </Badge>
        }
        description={`${feedback.targetType} · ${feedback.academicTermCode}`}
        title={getTargetName(feedback)}
      />
      <CardContent className="grid gap-4">
        <div className="grid gap-1 text-sm">
          <span className="font-medium text-foreground">{feedback.groupName}</span>
          <span className="text-muted">
            Term status: {feedback.academicTermStatus}
          </span>
        </div>

        {feedback.status === "SUBMITTED" && feedback.rating ? (
          <div className="grid gap-2 rounded-xl border border-border bg-background p-4">
            <RatingDisplay value={feedback.rating} />
            <p className="m-0 text-sm leading-relaxed text-foreground">
              {feedback.comment || "No comment provided."}
            </p>
            {submittedAt && (
              <span className="text-xs text-muted">Submitted {submittedAt}</span>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm leading-relaxed text-muted">
            This feedback has not been submitted yet.
          </div>
        )}

        <Button
          icon={<MessageSquareText size={16} />}
          onClick={() => onEdit(feedback)}
          variant={feedback.status === "SUBMITTED" ? "secondary" : "primary"}
        >
          {feedback.status === "SUBMITTED" ? "Update feedback" : "Submit feedback"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function StudentFeedbackPage() {
  const [termInput, setTermInput] = useState("");
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState<"" | FeedbackStatus>("");
  const [selectedFeedback, setSelectedFeedback] =
    useState<TermFeedbackDto | null>(null);

  const feedbackQuery = useMyFeedback({
    term: term || undefined,
    status: status || undefined,
  });
  const feedbackItems = feedbackQuery.data?.data ?? [];

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTerm(termInput.trim());
  }

  return (
    <div className={pageClassName}>
      <PageHeader
        description="Review end-of-term requests and share constructive feedback with your assigned mentor or instructor."
        eyebrow="Student"
        title="Feedback"
      />

      <Card>
        <CardContent>
          <form className={filterClassName} onSubmit={handleFilter}>
            <TextInput
              label="Academic term"
              onChange={(event) => setTermInput(event.target.value)}
              placeholder="FALL2026"
              value={termInput}
            />
            <Select
              label="Status"
              onChange={(event) =>
                setStatus(event.target.value as "" | FeedbackStatus)
              }
              value={status}
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SUBMITTED">Submitted</option>
            </Select>
            <Button type="submit">Apply filters</Button>
          </form>
        </CardContent>
      </Card>

      {feedbackQuery.isLoading ? (
        <LoadingState
          description="Loading feedback requests for your account."
          title="Loading feedback"
        />
      ) : feedbackQuery.isError ? (
        <EmptyState
          description={getLoadErrorMessage(feedbackQuery.error)}
          icon={<MessageSquareText size={22} />}
          title="Feedback unavailable"
        />
      ) : feedbackItems.length === 0 ? (
        <EmptyState
          description="No feedback requests match the selected term and status."
          icon={<UserRoundCheck size={22} />}
          title="No feedback requests"
        />
      ) : (
        <div className={cardsClassName}>
          {feedbackItems.map((feedback) => (
            <FeedbackCard
              feedback={feedback}
              key={feedback.id}
              onEdit={setSelectedFeedback}
            />
          ))}
        </div>
      )}

      {selectedFeedback && (
        <FeedbackEditorModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
}
