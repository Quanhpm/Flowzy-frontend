import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

import styles from "./badge.module.css";

type BadgeTone = "neutral" | "brand" | "warning" | "success" | "danger";
type BadgeSize = "sm" | "md";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  icon?: ReactNode;
  size?: BadgeSize;
  tone?: BadgeTone;
};

export function Badge({
  children,
  className,
  icon,
  size = "md",
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, styles[tone], styles[size], className)}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
