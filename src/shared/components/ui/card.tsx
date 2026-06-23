import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

import styles from "./card.module.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  isPadded?: boolean;
};

type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
  description?: string;
  title: string;
};

export function Card({
  children,
  className,
  isPadded = false,
  ...props
}: CardProps) {
  return (
    <section
      className={cn(styles.card, isPadded && styles.padded, className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  actions,
  className,
  description,
  title,
  ...props
}: CardHeaderProps) {
  return (
    <header className={cn(styles.header, className)} {...props}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions}
    </header>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(styles.content, className)} {...props}>
      {children}
    </div>
  );
}
