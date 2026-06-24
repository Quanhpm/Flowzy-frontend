import { Inbox } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
  description?: string;
  icon?: ReactNode;
  title: string;
};

export function EmptyState({
  actions,
  className,
  description,
  icon = <Inbox size={22} />,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid min-h-60 place-items-center rounded-xl border border-border bg-surface p-8 text-center",
        className,
      )}
      {...props}
    >
      <div className="grid max-w-[420px] justify-items-center gap-2.5">
        <span className="grid size-12 place-items-center rounded-full bg-surface-warm text-brand-primary">
          {icon}
        </span>
        <h2 className="m-0 text-lg leading-[1.3] font-bold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="m-0 text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
        {actions && (
          <div className="mt-1 flex flex-wrap justify-center gap-2.5">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
