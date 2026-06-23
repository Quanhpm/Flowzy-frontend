/**
 * F-Spark design system color palette configuration.
 *
 * This file serves as the single source of truth for color constants.
 * 
 * 1. LIGHT_THEME: Defines the raw hexadecimal color strings.
 * 2. COLORS: Maps design tokens to CSS custom properties (variables),
 *    which enables seamless theme switching (e.g. Dark Mode) via CSS variables.
 */

export const LIGHT_THEME = {
  brandPrimary: "#F05423",
  brandPrimaryHover: "#d84315",
  brandSecondary: "#EDA12F",
  surfaceWarm: "#f5ebdc",
  background: "#F5F5F5",
  surface: "#ffffff",
  foreground: "#1a1a1a",
  border: "#e2e8f0",
  borderWarm: "#e6dacb",
  muted: "#737373",
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
