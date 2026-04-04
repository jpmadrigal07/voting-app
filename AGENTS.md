# Agent & codebase conventions

Guidelines for this repository. Follow these when adding or changing code.

## Quotes and formatting

- Use **single quotes** for all string literals and import paths (e.g. `'react'`, `'@/components/ui/button'`).
- Match existing Prettier/ESLint config if present; prefer single-quote style in new code.

## React: Server Components, hooks, and re-renders

- **Prefer React Server Components** and server-side data loading over client components when possible.
- **Avoid React hooks when they are not necessary.** Unnecessary hooks increase re-render surface and complexity.
- **Especially avoid `useEffect`.** Prefer:
  - Deriving state during render when values can be computed from props/state.
  - Server Components and server data fetching for one-time or URL-driven data.
  - Event handlers and form actions for user-driven updates.
  - Libraries or patterns that move side effects out of the render cycle when truly needed.
- Use client components (`'use client'`) only where interactivity or browser-only APIs require them.

## File size

- **Maximum ~500 lines per file** (excluding generated or vendored files unless the team agrees otherwise).
- If a file grows beyond that, **split it**: extract components, hooks (when unavoidable), utilities, or route segments into separate modules. Keep related logic cohesive.

## App Router file structure (private folders and co-location)

Use **Next.js private folders**: names starting with `_` are **not** URL segments—they keep code next to routes without creating new paths.

**App-wide (under `app/`):** You may use private folders at the root of `app` for shared, non-route code, for example:

- `_components` — UI pieces used across multiple routes under `app`
- `_helpers` — small utilities scoped to the `app` tree
- `_hooks` — hooks used in this app (prefer minimizing; see above)
- `_lib` — app-local config, helpers, or glue (not the same as root `lib/` if you have one)
- `_services` — API clients, server fetch helpers, or service-layer functions (e.g. axios usage aligned with server-first fetching)

**Per route / segment:** For a route like `app/about/` (or nested segments), **co-locate** the same private folders **inside that folder** next to `page.tsx`, `layout.tsx`, or `route.ts`:

- `_components`, `_helpers`, `_hooks`, `_lib`, `_services` — only what belongs to that route; keeps the route self-contained and under the 500-line limit by splitting into these folders.

**Route groups:** Use parentheses for logical grouping without changing the URL, e.g. `(auth)`, `(users)` — `app/(auth)/login/page.tsx` stays `/login` (group name is omitted from the path).

**Shared UI outside `app`:** Keep **cross-cutting** or design-system usage in a top-level `components` folder (sibling to `app`, e.g. `web/components`), especially shadcn primitives and reused building blocks. Use `app/.../_components` for **route-specific** UI; use root `components` when the same module is reused widely.

When adding files, prefer the **smallest scope** that fits: per-route `_` folders first, then segment-level, then `app/_*`, then root `components` / `lib`.

## Data fetching: server vs client

- **Default: server-side requests** in Server Components or Route Handlers, using **axios** (or the project’s chosen server HTTP client) as configured.
- **TanStack Query (React Query)** is allowed **only** where client-side caching, background refetch, or interactive UI state clearly benefits from it—and **must be approved by the project developer** before adding new client-side query usage.
- **TanStack Query should be scoped** to areas that genuinely need client-driven fetching (e.g. highly interactive regions like a **user account dashboard**). Do not spread client queries across the app by default.

## Authentication (Better Auth)

- Perform **Better Auth–related HTTP/session work on the server** (Server Components, server actions, API routes) unless the official Better Auth client API is required for a specific browser-only flow.
- Do not move auth checks or session-sensitive logic to the client when a server request is sufficient and safer.

## UI components

- Use **shadcn/ui** components from this project’s `components/ui` (or configured paths) **only**. Do not add parallel component libraries (Material UI, Chakra, etc.) for the same purpose.
- Compose new UI from existing shadcn primitives and project patterns.

## Icons

- Use **Lucide** icons only (from `'lucide-react'`). No other icon sets.
- **Prefix every icon’s local name with `Lucide`.** Rename on import, e.g. `import { User as LucideUser, Settings as LucideSettings } from 'lucide-react'`. Use those prefixed names in JSX (`<LucideUser />`).
