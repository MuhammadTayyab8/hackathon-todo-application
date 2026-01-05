# Research: Landing Page Implementation

## Decision: Next.js 15+ App Router for SEO & Performance
### Rationale
Next.js 15 provides built-in Metadata API support which is critical for the SEO of a landing page. Using Server Components by default aligns with the project constitution and maximizes performance by reducing client-side JavaScript.

### Alternatives Considered
- **Standard React (Vite)**: Rejected due to lack of SSR and complex SEO setup.
- **Next.js Pages Router**: Rejected as it's deprecated in favor of App Router and lacks the same performance optimizations for layout shifts.

## Decision: Tailwind CSS for Styling
### Rationale
Specified in technical requirements. Enables rapid development of responsive layouts and strict adherence to a design system via `tailwind.config.ts`.

## Decision: Sticky Navbar with Layout Shift Prevention
### Rationale
To ensure a high-quality UX, the navbar will use `sticky top-0` with `scrollbar-gutter: stable` in global CSS. This prevents the "pumping" effect when navigating between pages or opening modals.

## Decision: Optimizing Hero Image with next/image
### Rationale
The Hero section is the Large Contentful Paint (LCP) element. Using `next/image` with `priority={true}` ensures it loads immediately and correctly sized for the device.

## Decision: Better Auth for Future-Proofing
### Rationale
Aligned with project constitution. Even though authentication logic is out of scope for *this* feature, placeholders will point to functional navigation paths that Better Auth will handle in subsequent tasks.
