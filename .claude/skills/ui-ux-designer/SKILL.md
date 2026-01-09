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

### Dashboard-Specific Components (NEW: For Todo App UI)

- Sidebar:
  - Collapsible: Toggle button to collapse/expand (use icons for collapse state)
  - Layout: Vertical stack
  - Top: Logo (using Primary color accent, Space Grotesk font if text-based)
  - Middle: Navigation links (Dashboard, Tasks, Projects, Calendar) – Use Secondary color text, hover with Primary highlight, Medium padding between links
  - Bottom: Logout button (use Secondary Button style)
  - Background: Tertiary
  - Width: Fixed (e.g., 250px expanded, 80px collapsed)
  - Border: Right border 1px solid Secondary for separation
  - Radius: None on sidebar itself, but adjacent body has Medium radius for visual separation

- Dashboard Body:
  - Layout: Flex column
  - Top Header: Welcome {name} (Space Grotesk heading, Secondary text) on left, Notification icon (bell icon in Primary color) on right
  - Main Content: Input boxes/forms with Medium radius, Primary background for highlights, Large padding
  - Separation: Apply Medium border radius to the entire body container to create a "curved" separation look from sidebar (e.g., border-top-left-radius and border-bottom-left-radius: 0 if adjacent to sidebar)
  - Background: Neutral Background
  - Padding: Large overall, Medium for internal elements
  - Responsiveness: On mobile, sidebar collapses by default; body takes full width

- Input Boxes:
  - Background: Tertiary
  - Border: 1px solid Secondary
  - Radius: Medium
  - Padding: Medium
  - Focus: Primary color border
  - Labels: Roboto font, above inputs with Small spacing

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
