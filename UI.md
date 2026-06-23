# F-Spark UI & Design Guidelines

This document defines the unified UI rules, color palette, typography settings, and CSS guidelines for the F-Spark project. All current and future pages must strictly follow these rules to maintain a simple, elegant, and consistent aesthetic.

---

## 1. Color System

We use a curated, warm neutral palette balanced with high-contrast, premium brand colors. Avoid generic primary colors (e.g., solid blue, red, green).

| Token Name | Hex Code | Visual | Usage Guideline |
| :--- | :--- | :--- | :--- |
| `brand-primary` | `#F05423` | ![#F05423](https://via.placeholder.com/15/F05423/000000?text=+) | Main action buttons, active badges, brand marks, and key interactive element states. |
| `brand-secondary`| `#EDA12F` | ![#EDA12F](https://via.placeholder.com/15/EDA12F/000000?text=+) | Highlight states, secondary badges (e.g., "In Progress"), borders on focused inputs, progress bars. |
| `surface-warm` | `#f5ebdc` | ![#f5ebdc](https://via.placeholder.com/15/f5ebdc/000000?text=+) | Sidebars/showcase background panels, warm card borders, secondary container surfaces. |
| `background` | `#F5F5F5` | ![#F5F5F5](https://via.placeholder.com/15/F5F5F5/000000?text=+) | Main page background. Prevents visual fatigue compared to pure white. |
| `surface` | `#ffffff` | ![#ffffff](https://via.placeholder.com/15/ffffff/000000?text=+) | Cards, modal sheets, dropdowns, input fields. |
| `foreground` | `#1a1a1a` | ![#1a1a1a](https://via.placeholder.com/15/1a1a1a/000000?text=+) | Primary headings, body copy, and active text elements. |
| `border` | `#e2e8f0` | ![#e2e8f0](https://via.placeholder.com/15/e2e8f0/000000?text=+) | Standard divider lines and default input/card borders. |
| `border-warm` | `#e6dacb` | ![#e6dacb](https://via.placeholder.com/15/e6dacb/000000?text=+) | Borders for cards or blocks sitting on warm-beige backgrounds. |
| `muted` | `#737373` | ![#737373](https://via.placeholder.com/15/737373/000000?text=+) | Descriptions, labels, icons, metadata, and placeholder text. |

### Global CSS CSS Custom Properties
```css
:root {
  --background: #F5F5F5;
  --foreground: #1a1a1a;
  --surface: #ffffff;
  --surface-warm: #f5ebdc;
  --border: #e2e8f0;
  --border-warm: #e6dacb;
  --muted: #737373;
  --brand-primary: #F05423;
  --brand-secondary: #EDA12F;
  --brand: var(--brand-primary);
}
```

---

## 2. Typography

The sole font family for the project is **Roboto**. This font must be loaded in the root layout and configured with the exact weights below:

- **Font Family**: `Roboto, sans-serif`
- **Loaded Weights**:
  - `300` (Light): Subtitles, helper text, and secondary stats.
  - `400` (Regular / Normal): Standard paragraph body text, form labels.
  - `500` (Medium): UI elements, buttons, column titles, table headers.
  - `700` (Bold): Headings (h1, h2, h3, h4) and important callouts.
- **Italic Style**: Available and loaded for weight `400` only. Use italic style sparingly (e.g., empty state instructions, notes, quotes).

### Typography Scale Guidelines
- **Page Headings (h1)**: Size `clamp(28px, 3.2vw, 36px)`, Weight `700`, line-height `1.2`.
- **Section Headings (h2)**: Size `24px` - `26px`, Weight `700`, line-height `1.3`.
- **Card/Subsection Titles**: Size `16px` - `18px`, Weight `500` or `700`.
- **Body Text**: Size `14px` - `15px`, Weight `400`, line-height `1.6`.
- **Captions/Labels**: Size `11px` - `12px`, Weight `500` or `700` (uppercase when styling headers).

---

## 3. Layout & Layout Structures

To achieve a **simple and elegant** look, avoid cluttered color sections. Follow these layout structures:

1. **Containers**: Use a maximum border-radius of `16px` for cards and major modules, and `12px` for smaller UI widgets (like buttons, input fields, badges).
2. **Borders and Lines**: Card borders should be thin (`1px`) and use soft colors:
   - On `#F5F5F5` background, use card border: `1px solid var(--border)` (`#e2e8f0`).
   - On `#f5ebdc` background, use card border: `1px solid var(--border-warm)` (`#e6dacb`).
3. **Card Shadows**: Do not use heavy black shadows. Use soft, transparent shadows for depth:
   - Standard: `box-shadow: 0 10px 30px rgba(26, 26, 26, 0.03);`
   - Interactive: `box-shadow: 0 20px 45px rgba(26, 26, 26, 0.04);`
4. **Spacing Consistency**:
   - Inside cards: `padding: 24px` to `40px` depending on screen size.
   - Grid gap: `12px` to `24px` for structural components.

---

## 4. Components Style Rules

### Buttons
- **Primary Action Button**:
  - Background: `var(--brand-primary)` (`#F05423`).
  - Text Color: `#ffffff` (White).
  - Hover: Background `#d84315` (slightly darker warm orange).
  - Shape: Border radius `12px`.
  - Font weight: `500` (Medium).
- **Secondary Action Button (Outline/Text)**:
  - Background: `transparent` or `var(--surface)`.
  - Border: `1px solid var(--border)`.
  - Hover: Background `var(--background)`.
  - Text Color: `var(--foreground)`.

### Form Fields (Inputs)
- **Container**: Height `50px` - `52px` with a border radius of `12px`, border `1px solid var(--border)`.
- **Focus State**: On focus, the border must change to `var(--brand-secondary)` (`#EDA12F`) with a soft glow `box-shadow: 0 0 0 4px rgba(237, 161, 47, 0.12)`.
- **Placeholder**: Use a light gray `#a3a3a3` for input placeholders.

---

## 5. UI Philosophy: "Simple & Elegant"

- **Less is More**: Eliminate multi-colored indicators (e.g. mix of purple, indigo, blue, green). Standardize on `brand-primary` and `brand-secondary` for color accents.
- **White Space**: Provide ample padding and line height to let text breathe. Avoid cramming information.
- **Micro-interactions**: Use transitions (`150ms` to `200ms` with ease curve) for hover states on buttons, cards, and text links to make the app feel tactile and premium.
