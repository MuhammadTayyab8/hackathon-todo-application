---
name: ui-ux-designer
description:
  Create distinctive, production-grade UI/UX designs with strict adherence
  to a predefined design system. Use this skill when designing or implementing
  UI elements such as landing pages, navigation bars, buttons, cards, sections,
  dashboards, or complete frontend interfaces. All output must follow the
  provided theme tokens exactly and avoid generic or default AI aesthetics.
---

## Design Mandate (NON-NEGOTIABLE)

This skill enforces a **single, cohesive visual identity**.
Deviation from the defined theme is NOT allowed unless explicitly requested.

- Do NOT invent new colors, fonts, spacing, or radius values
- Do NOT use default component styles
- Do NOT introduce unapproved typography
- Do NOT fall back to generic UI patterns

Every UI decision must map back to the Theme section below.

---

## Theme (SOURCE OF TRUTH)

### Typography
- Primary Font: Space Grotesk
- Secondary Font: Roboto
- Tertiary Font: Serif (for accents only, not body text)

Rules:
- Headings: Space Grotesk only
- Body text: Roboto only
- Decorative or emphasis text: Serif (sparingly)

---

### Colors
- Primary: #B9FF66
- Secondary: #191A23
- Tertiary: #F3F3F3
- Neutral Background: #F9FAFB

Rules:
- Primary is used for highlights, cards, and sections
- Secondary is used for text, buttons, and dark surfaces
- Tertiary is used for light sections and contrast areas
- Never introduce additional colors

---

### Border Radius
- Small: 8px
- Medium: 12px
- Large: 18px

Rules:
- Buttons → Medium
- Cards → Medium
- Sections → Large
- Small radius only for internal elements (tags, chips)

---

### Spacing System
- Small: 8px
- Medium: 16px
- Large: 24px

Rules:
- Use spacing tokens only
- No arbitrary margins or paddings
- Sections must never touch viewport edges

---

## Component Rules (STRICT)

### Buttons
- Primary Button:
  - Background: Secondary color
  - Text: White
  - Radius: Medium
  - Padding: Medium (vertical) + Large (horizontal)

- Secondary Button:
  - Background: Transparent
  - Border: 1px solid Secondary
  - Text: Secondary color
  - Radius: Medium

---

### Cards
- Background: Primary color
- Padding: Medium
- Layout: Flex (text + image or icon)
- Text Color: Secondary (high contrast)
- Highlight: Use a contrasting accent derived from theme colors
- Action Button:
  - Positioned bottom-left
  - Uses Primary Button style
- Border Radius: Medium

---

### Sections
- Background: Primary or Tertiary only
- Margin: Large (horizontal and vertical)
- Padding: Large
- Border Radius: Large
- Sections must visually “float” and never stick to screen edges

---

### Navbar
- Layout:
  - Logo aligned left
  - Navigation links aligned center or right
- Navigation:
  - Features link must scroll to Features section
- Actions:
  - Two secondary buttons: Login, Signup
- Background: Tertiary or transparent over neutral background

---

### Footer
- Background: Secondary color
- Text: Tertiary color
- Layout mirrors Navbar
- Includes social links
- Clearly separated from main content using spacing and contrast

---

## Aesthetic Direction

- Modern
- High-contrast
- Editorial-tech hybrid
- Clean but bold
- No gradients unless explicitly derived from theme colors
- No glassmorphism
- No default Tailwind look

---

## Implementation Rules

- Use real, working production code (React / Next.js / Tailwind or CSS)
- Use CSS variables or Tailwind config to encode theme tokens
- Components must be reusable and consistent
- Visual hierarchy must be intentional and obvious

If any instruction conflicts with this theme, the theme takes priority.
