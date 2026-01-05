# Tasks: Landing Page Design

**Input**: Design documents from `specs/002-landing-page-design/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 16+ project with TypeScript and Tailwind CSS in `frontend/`
- [x] T002 [P] Configure `frontend/tailwind.config.ts` with brand theme tokens (colors, spacing, radius)
- [x] T003 Set up Global CSS with `scrollbar-gutter: stable` and layout shift prevention in `frontend/app/globals.css`
- [x] T004 Create base `RootLayout` with metadata set independently for SEO in `frontend/app/layout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create reusable `Button` component in `frontend/components/ui/Button.tsx`
- [x] T006 [P] Create reusable `Container` component in `frontend/components/ui/Container.tsx`
- [x] T007 [P] Create static data for features list in `frontend/lib/constants.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Discover Value [US1] (Priority: P1) 🎯 MVP

**Goal**: Communicate the value proposition through the main sections of the landing page.

**Independent Test**: Visit the root URL and verify Hero, Features, CTA, and Footer are visible.

### Implementation for User Story 1

- [x] T008 [US1] Implement Hero section with LCP optimized image in `frontend/components/landing/Hero.tsx`
- [x] T009 [US1] Implement Features section with 6 feature cards grid in `frontend/components/landing/Features.tsx`
- [x] T010 [US1] Implement Banner / Call-to-Action section in `frontend/components/landing/CTASection.tsx`
- [x] T011 [US1] Implement Footer section with sitemap links in `frontend/components/landing/Footer.tsx`
- [x] T012 [US1] Assemble main landing page content in `frontend/app/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Navigate to App [US2] (Priority: P2)

**Goal**: Provide functional navigation for existing and new users.

**Independent Test**: Click "Login" or "Sign Up" and verify they link to the correct routes (placeholders allowed).

### Implementation for User Story 2

- [ ] T013 [US2] Implement sticky Navbar with functional navigation links in `frontend/components/layout/Navbar.tsx`
- [ ] T014 [US2] Integrate Navbar into `frontend/app/layout.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mobile Access [US3] (Priority: P3)

**Goal**: Ensure a high-quality experience across all device sizes.

**Independent Test**: Use mobile device/emulator and verify hamburger menu and stacked feature grid.

### Implementation for User Story 3

- [ ] T015 [US3] Add mobile-responsive menu (hamburger) logic to `frontend/components/layout/Navbar.tsx`
- [ ] T016 [US3] Review and adjust grid stacking for Features section on mobile in `frontend/components/landing/Features.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T017 Implement Dark Mode theme support using `next-themes` in `frontend/components/providers/ThemeProvider.tsx`
- [ ] T018 Integrate `ThemeProvider` into `frontend/app/layout.tsx`
- [ ] T019 Final UI review against design system and accessibility (WCAG) check

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- T002 can run in parallel with T001 (once directory exists)
- T005, T006, T007 can run in parallel
- T008, T009, T010, T011 can be developed in parallel as separate components
- Once navbar exists, T013 and T014 follow

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify page content renders correctly at root URL.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
