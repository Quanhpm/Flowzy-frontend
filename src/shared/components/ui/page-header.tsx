import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PageHeader({
  actions,
  className,
  description,
  eyebrow,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex min-w-0 items-start justify-between gap-5 max-[760px]:grid",
        className,
      )}
      {...props}
    >
      <div className="grid min-w-0 gap-[7px]">
        {eyebrow && (
          <span className="text-xs font-bold tracking-[0.04em] text-brand-primary uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="m-0 text-[clamp(28px,3.2vw,36px)] leading-[1.2] font-bold tracking-normal text-foreground">
          {title}
        </h1>
        {description && (
          <p className="m-0 max-w-[720px] text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap justify-end gap-2.5 max-[760px]:justify-start">
          {actions}
        </div>
      )}
    </header>
  );
}
