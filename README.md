# command.carrieros.ai

A professional dark company-management workspace shell built with Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript, self-hosted Manrope, and Lucide icons.

## Start

```sh
npm ci
npm run dev
```

Open http://localhost:3000. New sessions go to `/login`. The prefilled demo credentials are **demo@companymgmt.ai / demo12345**. Login stores only a demo flag in sessionStorage for this browser tab; passwords are never persisted or sent to the backend. Refresh preserves the preview session; Sign out clears it.

**Demo login is a layout preview, not authentication or access control.** Connect a real identity provider and server-verified authorization before releasing company data. The backend's existing production guard remains unchanged.

## Layout and routes

- Persistent, scrollable desktop sidebar, with collapse/expand controls.
- Mobile navigation drawer with focus trapping, Escape dismissal, and route-close behavior.
- Top navbar with breadcrumb, navigation search, notification preview, and account/sign-out menu.
- Search by button or Ctrl/⌘ K; navigation works through real Next.js links.
- Focus indicators, a skip link, semantic headings, labeled fields, reduced-motion handling, and mobile touch targets.
- Consistent placeholder, unknown-route recovery, and page-specific document titles.

The sidebar contains **AI Agent** and all ten requested systems. Every destination displays **Coming soon**. No company-directory or other business features are exposed in this frontend.

```text
src/app/
  layout.tsx                        root theme, font, metadata
  page.tsx                          entry redirect
  login/page.tsx                    sign-in page
  (workspace)/layout.tsx            shared application shell
  (workspace)/ai-agent/page.tsx      AI Agent placeholder
  (workspace)/systems/[system]/     ten system placeholders
  not-found.tsx                     route recovery
src/config/navigation.ts            single navigation/route registry
src/components/brand.tsx             wordmark
src/components/layout/               shell, sidebar, placeholder
src/features/auth/                   local demo-session and login form
src/lib/api.ts                       HTTP helper retained for future API work
tests/e2e/workspace.spec.ts           layout/session/navigation checks
```

Adding a system means adding an entry to `navigation.ts`; its route, metadata, sidebar, and search entry follow the same registry. Replace the placeholder within its route when implementing the real module. Keep shared shell structure separate from feature-specific pages.

## Verification

```sh
npm run check
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e
```

The five browser tests cover demo credential validation, safe return paths, refresh, all eleven destinations, active links, collapse/expand, search, popovers, logout, mobile navigation and viewport fit, and unknown routes. They do not need the backend. CI runs the full frontend suite.

## Future API integration and deployment

The Express/Prisma/PostgreSQL API remains a separate repository and has not been changed for this layout. Copy `.env.example` to `.env.local` when adding API consumers; `NEXT_PUBLIC_API_URL` is public configuration, never a secret. Rebuild when changing a public environment variable for another deployment. The standalone Dockerfile is retained.

`PRODUCT.md`, `DESIGN.md`, and `.impeccable/design.json` record the current workspace requirements and dark design system.

## Dependency maintenance

A known upstream `braces <=3.0.3` advisory remains in the development-only Next ESLint dependency chain. The production dependency audit is clear at setup verification. Track the upstream patch; do not force-downgrade Next.js to satisfy a tooling audit suggestion.
