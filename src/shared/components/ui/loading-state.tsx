import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib";

type LoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  description?: string;
  title?: string;
};

export function LoadingState({
  className,
  description,
  title = "Loading",
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "grid min-h-60 place-items-center rounded-xl border border-border bg-surface p-8 text-center",
        className,
      )}
      role="status"
      {...props}
    >
      <div className="grid max-w-[420px] justify-items-center gap-2.5">
        <span className="size-[30px] animate-spin rounded-full border-[3px] border-[#c8d7ff] border-t-brand-primary" />
        <h2 className="m-0 text-lg leading-[1.3] font-bold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="m-0 text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
