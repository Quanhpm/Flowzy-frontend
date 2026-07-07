import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  isFullWidth?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const baseClassName =
  "inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-transparent font-sans font-medium leading-none transition-[background,border-color,color,box-shadow,transform] duration-[160ms] ease-in-out focus-visible:outline-0 focus-visible:shadow-[0_0_0_4px_rgba(106,0,255,0.16)] disabled:cursor-not-allowed disabled:opacity-[0.58] [&:active:not(:disabled)]:scale-[0.98]";

const variantClassNames: Record<ButtonVariant, string> = {
  danger:
    "border-red-200 bg-red-50 text-red-700 [&:hover:not(:disabled)]:bg-red-100",
  ghost:
    "bg-transparent text-foreground [&:hover:not(:disabled)]:bg-background",
  primary:
    "bg-brand-primary text-white [&:hover:not(:disabled)]:bg-brand-primary-hover",
  secondary:
    "border-border bg-surface text-foreground [&:hover:not(:disabled)]:border-border-warm [&:hover:not(:disabled)]:bg-background",
};

const sizeClassNames: Record<ButtonSize, string> = {
  lg: "h-[50px] px-5 text-sm",
  md: "h-[42px] px-4 text-sm",
  sm: "h-9 px-3 text-[13px]",
};

export function Button({
  children,
  className,
  icon,
  isFullWidth = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        baseClassName,
        variantClassNames[variant],
        sizeClassNames[size],
        isFullWidth && "w-full",
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
