# Research & Technology Decisions

**Feature**: Auth-Aware Frontend Routing & Task Calendar Enhancements
**Date**: 2026-01-12
**Status**: Completed

## Research Tasks Completed

### 1. Next.js 16 Middleware for Route Protection

**Research Questions**:
- How does Next.js middleware.ts work for authentication?
- Can middleware read cookies?
- What are the redirect strategies for protected/public routes?

**Findings**:
- Next.js 16 middleware runs on edge runtime before page render
- Middleware can read cookies via `request.cookies.get()`
- Middleware supports `NextResponse.redirect()` for route protection
- Matcher config allows selective route protection
- Edge runtime provides fast performance (<100ms redirects)

**Best Practices**:
- Use matcher to exclude static assets and Next.js internals
- Keep middleware logic minimal for performance
- Use cookie presence check (not JWT validation) for speed
- Implement both "protect authenticated" and "protect public" logic

### 2. Cookie-Based Authentication with Better Auth

**Research Questions**:
- Does Better Auth support cookie storage?
- What are the security implications of HttpOnly cookies?
- How do cookies compare to localStorage for JWT storage?

**Findings**:
- Better Auth 1.0+ has native cookie storage plugin
- HttpOnly cookies prevent XSS attacks (JavaScript cannot access)
- Secure flag ensures HTTPS-only transmission
- SameSite=lax provides CSRF protection
- Cookies automatically sent with requests (no manual header management)

**Security Comparison**:
| Storage Method | XSS Protection | CSRF Protection | Auto-Send | Expiry |
|----------------|----------------|-----------------|-----------|--------|
| localStorage   | ❌ Vulnerable  | ✅ Safe         | ❌ Manual | ❌ Manual |
| HttpOnly Cookie| ✅ Protected   | ⚠️ Needs SameSite| ✅ Auto   | ✅ Auto |

**Best Practices**:
- Always use HttpOnly flag for auth tokens
- Set Secure flag in production (HTTPS required)
- Use SameSite=lax for balance of security and usability
- Match cookie maxAge with JWT expiry (7 days)

### 3. Calendar Implementation Approach

**Research Questions**:
- Should we use a calendar library or build custom?
- What are the performance implications of each approach?
- How do we handle date range rendering?

**Library Comparison**:
| Library | Bundle Size | Customization | Performance | License |
|---------|-------------|---------------|-------------|---------|
| react-big-calendar | 200KB+ | Medium | Good | MIT |
| fullcalendar | 300KB+ | High | Excellent | GPL/Commercial |
| Custom | <10KB | Full | Excellent | N/A |

**Decision Factors**:
- Requirements are simple (month view, color coding, no drag-drop)
- Bundle size matters for performance
- Full control over rendering needed for color coding
- No complex features like recurring events or timezone handling

**Best Practices**:
- Use CSS Grid for calendar layout (native, performant)
- Calculate date ranges client-side (no server dependency)
- Implement virtualization if >100 tasks per month
- Use memoization for expensive calculations

### 4. Database Migration Strategy

**Research Questions**:
- How to add start_date field safely?
- Should it be nullable or have a default?
- How to handle timezone storage?

**Findings**:
- Alembic supports adding nullable columns without downtime
- Nullable is safer than default for backward compatibility
- Existing pattern stores datetime without timezone (UTC assumed)
- SQLModel/PostgreSQL handle datetime serialization automatically

**Migration Strategy**:
```python
# Safe migration approach
def upgrade():
    op.add_column('tasks', sa.Column('start_date', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('tasks', 'start_date')
```

**Best Practices**:
- Always make new columns nullable initially
- Add validation at application level (not database constraints)
- Test migration on staging before production
- Keep migration reversible (implement downgrade)

---

## Technology Decisions

### Decision 1: Middleware Implementation

**Chosen**: Next.js 16 middleware.ts with cookie-based auth check

**Rationale**:
- Native Next.js middleware provides edge-runtime performance
- Runs before page render (no flash of unauthorized content)
- Supports cookie reading via request headers
- Centralized auth logic (no per-page duplication)
- Fast redirects (<100ms)

**Alternatives Considered**:
1. **Client-side route guards**: Rejected due to flash of unauthorized content and poor UX
2. **Server Components with redirect**: Rejected due to per-page duplication and maintenance burden
3. **Higher-order components**: Rejected due to complexity and performance overhead

**Implementation Details**:
- Create `src/middleware.ts` at root of frontend/src
- Use matcher config to exclude static assets
- Check cookie presence (not JWT validation for speed)
- Implement bidirectional protection (protect both authenticated and public routes)

---

### Decision 2: Cookie Storage Strategy

**Chosen**: Better Auth with cookie storage plugin, HttpOnly cookies

**Rationale**:
- Better Auth 1.0+ supports cookie-based sessions natively
- HttpOnly prevents XSS attacks (most common web vulnerability)
- Secure flag ensures HTTPS-only transmission
- SameSite=lax provides CSRF protection
- Automatic cookie management (no manual header logic)

**Alternatives Considered**:
1. **Manual cookie management**: Rejected due to complexity and security risks
2. **Session storage**: Rejected due to tab-specific limitations (not shared across tabs)
3. **IndexedDB**: Rejected due to async complexity and overkill for simple token storage

**Implementation Details**:
```typescript
cookieStorage: {
  name: 'auth_token',
  options: {
    httpOnly: true,      // XSS protection
    secure: true,        // HTTPS only
    sameSite: 'lax',     // CSRF protection
    maxAge: 604800,      // 7 days
    path: '/'
  }
}
```

---

### Decision 3: Calendar Library

**Chosen**: Custom calendar implementation using native Date APIs

**Rationale**:
- Lightweight (<10KB vs 200KB+ for libraries)
- Full control over rendering and styling
- Better performance for simple month view
- Easier to customize color coding logic
- No licensing concerns
- Simpler maintenance (no dependency updates)

**Alternatives Considered**:
1. **react-big-calendar**: Rejected due to bundle size (200KB+) and complexity for simple use case
2. **fullcalendar**: Rejected due to GPL licensing (requires commercial license) and overkill features
3. **react-calendar**: Rejected due to limited customization for task display

**Implementation Details**:
- Build CalendarGrid component with CSS Grid
- Use native Date API for date calculations
- Create TaskEvent components for date ranges
- Implement color coding with utility function
- Use React.memo for performance optimization

---

### Decision 4: Task Date Model

**Chosen**: Add `start_date` as nullable datetime field, keep `due_date` name in backend

**Rationale**:
- Maintains backward compatibility (existing tasks have null start_date)
- Clear semantics for date ranges
- Minimal migration risk (nullable column)
- No breaking changes to existing API consumers
- Frontend can rename to "end_date" in UI without backend changes

**Alternatives Considered**:
1. **Required start_date**: Rejected due to breaking existing tasks and requiring data migration
2. **Separate date range table**: Rejected as over-engineering for simple feature
3. **Default start_date = due_date**: Rejected as semantically incorrect (not all tasks start when due)

**Implementation Details**:
```python
# Backend model
start_date: Optional[datetime] = None  # NEW FIELD

# Validation
if start_date and due_date and start_date > due_date:
    raise HTTPException(400, "start_date cannot be after due_date")
```

---

### Decision 5: Color Coding Logic

**Chosen**: Calculate days until end_date, apply thresholds: ≤1 day = red, 2-3 days = yellow, ≥4 days = green

**Rationale**:
- Simple calculation (no complex algorithms)
- Clear visual hierarchy (red = urgent, yellow = soon, green = plenty of time)
- Aligns with common urgency patterns (traffic light metaphor)
- Easy to understand for users
- Performant (O(1) calculation per task)

**Alternatives Considered**:
1. **Percentage-based (time elapsed)**: Rejected as less intuitive and requires start_date
2. **User-configurable thresholds**: Rejected as out of scope and adds complexity
3. **Multiple urgency levels (5+ colors)**: Rejected as too granular and visually confusing

**Implementation Details**:
```typescript
export function getTaskUrgencyColor(endDate: Date): string {
  const now = new Date()
  const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil <= 1) return 'red'      // Overdue or due today/tomorrow
  if (daysUntil <= 3) return 'yellow'   // Due within 2-3 days
  return 'green'                         // Due in 4+ days
}
```

**Color Palette**:
- Red: `#ef4444` (Tailwind red-500) - High urgency
- Yellow: `#eab308` (Tailwind yellow-500) - Medium urgency
- Green: `#22c55e` (Tailwind green-500) - Low urgency

---

## Unresolved Questions

None - all research tasks completed and decisions made.

---

## Next Steps

1. Proceed to Phase 1: Design & Contracts
2. Create data-model.md with detailed entity schemas
3. Create API contracts in contracts/ directory
4. Create quickstart.md for implementation guide
5. Update agent context with new technology decisions
