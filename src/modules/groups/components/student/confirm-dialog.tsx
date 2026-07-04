"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/shared/components";
import { ApiError } from "@/shared/lib";

type ConfirmDialogProps = {
  children?: ReactNode;
  confirmLabel: string;
  description: string;
  onClose: () => void;
  onConfirm: () => Promise<unknown>;
  title: string;
  tone?: "default" | "danger";
};

function getErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

export function ConfirmDialog({
  children,
  confirmLabel,
  description,
  onClose,
  onConfirm,
  title,
  tone = "default",
}: ConfirmDialogProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setError("");
    setIsSubmitting(true);

    try {
      await onConfirm();
      onClose();
    } catch (confirmError) {
      setError(getErrorMessage(confirmError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="w-[min(520px,100%)] overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="grid gap-1">
            <h2 className="m-0 text-lg font-bold text-foreground">{title}</h2>
            <p className="m-0 text-sm leading-relaxed text-muted">
              {description}
            </p>
          </div>
          <Button
            aria-label="Close dialog"
            icon={<X size={16} />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        <div className="grid gap-4 px-6 py-5">
          {children}
          {error && (
            <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleConfirm}
            variant={tone === "danger" ? "danger" : "primary"}
          >
            {isSubmitting ? "Working..." : confirmLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
