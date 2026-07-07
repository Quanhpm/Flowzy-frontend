/**
 * Flowzy design system color palette configuration.
 *
 * This file serves as the single source of truth for color constants.
 * 
 * 1. LIGHT_THEME: Defines the raw hexadecimal color strings.
 * 2. COLORS: Maps design tokens to CSS custom properties (variables),
 *    which enables seamless theme switching (e.g. Dark Mode) via CSS variables.
 */

export const LIGHT_THEME = {
  brandPrimary: "#0066FF",
  brandPrimaryHover: "#1A1F71",
  brandSecondary: "#6A00FF",
  surfaceWarm: "#eef3ff",
  background: "#F5F7FF",
  surface: "#ffffff",
  foreground: "#0B0F2B",
  border: "#dce6ff",
  borderWarm: "#c8d7ff",
  muted: "#52607f",
} as const;

export const COLORS = {
  brandPrimary: "var(--brand-primary)",
  brandPrimaryHover: "var(--brand-primary-hover)",
  brandSecondary: "var(--brand-secondary)",
  surfaceWarm: "var(--surface-warm)",
  background: "var(--background)",
  surface: "var(--surface)",
  foreground: "var(--foreground)",
  border: "var(--border)",
  borderWarm: "var(--border-warm)",
  muted: "var(--muted)",
} as const;

export type ThemeColors = typeof LIGHT_THEME;
export type ColorToken = keyof typeof COLORS;
