# Zenvinus web — frontend guide

How the frontend is organised and how to write TypeScript in it. Read this before adding a page, a feature or an
API call. Every example below is taken from the code in this repository.

- Stack: Next.js 16.4 (Pages Router, `src/pages`, Turbopack), React 19.3, TypeScript 7.0 (strict, native compiler),
  Redux Toolkit 2 (app state), TanStack Query 5 (API data),
  Bootstrap 5 + the template SCSS in `public/assets/scss`, our own styles in `src/styles/index.scss`.
- Package manager: bun only (`bun install`, `bun add`, `bun run dev`); `package.json` pins it in `packageManager` and
  `bun.lock` is the only lockfile. Installing with npm or pnpm rebuilds `node_modules` in another layout, and a running
  dev server or the browser cache then points at modules that no longer exist ("module factory is not available").
- Scripts: `bun run dev`, `bun run build`, `bun run typecheck` (tsc), `bun run lint` (Oxlint).
- Node.js 20.9 or newer (Next.js 16).

## 1. Folder structure

```text
src/
├── components/
│   ├── common/        breadcrumb.tsx, card-markdown.tsx, seo.tsx
│   ├── icons/         inline SVG icons
│   ├── layout/
│   │   ├── footer/    footer.tsx, social-links.tsx
│   │   ├── header/    header.tsx, menu-data.ts, mobile-nav.tsx, nav-menu.tsx, search-popup.tsx
│   │   ├── site-or-dashboard-layout.tsx
│   │   └── wrapper.tsx
│   └── ui/            button.tsx, skeleton.tsx
├── config/            data-types.ts, permissions.ts, routes.ts
├── features/
│   ├── about/         About page
│   ├── auth/          Session, sign-in (email code, Google, GitHub), login page
│   ├── blog/          Blog and news lists and articles
│   ├── catalog/       Datasets and models: lists and detail pages
│   ├── company/       Company billing, settings, team (dashboard)
│   ├── contact/       Contact page and form
│   ├── dashboard/     Dashboard shell (header, footer, KPI grid) and the role dashboards
│   ├── home/          Home page sections
│   ├── lab/           AI Research Lab (internal request queue)
│   ├── projects/      Project request wizard, project list, order pipeline, payment
│   ├── services/      Service pages (template-based, linked from the footer)
│   ├── studio/        Dataset Studio (explore, edit, import CSV)
│   ├── support/       Dashboard help: FAQ, support tickets (list, conversation, reply, close) via /api/support
│   └── tasks/         Task list, task flow (join → qualification → studio → quality → reward), workspaces
├── hooks/             use-mounted.ts, use-sticky.ts
├── i18n/              context.tsx, language-slice.ts, languages.ts, language-switch.tsx, index.ts, types.ts, id/*.ts
├── lib/               storage.ts (safe local/sessionStorage), wow.ts
├── pages/             Next.js routes
├── providers/         app-providers.tsx, store-provider.tsx
├── services/          api.ts
├── store/             store.ts, hooks.ts, persistence.ts, types.ts (Redux store)
├── styles/            index.scss
├── types/             api.ts, vendor.d.ts
└── utils/             format.ts, pagination.ts
```

| Directory | Responsibility |
| --- | --- |
| `src/pages` | Next.js routes only. A page wires a feature component to a URL, sets `<SEO>` and, if needed, `getServerSideProps`. No business logic. |
| `src/features/<feature>` | One business domain (tasks, catalog, studio, blog, …). Everything that only this domain uses lives here. |
| `src/components/ui` | Generic UI building blocks with no domain knowledge (`Button`, skeletons). |
| `src/components/common` | Small shared page parts (`SEO`, `Breadcrumb`). |
| `src/components/layout` | Site chrome: header, menus, footer, page wrapper, `SiteOrDashboardLayout`. |
| `src/components/icons` | Inline SVG icon components. |
| `src/services` | Shared API client (`apiFetch`, `apiUpload`, `ApiError`, `mediaUrl`). Feature API calls live in the feature. |
| `src/types` | Types shared by several features: API envelopes and refs (`api.ts`), declarations for untyped packages (`vendor.d.ts`). |
| `src/config` | App-wide constants that several features read (`data-types.ts`). |
| `src/utils` | Pure helpers without React (`format.ts`, `pagination.ts`). |
| `src/hooks` | Shared React hooks (`use-mounted`, `use-sticky`). |
| `src/lib` | Wrappers around browser and third-party APIs (`storage.ts`, `wow.ts` for WOW.js). |
| `src/i18n` | Languages: `context.tsx` (state, `t()`), `language-switch.tsx`, dictionaries in `id/*.ts`. |
| `src/providers` | App-wide providers mounted once by `_app.tsx` (Redux store, React Query, language, auth). |
| `src/store` | The Redux store: combines the feature slices, typed hooks, persistence (see section 9). |
| `src/styles` | Global SCSS entry. |

Why `src/providers` and not `src/app`: Next.js treats a `src/app` folder as the App Router, so the name is
reserved.

### Inside a feature

```text
src/features/<feature>/
├── components/   React components of this feature (sub-folders per screen when there are many)
├── hooks/        Hooks only this feature uses
├── services/     API calls (<feature>-api.ts) and payload mappers (<feature>-mappers.ts)
├── types/        Domain types: API DTOs and UI models, one file per domain
├── store/        Redux slices of this feature (<name>-slice.ts): state, actions, thunks, selectors, persistence
├── data/         Constants, mock data and pure helpers
├── utils/        Pure helpers only this feature uses
├── index.ts      Public API for other features: types, services, data, small widgets
└── screens.ts    Route screens, imported only by src/pages
```

Only create what a feature needs. `about`, `contact`, `home`, `lab` and `services` have no `index.ts` because no
other code uses them; they only have `screens.ts`.

Example, the tasks feature:

```text
src/features/tasks/
├── components/
│   ├── flow/          task-detail-page.tsx, task-join-page.tsx, … one screen per flow step
│   ├── list/          tasks-page.tsx, tasks-area.tsx
│   ├── studio/        task-studio.tsx and its bars
│   └── workspaces/    registry.tsx and one editor per task type
├── data/              tasks.ts (TASK_TYPES, TASK_STATUS, …), submission-store.ts, quality-check.ts, …
├── hooks/             use-task-route.ts
├── services/          tasks-api.ts, task-mappers.ts
├── types/             task.ts, workspace.ts, review.ts, quality.ts, submission.ts
├── utils/             workspace-input.ts
├── index.ts
└── screens.ts
```

### Import rules

1. Inside a feature: relative imports (`./post-card`, `../services/posts-api`).
2. Shared code: the `@/` alias, which points at `src/` (`@/services/api`, `@/components/ui/button`).
   Static files: `@assets/` points at `public/assets/`.
3. Another feature: only through its `index.ts` (`import { useAuth } from '@/features/auth'`), never a path into
   its folders. A feature may reorganise its internals without breaking anyone.
4. Pages import screens from `screens.ts` (`import { TasksPage } from '@/features/tasks/screens'`) and anything else
   (services, types) from `index.ts`.
5. `index.ts` never exports screens and features never import `screens.ts`. Screens pull in other features'
   widgets (the dashboard header, for example); keeping them out of `index.ts` is what keeps the import graph free
   of cycles.
6. Shared code (`components`, `services`, `utils`, `types`, `config`, `hooks`, `lib`, `i18n`) does not import
   features. The places that compose the app are the exceptions: `src/providers` (mounts the auth provider),
   `src/store/store.ts` (combines the feature slices), `components/layout/site-or-dashboard-layout.tsx` (renders
   the dashboard shell) and the site header (`components/layout/header/header.tsx`, `mobile-nav.tsx`: the
   signed-in visitor's account menu from `features/auth`). If two features need the same
   thing, move it to the shared layer (that is why permission codes live in `config/permissions.ts`).
7. Barrels (`index.ts`, `screens.ts`) list their exports by name; no `export *`.

Bundle size: `package.json` declares `"sideEffects": ["*.css", "*.scss"]`. That tells webpack that our modules do
nothing when imported except styles, so exports a page does not use are dropped even when they come through a
barrel. Keep it that way: no code that runs at import time (top-level `window.…`, registering things). Put such
code in a function or an effect. If a module really needs an import-time effect, add it to that list.

## 2. TypeScript in this project

- `tsconfig.json` runs in `strict` mode. See section 8 for every option.
- Files with JSX are `.tsx`, everything else `.ts`. There are no `.js` files in `src` (`allowJs` is off).
- `bun run typecheck` must pass with no errors; `next build` runs the same check.
- Do not silence the compiler: no `any`, no `@ts-ignore` / `@ts-expect-error`, no `eslint-disable` for type rules.
  Oxlint enforces `no-explicit-any` and `consistent-type-imports` (section 8).
- Type assertions (`as`) are allowed for `as const`, for narrowing DOM elements, and at data boundaries the
  compiler cannot see (the JSON in `src/services/api.ts`, data read back from `localStorage`). Every other `as`
  needs a comment that says why it is safe (see `features/tasks/utils/workspace-input.ts`). Avoid `!`; narrow
  instead.
- Values from outside the program (JSON from `localStorage`, `JSON.parse`, `catch (e)`) are `unknown` and must be
  narrowed before use.

## 3. `type`, `interface` and `enum`

| Use | For | Example |
| --- | --- | --- |
| `interface` | Object contracts: component props, data models, API DTOs, context values — anything that may be extended | `interface PostCardDto { id: number; slug: string; … }` |
| `type` | Unions, intersections, aliases, function signatures, mapped and utility types | `type PostKind = 'blog' \| 'news'`, `type ButtonProps = LinkButtonProps \| NativeButtonProps` |
| `as const` + derived type | Fixed sets of values (instead of `enum`) | `DATA_TYPES` and `DataType` below |
| `enum` | Not used. A string union plus an `as const` object gives the same safety, works with plain JSON from the API and needs no runtime code. | — |

```ts
// src/config/data-types.ts
export const DATA_TYPES = ['3d', 'audio', 'document', 'geospatial', 'image', 'tabular', 'text', 'time_series', 'video'] as const;
export type DataType = (typeof DATA_TYPES)[number];

export const isDataType = (value: unknown): value is DataType =>
  typeof value === 'string' && (DATA_TYPES as ReadonlyArray<string>).includes(value);
```

### Where types live

- Used by one feature: `src/features/<feature>/types/<domain>.ts`, exported from the feature's `index.ts` when
  other code needs them.
- Used by several features: `src/types/` (API envelopes, refs) or next to the shared module that owns them
  (`ButtonProps` in `button.tsx`, `TranslateFn` in `i18n/context.tsx`).
- Props interfaces sit in the component file, named `<Component>Props`, and are exported when another file renders
  the component with spread or wraps it.
- Do not redefine a type that exists. Derive instead: `Pick`, `Omit`, `Partial`, `(typeof X)[number]`,
  `ReturnType<typeof fn>`.

### API DTOs and UI models

The backend (Go, `zenvinus-backend`) is the source of truth for API JSON. A feature keeps two kinds of types:

- `*Dto`: the exact JSON of an endpoint, field for field (`internal/catalog/dto.go`, `internal/studio/service.go`).
- UI models (no suffix): what components render, produced by the feature's mapper.

Components only see UI models. When the backend changes a field, the DTO and the mapper change; components do not.

## 4. Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Files and folders | kebab-case | `post-card.tsx`, `posts-api.ts`, `site-or-dashboard-layout.tsx` |
| Page-level feature component | `<name>-page.tsx` | `features/blog/components/blog-page.tsx` |
| React components | PascalCase | `PostCard`, `LanguageSwitch` |
| Hooks | `use` + camelCase, file `use-<name>.ts` | `useMounted` in `hooks/use-mounted.ts` |
| Functions, variables | camelCase | `fetchPostPage`, `mediaUrl` |
| Module-level constants | UPPER_SNAKE_CASE | `POSTS_PER_PAGE`, `DATA_TYPES` |
| Types and interfaces | PascalCase, no `I` prefix | `PostCard`, `SessionUser` |
| Props | `<Component>Props` | `ButtonProps`, `SEOProps` |
| API payloads | `<Thing>Dto`, `<Endpoint>Response` | `PostCardDto`, `PostPageResponse` |
| API functions | `fetch<Thing>`, verbs for writes | `fetchPostBySlug`, `joinTask`, `signOut` |
| Mappers | `map<Thing>` | `mapPostCard` |

## 5. Adding a feature

1. Create `src/features/<feature>/` with the folders it needs (section 1).
2. Write the types first: `types/<domain>.ts` with the DTOs (copy field names from the Go structs) and the UI models.
3. Add the API calls in `services/<feature>-api.ts` using `apiFetch<T>()`, and a mapper if the UI shape differs.
4. Build the components in `components/`. Use `useT()` for every user-facing string (English text is the key;
   add the Indonesian to `src/i18n/id/<area>.ts`; a new dictionary file must be added to the list in
   `src/i18n/context.tsx`).
5. Export the route screens from `screens.ts`, and from `index.ts` whatever other features need.
6. Add the route in `src/pages/<route>.tsx`: `<Wrapper>` around the screen; `<SEO pageTitle="…">` in the page
   or in the screen.
7. Public pages have no breadcrumb banner (see AGENTS.md). If the page belongs to a menu item, map it in
   `SECTION_OF` in `src/components/layout/header/menu-data.ts`.
8. Run `bun run typecheck`, `bun run lint` and open the page.

A page (the screen sets its own `<SEO>`; a page may also set it):

```tsx
// src/pages/tasks.tsx
import React from 'react';
import Wrapper from '@/components/layout/wrapper';
import { TasksPage as Tasks } from '@/features/tasks/screens';

const TasksPage = () => (
  <Wrapper>
    <Tasks />
  </Wrapper>
);

export default TasksPage;
```

## 6. Sharing types between features

- Import another feature's types from its index: `import type { Session } from '@/features/auth'`.
- If a type starts being used by several features and does not belong to one of them, move it to `src/types/`.
- Never import a type from another feature's internal file; ask the owning feature to export it.

## 7. Examples from the code

### Component with props (discriminated union)

```tsx
// src/components/ui/button.tsx (shortened)
interface ButtonBaseProps {
  size?: 'md' | 'sm';
  block?: boolean;
  icon?: string;
  className?: string;
  children?: ReactNode;
}

export type LinkButtonProps = ButtonBaseProps &
  Pick<LinkProps, 'href'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | 'href'>;

export type NativeButtonProps = ButtonBaseProps & { href?: undefined } &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>;

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const isLink = (props: ButtonProps): props is LinkButtonProps => props.href !== undefined;
```

`<Button href="/contact">` renders a Next.js link and accepts anchor attributes; `<Button onClick={save}>` renders
a `<button>` and accepts button attributes. Passing `disabled` together with `href` is a type error.

### API client and a typed call

```ts
// src/services/api.ts
export async function apiFetch<T = unknown>(path: string, options?: ApiFetchOptions): Promise<T>;

// src/features/blog/services/posts-api.ts
export const fetchPostPage = (kind: PostKind, params: Partial<PostListParams> = {}, ctx?: ApiFetchOptions['ctx']): Promise<PostPage> =>
  apiFetch<PostPageResponse>(`/api/${kind}/page`, { params: { ...params }, ctx }).then((res) => ({
    cards: (res.data || []).map((p) => mapPostCard(p, kind)),
    total: res.total || 0,
    sidebar: mapSidebar(res.sidebar),
  }));
```

`apiFetch` defaults to `unknown`, so every call names the response type. Errors are `ApiError` with `status`,
`body` and `unavailable` (true when the API is down); `isUnavailableError(error)` narrows an unknown error.

### API response types

```ts
// src/types/api.ts
export interface ApiListResponse<T> {
  data: T[];
  total: number;
}

// src/features/blog/types/post.ts
export interface PostCardDto {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  category: SlugRef | null;
  publishedAt: IsoDateString | null;
  readTimeMinutes: number | null;
  author: NameRef | null;
}

export interface PostPageResponse extends ApiListResponse<PostCardDto> {
  sidebar?: SidebarDto;
}
```

Optional (`?`) means the backend omits the field (`omitempty` in Go); `| null` means it sends `null` (a Go pointer).

### Context and hook

```tsx
// src/features/auth/auth-provider.tsx (shortened)
export interface AuthContextValue {
  session: Session | null;
  user: SessionUser | null;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
```

### Translations

```ts
const { t } = useT();
t('Save details');                                   // string
t('Rows {from}–{to} of {total}', { from, to, total }); // string
t('Fields {br} are required', { br: <br /> });        // ReactNode (an element was passed)
```

`t()` is overloaded: plain values give a `string` (usable in `placeholder`, `aria-label`), an element value gives
`ReactNode`.

### Narrowing unknown data

```ts
// src/services/api.ts
const isErrorBody = (json: unknown): json is ApiErrorBody => typeof json === 'object' && json !== null;
```

### Constants instead of enums (`as const satisfies`)

```ts
// src/features/tasks/data/tasks.ts (shortened)
export const TASK_STATUS = {
  DRAFT: { label: 'Draft', tone: 'blue' },
  OPEN: { label: 'Open', tone: 'mint' },
  ACTIVE: { label: 'Active', tone: 'blue' },
  // …
} as const satisfies Record<string, { label: string; tone: Tone }>;

export type TaskStatusKey = keyof typeof TASK_STATUS; // 'DRAFT' | 'OPEN' | 'ACTIVE' | …
```

`as const` keeps the literal keys and values; `satisfies` checks every entry against the shape without widening
the type. The union type is derived, never written by hand.

### Generic props tied to a key

```ts
// src/features/tasks/types/workspace.ts (shortened)
export interface WorkspaceItemMap {
  image_classification: ImageClassificationItem;
  text_classification: TextClassificationItem;
  object_annotation: ObjectAnnotationItem;
  // … one entry per TaskTypeId
}

/** Contract of every workspace component: { item, answer, onChange } */
export interface WorkspaceProps<K extends TaskTypeId> {
  item: WorkspaceItemMap[K];
  answer: WorkspaceAnswerMap[K];
  onChange: (next: WorkspaceAnswerMap[K]) => void;
}
```

The image classification editor is `(props: WorkspaceProps<'image_classification'>)`: it receives exactly its own
item and answer types, and the registry cannot hand it another type's data.

### Discriminated union

```ts
// src/features/projects/types/project.ts (shortened)
export interface PostedProject { id: string; kind: 'posted'; /* … request fields */ }
export interface SeededProject { id: string; kind?: undefined; /* … demo project fields */ }
export type CompanyProject = PostedProject | SeededProject;

// after `if (project.kind === 'posted')` TypeScript knows every PostedProject field, and in the else branch
// every SeededProject field
```

### A typed service

```ts
// src/features/studio/services/studio-api.ts
export const getStudioDataset = (slug: string): Promise<StudioDatasetDetail> =>
  apiFetch<ApiItemResponse<StudioDatasetDetail>>(datasetPath(slug)).then((r) => r.data);
```

### Data read back from storage

```ts
// src/features/projects/components/new-project.tsx (shortened)
const readDraft = (): Partial<ProjectRequestForm> | null => {
  try {
    const draft: unknown = JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? 'null');
    // Only saveDraft() writes this key, always a full ProjectRequestForm
    return isRecord(draft) ? (draft as Partial<ProjectRequestForm>) : null;
  } catch {
    return null; // corrupt draft — ignore it
  }
};
```


## 8. TypeScript, lint and build configuration

### TypeScript 7

TypeScript 7 is the native (Go) compiler. It is much faster, but it no longer ships the JavaScript compiler API
(`require('typescript')` gives only the version). What that means here:

- `tsc` (and `bun run typecheck`) is the native compiler; there is nothing to configure.
- `next build` type-checks through the `tsc` CLI (Next.js 16 does this automatically when the API is missing).
- Tools that need the old API do not work with it. ESLint's TypeScript parser (typescript-eslint) is one of them,
  which is why the project lints with Oxlint. If a tool needs the TypeScript 6 API, Microsoft publishes it as
  `@typescript/typescript6`.

`tsconfig.json`:

| Option | Value | Why |
| --- | --- | --- |
| `strict` | `true` | All strict checks (null checks, no implicit any, strict function types, …). |
| `noImplicitOverride` | `true` | Class members that override must say `override`. |
| `noFallthroughCasesInSwitch` | `true` | A `case` without `break`/`return` is an error. |
| `forceConsistentCasingInFileNames` | `true` | Imports must match the file name's case (macOS is case-insensitive, Linux CI is not). |
| `target` / `lib` | `ES2020` / `dom`, `dom.iterable`, `ES2022` | Modern browsers; `ES2022` for `Object.hasOwn`, `Array.prototype.at`, `\|\|=`. |
| `module` / `moduleResolution` | `esnext` / `bundler` | Resolution of a bundled app (Turbopack). TypeScript 7 removed `node` (node10). |
| `jsx` | `react-jsx` | React's automatic runtime; Next.js sets this on every build. JSX types come from React (`React.JSX`), there is no global `JSX`. |
| `noEmit`, `isolatedModules`, `incremental` | `true` | tsc only checks types; every file can be compiled on its own; faster re-checks. |
| `esModuleInterop`, `resolveJsonModule` | `true` | Default imports from CommonJS packages, JSON imports. |
| `skipLibCheck` | `true` | Do not type-check `node_modules` declaration files. |
| `allowJs` | `false` | Everything in `src` is TypeScript. |
| `include` | `next-env.d.ts`, `src/**/*.ts`, `src/**/*.tsx` | What tsc checks. |
| `paths` | `@/*` → `./src/*`, `@assets/*` → `./public/assets/*` | Import aliases (section 1). No `baseUrl`: TypeScript 7 removed it; the paths are relative to `tsconfig.json`. |

`next-env.d.ts` (generated by Next.js, git-ignored) brings in the types for static image imports.
`src/types/vendor.d.ts` declares modules for packages without types (wowjs).

### Lint (Oxlint)

`bun run lint` runs Oxlint with `.oxlintrc.json`. It covers what the old ESLint setup (`next/core-web-vitals` +
typescript-eslint recommended) did:

- the `correctness` category of the core, TypeScript, React, Next.js and jsx-a11y rules;
- project rules as errors: `typescript/no-explicit-any`, `typescript/consistent-type-imports` (inline `type`
  imports), `no-unused-vars` (prefix `_` to ignore);
- React hooks: `rules-of-hooks` (error), `exhaustive-deps` (warning);
- `nextjs/no-img-element` and the six jsx-a11y checks of `next/core-web-vitals` as warnings.

Not enabled (they were not part of the ESLint setup): the other jsx-a11y rules, `react-in-jsx-scope` (useless with
the automatic runtime) and the React Compiler rules (`set-state-in-effect`, `refs`, `purity`, …). Turn the latter on
when adopting the React Compiler.

Oxlint reads `// eslint-disable-next-line <rule>` comments, including the ESLint rule names already in the code
(`react-hooks/exhaustive-deps`, `@next/next/no-img-element`, …). Note: the hooks rule treats any name starting with
`use` as a hook, so do not name plain variables `useSomething`.

### Build (Turbopack) and styles

- `next dev` and `next build` use Turbopack. `next build --webpack` still works if a webpack-only plugin is ever
  needed.
- Sass imports use package names (`bootstrap/scss/bootstrap`) and relative paths; the webpack-only `~` prefix and
  `/public/...` root paths do not resolve in Turbopack.
- `src/styles/index.scss` keeps `@import` on purpose: with `@use` the template's heading rules no longer merge with
  Bootstrap's and the h1–h6 sizes change. `next.config.js` silences that one deprecation (`silenceDeprecations:
  ['import']`) and hides warnings from dependencies (`quietDeps`, Bootstrap 5.3's own SCSS); any other Sass warning
  from our files still shows.
- `package.json`: `"sideEffects": ["*.css", "*.scss"]` (see the import rules in section 1).

## 9. State management

Three kinds of state, three places. Pick by asking where the data comes from and who needs it:

| State | Where | Examples |
| --- | --- | --- |
| Data from the API (server state) | TanStack Query (`useQuery`, `useMutation`) | posts, tasks, datasets, studio rows, the session |
| App state shared across pages, or kept across reloads | Redux Toolkit (`src/store`, slices in features) | language, project requests and the wizard draft, task submissions/progress/drafts, the expert review queue |
| UI state of one component | `useState` / `useReducer` in the component | open tabs and dropdowns, the form being edited, hover |

Do not copy API data into Redux: TanStack Query already caches it, retries while the API is down, refetches it
and fills it from SSR. Do not put a form's every keystroke in Redux unless another page needs it (the wizard keeps
its form in `useState` and only "Save draft" writes to the store).

### Store layout

```text
src/store/
├── store.ts        combineReducers + configureStore, RootState, AppDispatch, makeStore()
├── hooks.ts        useAppDispatch, useAppSelector, useAppStore (typed)
├── persistence.ts  restore on load, save after changes (listener middleware)
└── types.ts        PersistedSlice<S>: the contract between a slice and persistence

src/features/projects/store/projects-slice.ts       posted project requests (localStorage zv-posted-projects)
src/features/projects/store/request-draft-slice.ts  wizard draft (localStorage zv-request-draft)
src/features/tasks/store/submissions-slice.ts       last submission, progress, drafts (sessionStorage zenvinus:*)
src/features/tasks/store/reviews-slice.ts           expert review queue (localStorage zv-expert-reviews)
src/i18n/language-slice.ts                          language (localStorage zenvinus_lang)
```

The storage keys and formats are the ones the app used before Redux, so data saved in a visitor's browser keeps
working.

### Writing a slice

```ts
// src/features/projects/store/projects-slice.ts (shortened)
export interface ProjectsState {
  posted: PostedProject[];
}

const initialState: ProjectsState = { posted: [] };

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    projectAdded(state, action: PayloadAction<PostedProject>) {
      state.posted.unshift(action.payload); // Immer: "mutating" code returns a new state
    },
    projectUpdated(state, action: PayloadAction<PostedProject>) { /* … */ },
    projectsHydrated(_state, action: PayloadAction<ProjectsState>) {
      return action.payload;
    },
  },
});

/** State shape this slice needs; the app's RootState includes it */
export interface ProjectsRootState {
  projects: ProjectsState;
}

export const selectPostedProjects = createSelector(
  [(state: ProjectsRootState) => state.projects.posted],
  (posted): PostedProject[] => posted.map(normalizePosted),
);

/** Thunk: computes the id and timestamp (impure), then dispatches a plain action */
export const postProjectRequest =
  (form: PostedProjectInput) =>
  (dispatch: Dispatch, getState: () => ProjectsRootState): PostedProject => {
    const project = buildPostedProject(form, getState().projects.posted);
    dispatch(projectAdded(project));
    return project;
  };
```

Rules:

- Reducers are pure. Anything that depends on the clock, randomness or the current list (new ids, timestamps) is
  computed in a thunk or a `prepare` callback and passed in the action.
- Keep the domain logic in pure functions next to the data (`data/project-store.ts`: `buildPostedProject`,
  `withStatus`, `withProposal`) so reducers, thunks and tests share it.
- Selectors are typed with the slice's own root shape (`ProjectsRootState`), not the app `RootState`. A feature then
  never imports `src/store/store.ts`, which imports the feature: no cycle. `RootState` includes every slice shape,
  so the selectors work with `useAppSelector`.
- Selectors that build new arrays or objects use `createSelector`, so components re-render only when the input
  changes.
- Export the reducer, persistence, actions, thunks, selectors and state types from the feature's `index.ts`, then
  add the reducer (and persistence) in `src/store/store.ts`.
- `src/i18n` uses the plain `useSelector` / `useDispatch` typed with `LanguageRootState` instead of the store's
  hooks: the store imports feature slices, which import i18n.

### Using the store in a component

```tsx
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changeRequestStatus, selectPostedProject } from '@/features/projects';

const project = useAppSelector((state) => selectPostedProject(state, id));
const dispatch = useAppDispatch();
const updated = dispatch(changeRequestStatus(id, 'in_progress', note)); // thunks return their result
```

Components re-render when the selected state changes, so pages no longer need a manual refresh after an update
(the lab used to force one).

In an effect or event handler that must read the latest value at that moment (the task studio restoring a draft
when the contributor switches items), read it from the store instead of subscribing:

```ts
const store = useAppStore();
const draft = selectDraft(store.getState(), task.slug, item.id);
```

### Persistence and hydration

A slice that survives a reload exports a `PersistedSlice<S>` (`src/store/types.ts`):

```ts
export const projectsPersistence: PersistedSlice<ProjectsState> = {
  load: () => {
    const stored = readJson('local', STORAGE_KEY);
    return Array.isArray(stored) ? { posted: stored as PostedProject[] } : undefined; // only this slice writes the key
  },
  save: (state) => writeJson('local', STORAGE_KEY, state.posted),
  hydrate: projectsHydrated,
};
```

- The server renders with the initial state, and so does the browser's first render: the two match and React
  hydrates without warnings.
- `StoreProvider` then loads every persisted slice in a layout effect. `selectStorageHydrated` turns true once that
  has happened.
- An effect that reads stored state when the page opens must wait for `selectStorageHydrated`. With React 19, the
  effects of the first (hydration) render still see the store from before it was restored. The wizard draft and
  `useTaskRoute` (its `ready` includes the flag) do this:

```ts
const savedDraft = useAppSelector(selectRequestDraft);
const storageHydrated = useAppSelector(selectStorageHydrated);
useEffect(() => {
  if (restored || !storageHydrated) return;
  setRestored(true);
  if (savedDraft) setForm({ ...emptyForm, ...savedDraft });
}, [restored, storageHydrated, savedDraft]);
```

  Rendering from a selector needs nothing special: the component re-renders when the store is restored.
- After that, the listener in `persistence.ts` calls `save` for every slice an action changed. It never saves
  before loading, so the initial state cannot overwrite what the visitor saved.
- Read and write storage only through `src/lib/storage.ts` (`readJson`, `writeJson`, …). It is safe on the server
  and when storage is blocked, and returns `unknown` for the slice to narrow.

### Adding app state

1. Decide it belongs in Redux (table above).
2. Create `src/features/<feature>/store/<name>-slice.ts`: state interface, `createSlice`, `<Feature>RootState`,
   selectors, thunks for impure work, and a `PersistedSlice` if it must survive a reload.
3. Export it from the feature's `index.ts`.
4. Add the reducer (and the persistence entry) in `src/store/store.ts`.
5. Use `useAppSelector` / `useAppDispatch` in components.

## 10. Known gaps

Things the migration left as they were on purpose, so behaviour did not change:

- Mock data: projects, orders, company billing/team/settings, dashboards, the lab and the task flow (items,
  qualification, submissions) run on local mock data; what users create is Redux state saved in the browser. When
  the backend endpoints exist, move that data to TanStack Query (DTOs, mappers, services like catalog and blog) and
  turn the thunks into mutations.
- `features/services` and parts of `features/home` are template pages; their props and data are typed but the
  markup is the template's.
- Three `<img>` elements (`industry-area`, `image-classification`, `object-annotation`) trigger the
  `nextjs/no-img-element` warning. They show user or external images with unknown sizes; switching to
  `next/image` would change layout.
- `exhaustive-deps` is disabled on a few effects in the task studio, object annotation, mobile menu
  and two pages; they run on purpose only when the listed values change.
- `new-project.tsx` reads and writes the wizard form through string paths (`set('data.targetSize', v)`); the path
  types keep call sites checked, the two helpers use commented assertions.
- Bugs found while typing and kept as they were are marked with "Known issue" comments in the code (for
  example the box drag preview in `object-annotation.tsx`).
- `react-modal-video` and `react-18-image-lightbox` declare React 18 as their peer; they work with React 19 (the
  service page video popup and gallery were tested) but the package manager warns. Replace them if they break.
- Bundle size after the Next.js 16 / React 19 upgrade: about 40 kB more JavaScript per page from React 19 and the
  Next.js 16 runtime, plus about 8% from Turbopack's chunking compared with webpack (`next build --webpack`).
