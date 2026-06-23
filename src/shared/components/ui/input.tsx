import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

import styles from "./input.module.css";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  hint?: string;
  icon?: ReactNode;
  label?: string;
  shellClassName?: string;
};

export function TextInput({
  className,
  error,
  hint,
  icon,
  id,
  label,
  shellClassName,
  ...props
}: TextInputProps) {
  return (
    <label className={styles.field} htmlFor={id}>
      {(label || hint) && (
        <span className={styles.labelRow}>
          {label && <span className={styles.label}>{label}</span>}
          {hint && <span className={styles.hint}>{hint}</span>}
        </span>
      )}
      <span
        className={cn(styles.inputShell, shellClassName)}
        data-invalid={Boolean(error)}
      >
        {icon}
        <input className={cn(styles.input, className)} id={id} {...props} />
      </span>
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
