"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { X } from "lucide-react";

import { useDialogAccessibility } from "@/shared/hooks";
import { cn } from "@/shared/lib";

import { Button } from "./button";

export type ResponsiveDialogProps = {
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  description?: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
  mobileMode?: "fullscreen" | "sheet";
  onClose: () => void;
  title: ReactNode;
};

export function ResponsiveDialog({
  bodyClassName,
  children,
  className,
  closeLabel = "Close dialog",
  closeOnBackdrop = true,
  closeOnEscape = true,
  description,
  footer,
  footerClassName,
  mobileMode = "sheet",
  onClose,
  title,
}: ResponsiveDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useDialogAccessibility<HTMLElement>(onClose, {
    closeOnEscape,
  });

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex min-w-0 items-end justify-center overflow-hidden bg-foreground/30 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm min-[481px]:items-center min-[481px]:p-4",
        mobileMode === "fullscreen" &&
          "max-[760px]:items-stretch max-[760px]:p-0",
      )}
    >
      {closeOnBackdrop ? (
        <button
          aria-label={closeLabel}
          className="absolute inset-0 size-full cursor-default border-0 bg-transparent"
          onClick={onClose}
          tabIndex={-1}
          type="button"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0" />
      )}

      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "relative flex max-h-[calc(100dvh-env(safe-area-inset-top))] w-full min-w-0 flex-col overflow-hidden border border-border bg-surface shadow-modal min-[481px]:max-h-[calc(100dvh-2rem)] min-[481px]:max-w-[640px] min-[481px]:rounded-2xl",
          mobileMode === "sheet" && "rounded-t-2xl border-b-0",
          mobileMode === "fullscreen" &&
            "h-dvh max-h-dvh rounded-none border-y-0 max-[760px]:max-w-none min-[761px]:h-auto min-[761px]:max-h-[calc(100dvh-2rem)] min-[761px]:rounded-2xl min-[761px]:border-y",
          className,
        )}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 min-[481px]:gap-4 min-[481px]:px-6 min-[481px]:py-5">
          <div className="grid min-w-0 gap-1">
            <h2
              className="m-0 break-words text-lg leading-tight font-bold text-foreground min-[481px]:text-xl"
              id={titleId}
            >
              {title}
            </h2>
            {description && (
              <div
                className="break-words text-sm leading-relaxed text-muted"
                id={descriptionId}
              >
                {description}
              </div>
            )}
          </div>
          <Button
            aria-label={closeLabel}
            className="size-11 shrink-0 px-0"
            icon={<X size={18} />}
            onClick={onClose}
            variant="ghost"
          >
            <span className="sr-only">{closeLabel}</span>
          </Button>
        </header>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 min-[481px]:px-6 min-[481px]:py-5",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer && (
          <footer
            className={cn(
              "flex shrink-0 flex-col-reverse gap-2 border-t border-border px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] [&>button]:w-full min-[481px]:flex-row min-[481px]:justify-end min-[481px]:gap-2.5 min-[481px]:px-6 min-[481px]:py-4 min-[481px]:[&>button]:w-auto",
              footerClassName,
            )}
          >
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
