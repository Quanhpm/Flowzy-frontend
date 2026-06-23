import { Inbox } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

import styles from "./state.module.css";

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
    <div className={cn(styles.state, className)} {...props}>
      <div className={styles.content}>
        <span className={styles.icon}>{icon}</span>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}
