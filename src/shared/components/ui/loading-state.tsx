import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib";

import styles from "./state.module.css";

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
    <div className={cn(styles.state, className)} role="status" {...props}>
      <div className={styles.content}>
        <span className={styles.spinner} />
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  );
}
