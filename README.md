# command.carrieros.ai

A dark company-management workspace built with Next.js 16 App Router, React 19, Tailwind CSS 4, TanStack Query 5, TypeScript, self-hosted Manrope, and Lucide icons.

## Start

```sh
npm ci
npm run dev
```

Start the API first (`api.command.carrieros.ai`, with its database seeded), then open http://localhost:3000. Signed-out visitors go to `/login`. The seeded demo users all sign in with **Pass@123**; the "Try a demo user" picker on the login page fills in any of them:

| Team             | Role                                  | Email                                            |
| ---------------- | ------------------------------------- | ------------------------------------------------ |
| C-suite          | Leadership Lead (CEO)                 | ceo@gmail.com                                    |
| C-suite          | Executive Member (CFO, CTO)           | cfo@gmail.com, cto@gmail.com                     |
| India developers | Team Manager / Team Member            | indiamanager@gmail.com, indiadeveloper@gmail.com |
| US AI engineers  | Team Manager / Team Member            | usaimanager@gmail.com, usaiengineer@gmail.com    |
| Sales            | Sales Manager / Sales Member          | salesmanager@gmail.com, salesexecutive@gmail.com |
| Investors        | Investor Relations Manager / Investor | irmanager@gmail.com, investor@gmail.com          |

Users created in the app get a temporary password and are sent to `/change-password` at their first sign-in.

Sign-in is real: the API checks the password and sets an HTTP-only session cookie, and every request is authorized there by the user's team roles. The frontend only hides what the API would refuse:

- The sidebar and search list only the sections the user's roles allow (`sections` from `/api/v1/auth/me`); opening another section by URL shows "No access".
- Profiles outside the user's teams arrive with contact details hidden (`restricted`), unless the user is in leadership.
- Team and user management controls appear only for the Leadership Lead, and membership controls only for a team's manager.

`useMe`, `useAccess` and the sign-in mutations live in `src/features/auth/session.ts`. The requirements call for the shared CarrierOS login service; these local accounts are the stand-in until it is available, and the API's production guard stays in place.

## Layout and routes

- Persistent, scrollable desktop sidebar, with collapse/expand controls.
- Mobile navigation drawer with focus trapping, Escape dismissal, and route-close behavior.
- Top navbar with breadcrumb, navigation search, notification preview, and account/sign-out menu.
- Search by button or Ctrl/⌘ K; navigation works through real Next.js links.
- Focus indicators, a skip link, semantic headings, labeled fields, reduced-motion handling, and mobile touch targets.
- Consistent placeholder, unknown-route recovery, and page-specific document titles.

The sidebar lists every company area. **Company overview** (`/overview`, with the AI ask box) and **Teams & members** (`/teams`) are built; every other area shows **Coming soon** until its module is implemented.

```text
src/app/
  layout.tsx                         root theme, font, metadata
  page.tsx                           entry redirect
  login/page.tsx                     sign-in page
  (workspace)/layout.tsx             shared application shell
  (workspace)/overview/page.tsx      company overview and Ask AI
  (workspace)/teams/page.tsx         teams and people
  (workspace)/[area]/page.tsx        Coming soon placeholder for unbuilt areas
  not-found.tsx                      route recovery
  globals.css                        Tailwind import, design tokens (@theme), base styles
src/config/navigation.ts             single navigation/route registry
src/components/brand.tsx             wordmark
src/components/layout/               shell, sidebar, topbar, command palette, placeholder
src/components/providers.tsx         TanStack Query client
src/components/loading-screen.tsx    full-screen loading message
src/components/ui/                   reusable UI building blocks (see below)
src/features/auth/                   sign-in, change password, session and access hooks
src/features/overview/               overview page, AI answer views
src/features/teams/                  teams and people module; queries.ts holds the data hooks
src/lib/api.ts                       HTTP client, errorMessage, isAbortError
tests/e2e/                           browser tests and an in-memory mock API
```

Adding a system means adding an entry to `navigation.ts`; its route, metadata, sidebar, and search entry follow the same registry. Replace the placeholder within its route when implementing the real module. Keep shared shell structure separate from feature-specific pages.

## Components

Shared UI lives in `src/components/ui/` and is imported from one place:

```tsx
import { Button, Card, Field, Form, FormActions } from "@/components/ui";
```

Components are styled with Tailwind utility classes. Prefer them over hand-written elements with the same styling.

| File                 | Components                                                                                      | Use for                                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button.tsx`         | `Button` (`variant`: `default` / `primary` / `danger`, `square`), `IconButton` (`label`, `tip`) | All actions. `IconButton` is for icon-only actions and requires an accessible `label`. `type` is left to the caller, as with a native button.                                                            |
| `card.tsx`           | `Card` (`title`, `action`), `Section` (`title`, `count`)                                        | Dashboard cards; titled sections inside drawers.                                                                                                                                                         |
| `form.tsx`           | `Form`, `Field` (`label`), `FormError`, `InlineError`, `FormActions`                            | Drawer forms. `Field` wraps its control in a `<label>`; style the control with `inputClasses`. `FormError` is always rendered for screen readers; `InlineError` appears only with a message.             |
| `data-table.tsx`     | `DataTable` (`columns`, `bodyProps`), `tableClasses`                                            | Tables. Rows are passed as children so each feature keeps its own row markup; give cells `tableClasses.cell` and rows `tableClasses.row` or `clickableRow`. `hideOnPhone` and `numeric` are for columns. |
| `list.tsx`           | `PageHeader`, `listRowClasses`, `nameClasses`                                                   | Page titles; avatar-and-name rows and table cells.                                                                                                                                                       |
| `confirm-delete.tsx` | `ConfirmDelete` (`what`, `onConfirm`)                                                           | Delete with inline confirmation; shows the API's reason if the delete is refused.                                                                                                                        |
| `feedback.tsx`       | `Tag` (`spaced`), `TagList`, `Note`, `ErrorState`, `EmptyState`, `Skeleton`                     | Labels, helper text, and loading, empty and error states.                                                                                                                                                |
| `avatar.tsx`         | `Avatar`, `TeamAvatar`, `AvatarStack`, `teamIcons`                                              | People and team avatars.                                                                                                                                                                                 |

Some files also export class strings (`buttonClasses`, `inputClasses`, `noteClasses`, `kbdClasses`, `ctaClasses`…) for elements that need the same look with different markup, such as a link styled as a button.

```tsx
<Form onSubmit={submit}>
  <Field label="Team name">
    <input className={inputClasses} name="name" required />
  </Field>
  <FormError>{error}</FormError>
  <FormActions>
    <Button variant="primary" type="submit">
      Save changes
    </Button>
    <Button type="button" onClick={onCancel}>
      Cancel
    </Button>
  </FormActions>
</Form>
```

## Styling

Styling is Tailwind CSS 4. Design tokens live in the `@theme` block of `src/app/globals.css` and become utilities:

- Surfaces: `bg-canvas`, `bg-sidebar`, `bg-panel`, `bg-raised`, `bg-hover`
- Lines: `border-line`, `border-line-strong`, `border-line-hover`
- Text: `text-fg`, `text-soft`, `text-subtle`, `text-dim`, `text-faint`
- Status: `accent`, `ok`, `warn`, `bad`
- Screen sizes: `max-narrow:` (≤520px), `max-phone:` (≤600px), `max-tablet:` (≤900px), `max-laptop:` (≤1100px), `max-desktop:` (≤1200px)

Use theme tokens first and arbitrary values such as `text-[13px]` for one-off sizes. Avoid named text sizes like `text-sm`, which also change line height. `globals.css` otherwise holds only base element defaults and the `data-tip` tooltip.

## Data fetching

Server data goes through TanStack Query (`@tanstack/react-query`). `src/components/providers.tsx` creates one client per browser session: data stays fresh for 30 seconds, and a failed load retries once unless the API answered with a 4xx.

`src/features/teams/queries.ts` is where components get data:

- Queries: `useTeams`, `useTeam`, `usePeople`, `usePerson`, `useAiStatus`. `useTeam` and `usePerson` start from the cached list, so drawers open instantly and then refresh.
- Mutations: `useSaveTeam`, `useDeleteTeam`, `useAddMember`, `useRemoveMember`, `useSavePerson`, `useDeletePerson`, `useAskAi`. Every successful change refreshes all team and people queries, because teams and people reference each other.
- Query keys come from `queryKeys`; add new ones there.

`api.ts` holds the plain request functions; call them only from query hooks.

## Feature folders

Feature-specific pieces stay inside their feature folder. In `src/features/teams/`: `teams-page.tsx` (page state and routing), `team-preview.tsx` (Teams tab side panel), `people-table.tsx`, `panels.tsx` (team and person drawers), `forms.tsx`, `drawer.tsx`, `record-row.tsx` (member/team row with remove action), `add-picker.tsx` (add-to-team form), `queries.ts` (data hooks), `api.ts` and `types.ts`.

Conventions: files are kebab-case, components PascalCase, hooks start with `use`. Show API errors with `errorMessage(error, fallback)` and ignore cancelled requests with `isAbortError(error)` from `@/lib/api`.

## Verification

```sh
npm run check
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e
```

The browser tests cover login and safe return paths, every sidebar destination, sign-in and first-time password change, what each role can see and change (sidebar sections, no-access pages, restricted profiles, managers adding users to their own team, Leadership Lead team and user management), hover preview, Ask AI, search, popovers, logout, mobile navigation and viewport fit, and unknown routes. They run against an in-memory mock API (`tests/e2e/mock-api.ts`), so they do not need the backend. CI runs the full frontend suite.

## API and deployment

The Express/Prisma/PostgreSQL API is a separate repository (`api.command.carrieros.ai`). The browser calls `/api/v1` on this app, and `next.config.ts` proxies it to `API_ORIGIN` (default `http://127.0.0.1:4000`; copy `.env.example` to `.env.local` to change it). Keeping the API behind the same origin keeps the session cookie first-party. Rebuild after changing `API_ORIGIN` for another deployment. The standalone Dockerfile is retained.

`PRODUCT.md`, `DESIGN.md`, and `.impeccable/design.json` record the current workspace requirements and dark design system.

## Dependency maintenance

A known upstream `braces <=3.0.3` advisory remains in the development-only Next ESLint dependency chain. The production dependency audit is clear at setup verification. Track the upstream patch; do not force-downgrade Next.js to satisfy a tooling audit suggestion.
