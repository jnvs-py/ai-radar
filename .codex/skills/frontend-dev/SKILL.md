---
name: frontend-dev
description: >
  Frontend development governance for AI Radar. Use when editing or creating
  UI code to ensure proper state management, responsive design, accessibility,
  and clean console output.
---

# Frontend Development Governance

## Mandatory Controls

### 1. Real data or declared fixtures
No hardcoded inline data. Use `fixtures/signals.json` or Supabase API.

### 2. State management
All views must handle: loading, empty, error, success states.
Use `renderComponent()` from `js/state.js`.

### 3. Responsive design
Mobile-first CSS. Breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 4. Accessibility (WCAG 2.1 AA)
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`)
- All images have alt text
- Color contrast ratio ≥ 4.5:1
- Focus indicators visible
- `aria-label` on interactive elements
- `prefers-reduced-motion` respected

### 5. Clean console
- 0 errors, 0 warnings
- Only `[AI-RADAR]` prefixed info logs allowed

### 6. Testing
Validate against `fixtures/signals.json` contract before claiming completion.
