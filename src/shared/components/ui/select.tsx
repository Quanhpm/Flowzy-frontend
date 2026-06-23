import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/shared/lib";

import styles from "./select.module.css";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  shellClassName?: string;
};

export function Select({
  children,
  className,
  id,
  label,
  shellClassName,
  ...props
}: SelectProps) {
  return (
    <label className={styles.field} htmlFor={id}>
      {label && <span className={styles.label}>{label}</span>}
      <span className={cn(styles.selectShell, shellClassName)}>
        <select className={cn(styles.select, className)} id={id} {...props}>
          {children}
        </select>
        <ChevronDown className={styles.chevron} size={16} />
      </span>
    </label>
  );
}
