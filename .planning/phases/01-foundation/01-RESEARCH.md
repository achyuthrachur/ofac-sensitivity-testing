# Phase 1: Foundation - Research

**Researched:** 2026-03-03
**Domain:** Next.js 15 project scaffolding, TypeScript type contracts, shadcn/ui initialization
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Use `create-next-app@latest` with flags: `--typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- App Router (not Pages Router)
- `src/` directory layout
- TypeScript strict mode enabled (`"strict": true` in tsconfig)
- Include a `.gitignore` that covers `node_modules/`, `.env.local`, `.vercel/`
- Orphan `node_modules/` exists in project root from prior work — exclude from git but do not delete
- SdnEntry fields: `id`, `name`, `entityType` (`'individual'|'business'|'vessel'|'aircraft'`), `region` (`'arabic'|'cjk'|'cyrillic'|'latin'`), `country?` (optional string)
- ResultRow fields: `id`, `originalName`, `entityType`, `region`, `degradedVariant`, `ruleId`, `ruleLabel`, `similarityScore`, `caught`
- RunParams fields: `entityCounts {individual, business, vessel, aircraft}`, `regions[]`, `ruleIds[]`, `clientName`
- `DEFAULT_CATCH_THRESHOLD = 0.85` exported from `lib/constants.ts`
- Single-page app at `/` — App Router, single `app/page.tsx`
- Initialize shadcn/ui in Phase 1 via `npx shadcn@latest init`
- Add baseline shadcn/ui components: `button`, `input`, `checkbox`, `label`, `card`
- Add `.gitignore` entry for `Sensitivity Degradation Sample Prep PDD V0.9.docx`
- `SdnEntry.region` and `ResultRow.region` defined as a `const` object with union type derived from it

### Claude's Discretion

- Exact tsconfig options beyond strict mode
- ESLint rule additions beyond Next.js defaults
- Prettier configuration (include it, sensible defaults)
- Exact shadcn/ui theme defaults (neutral, CSS variables — will be overridden in Phase 7 with Crowe branding)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 1 establishes the runnable scaffold and the shared TypeScript type contracts that every subsequent phase depends on. Because this is a greenfield project and the stack is locked (Next.js 15 App Router, TypeScript strict, Tailwind, shadcn/ui), there are no architectural choices to make — only precise execution of the initialization sequence.

The three critical outputs of this phase are: (1) a working `npm run dev` with no TypeScript or ESLint errors, (2) the shared type file(s) defining `SdnEntry`, `ResultRow`, and `RunParams` that will be imported verbatim by every subsequent phase, and (3) the directory skeleton that subsequent phases populate. Initializing shadcn/ui here — rather than deferring to a later UI phase — means Phases 5 and 6 can install components without a separate setup step mid-build.

One known friction point is the npm + React 19 peer-dependency conflict when adding shadcn/ui components. The `--legacy-peer-deps` flag resolves this cleanly. The orphan `node_modules/` at the project root (a mammoth/docx-reading package) must appear in `.gitignore` before the first commit but must not be deleted.

**Primary recommendation:** Run `create-next-app` with the exact locked flags, define types using the `const`-object-derived union pattern, initialize shadcn/ui with the `--legacy-peer-deps` flag for npm, then create the empty directory skeleton. The phase is complete when `npm run dev`, `npx tsc --noEmit`, and `npm run lint` all exit zero.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x (latest patch) | Full-stack React framework; App Router | Locked decision; Vercel-native; Server Actions eliminate API route boilerplate |
| React | 19.x (ships with Next.js 15) | UI rendering | Ships automatically with Next.js 15 |
| TypeScript | 5.x | Static typing | Locked decision; strict mode enforces contract between all layers |
| Tailwind CSS | 3.x or 4.x | Utility-first styling | Included by `create-next-app` with `--tailwind` flag |
| ESLint | Included via `--eslint` flag | Linting | Included by `create-next-app`; Next.js config already bundled |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | Latest (copy-on-demand, not versioned npm) | Accessible component primitives | Initialize in Phase 1 so Phases 5–6 have components ready |
| Radix UI | Transitive (via shadcn/ui) | Accessibility primitives (keyboard nav, ARIA) | Used automatically via shadcn components |
| Prettier | Latest | Code formatting | Include in Phase 1 so all subsequent code is formatted consistently |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui | Headless UI, MUI | shadcn is copy-on-demand (no vendor lock-in), Tailwind-native — decision is locked |
| Tailwind CSS | Plain CSS modules | Tailwind is locked via `create-next-app --tailwind` flag |
| App Router | Pages Router | App Router is locked; Server Actions are unavailable in Pages Router |

### Installation

```bash
# Step 1: Scaffold (run from PARENT directory, not inside project root)
npx create-next-app@latest "ofac-sensitivity-testing" \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd "ofac-sensitivity-testing"

# Step 2: shadcn/ui init
npx shadcn@latest init

# Step 3: Add baseline components (use --legacy-peer-deps if on npm with React 19)
npx shadcn@latest add button input checkbox label card

# If peer dep errors occur with npm:
npx shadcn@latest add button input checkbox label card --legacy-peer-deps

# Step 4: Prettier
npm install --save-dev prettier

# Step 5: Verify
npm run dev          # should start without errors
npx tsc --noEmit     # should exit 0
npm run lint         # should exit 0
```

**Important:** The project root already contains an orphan `node_modules/` directory. `create-next-app` must be run from the PARENT directory, targeting a new subdirectory — OR the existing root must be used carefully. Since the root contains only `node_modules/` and a `.docx` file, the safest approach is to run `create-next-app` to initialize the project IN the existing root directory using `.` as the project name, or to run it from the parent and then move files. The planner must decide the exact git-safe approach.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    layout.tsx              # Root layout (Server Component)
    page.tsx                # Single page at / (Server Component shell)
    _components/            # Page-scoped Client Components (populated Phases 5-6)
    actions/                # Server Actions (populated Phase 4)
  lib/
    rules/                  # Rule modules (populated Phase 3)
    constants.ts            # DEFAULT_CATCH_THRESHOLD and other compile-time constants
    sampler.ts              # Pure function (populated Phase 3)
    degrader.ts             # Pure function (populated Phase 3)
  types/
    index.ts                # SdnEntry, ResultRow, RunParams — defined in Phase 1
data/
  sdn.json                  # Synthetic dataset (populated Phase 2)
```

### Pattern 1: Shared Type Definitions

**What:** All shared interfaces live in `src/types/index.ts`. Every subsequent module imports from `@/types`.

**When to use:** Any type used by more than one module.

**Example:**
```typescript
// src/types/index.ts

// Derive union type from const object — guarantees string literals stay in sync
// across engine, UI, and display label code.
export const REGION_VALUES = {
  arabic: 'arabic',
  cjk: 'cjk',
  cyrillic: 'cyrillic',
  latin: 'latin',
} as const;

export type Region = (typeof REGION_VALUES)[keyof typeof REGION_VALUES];
// Result: 'arabic' | 'cjk' | 'cyrillic' | 'latin'

export const ENTITY_TYPE_VALUES = {
  individual: 'individual',
  business: 'business',
  vessel: 'vessel',
  aircraft: 'aircraft',
} as const;

export type EntityType = (typeof ENTITY_TYPE_VALUES)[keyof typeof ENTITY_TYPE_VALUES];

export interface SdnEntry {
  id: string;
  name: string;
  entityType: EntityType;
  region: Region;
  country?: string;
}

export interface ResultRow {
  id: string;
  originalName: string;
  entityType: SdnEntry['entityType'];
  region: SdnEntry['region'];
  degradedVariant: string;
  ruleId: string;
  ruleLabel: string;
  similarityScore: number;
  caught: boolean;
}

export interface RunParams {
  entityCounts: {
    individual: number;
    business: number;
    vessel: number;
    aircraft: number;
  };
  regions: Region[];
  ruleIds: string[];
  clientName: string;
}
```

### Pattern 2: Compile-Time Constants

**What:** Export all compile-time constants from a single `lib/constants.ts`.

**When to use:** Any value that must be the same across engine and UI (threshold, max counts, etc.).

**Example:**
```typescript
// src/lib/constants.ts

/** Jaro-Winkler score above which a degraded variant is considered "caught".
 *  Standard in watchlist screening literature. Not a form parameter in v1. */
export const DEFAULT_CATCH_THRESHOLD = 0.85;

/** Maximum names per entity type the form allows. */
export const MAX_ENTITY_COUNT = 500;
```

### Pattern 3: tsconfig.json — Beyond Strict Mode

**What:** Supplement `"strict": true` with additional options that prevent common bugs.

**When to use:** Always, in the tsconfig generated by `create-next-app`.

**Example additions (Claude's discretion):**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Note: `noUncheckedIndexedAccess` is intentionally omitted — it generates many false positives in data-access code that slow implementation.

### Pattern 4: .prettierrc — Sensible Defaults

**What:** Consistent formatting from first commit.

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "semi": true,
  "jsxSingleQuote": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Add `.prettierignore`:
```
.next/
node_modules/
data/sdn.json
```

### Pattern 5: .gitignore — Phase 1 Critical Entries

**What:** The `.gitignore` must cover the orphan `node_modules/`, `.env.local`, `.vercel/`, and the `.docx` file BEFORE the first commit.

```gitignore
# dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/

# Vercel
.vercel/

# Environment
.env.local
.env*.local

# Artifacts
*.tsbuildinfo
next-env.d.ts

# OS
.DS_Store
Thumbs.db

# Project-specific: binary design doc (no value in version control)
Sensitivity Degradation Sample Prep PDD V0.9.docx
```

### Anti-Patterns to Avoid

- **Defining types inline in module files:** `SdnEntry` defined in `data/sdn.types.ts` and `ResultRow` defined in `types/results.ts` creates two sources of truth. Put all shared types in `src/types/index.ts` from day one.
- **Using string literals directly instead of derived union types:** `entityType: 'individual'` scattered across files. Derive union types from const objects so adding a new entity type is a single-file change.
- **Running `create-next-app` inside the existing root:** The existing `node_modules/` (mammoth, docx-related packages) is irrelevant to this project. Do not run `npm install` inside the root before scaffolding — let `create-next-app` create a fresh dependency tree.
- **Committing before `.gitignore` is complete:** The orphan `node_modules/` is large; staging it accidentally would corrupt the git history.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible UI components (button, input, checkbox) | Custom HTML with manual ARIA | shadcn/ui | shadcn components use Radix UI primitives — keyboard navigation, focus management, and ARIA roles are battle-tested |
| TypeScript path aliases | Custom webpack config | `--import-alias "@/*"` flag in `create-next-app` | The flag generates the correct `tsconfig.json` paths and Next.js webpack alias simultaneously |
| ESLint Next.js config | Custom ESLint rules | `--eslint` flag; `eslint-config-next` | Includes React hooks rules, accessibility rules, and Next.js-specific rules |
| Tailwind setup | Manual PostCSS config | `--tailwind` flag | Generates `tailwind.config.ts` and PostCSS config correctly wired to Next.js |

**Key insight:** `create-next-app` with the exact locked flags generates a production-correct project in one command. Every item in this table is handled by the scaffold — zero manual configuration needed for the baseline.

---

## Common Pitfalls

### Pitfall 1: npm Peer Dependency Errors When Adding shadcn/ui Components (React 19)

**What goes wrong:** `npx shadcn@latest add button` fails with peer dependency errors because some Radix UI packages haven't yet declared React 19 as a supported peer dependency.

**Why it happens:** npm is strict about peer dependency ranges; React 19 is newer than the declared peer range in some Radix packages.

**How to avoid:** Use `--legacy-peer-deps` flag on the `shadcn add` command when on npm. pnpm/yarn/bun users are unaffected. The installed code works correctly — this is a metadata mismatch, not a runtime incompatibility.

**Warning signs:** Error message includes "peer dependency conflict" or "ERESOLVE" during `npx shadcn@latest add`.

### Pitfall 2: Two Type Definitions for the Same Field — Type Drift

**What goes wrong:** `SdnEntry.entityType` is defined as a union in `data/sdn.types.ts` and `ResultRow.entityType` is redefined as `SdnEntry['entityType']` in `types/results.ts`. Later a developer adds a new entity type in one file and forgets the other.

**Why it happens:** Architecture documents suggest splitting into two files; developers follow the split mechanically without understanding the reference relationship.

**How to avoid:** Define ALL shared types in one file: `src/types/index.ts`. Use `SdnEntry['entityType']` in `ResultRow` as a reference (not a redefinition) so there is literally one source of truth.

**Warning signs:** Two files both defining `'individual' | 'business' | 'vessel' | 'aircraft'`.

### Pitfall 3: Committing the Orphan node_modules Before .gitignore

**What goes wrong:** Developer runs `git init` or `git add .` before verifying `.gitignore`. The mammoth/docx node_modules directory (hundreds of files) enters git history. Removing it requires a force-push or history rewrite.

**Why it happens:** Orphan `node_modules/` is easy to overlook because it belongs to an unrelated package (mammoth — a docx reader). It is NOT the project's own dependency tree.

**How to avoid:** Verify `.gitignore` contains `node_modules/` before running any `git add` command. Check with `git status` and confirm no `node_modules/` files appear.

**Warning signs:** `git status` shows `node_modules/` files in untracked list.

### Pitfall 4: TypeScript Errors on Empty Scaffold After Strict Mode Additions

**What goes wrong:** Adding `noUnusedLocals: true` or `noUnusedParameters: true` to tsconfig causes errors in the generated Next.js scaffold files (e.g., empty page with unused imports). `npx tsc --noEmit` exits non-zero before any real code is written.

**Why it happens:** `create-next-app` generates files that may include a generated `next-env.d.ts` reference or template JSX that doesn't fully satisfy aggressive strict options.

**How to avoid:** Run `npx tsc --noEmit` immediately after scaffolding and before adding strict options. Add strict options incrementally. Any generated scaffold errors should be fixed or suppressed before the phase is marked complete.

**Warning signs:** `npx tsc --noEmit` fails with "no unused locals" or "no unused parameters" on files in `.next/` or generated scaffold.

### Pitfall 5: shadcn/ui Theme Locked to Wrong Base Color

**What goes wrong:** During `npx shadcn@latest init`, the prompt asks for a base color. If "zinc" or "slate" is chosen, Phase 7 branding work is harder because the CSS variables are pre-set to a non-neutral hue.

**Why it happens:** The init prompt defaults vary; developers click through quickly.

**How to avoid:** Choose **"neutral"** as the base color and **yes** for CSS variables during `npx shadcn@latest init`. CSS variables make Phase 7 branding overrides trivial. Document the choice in a comment in `globals.css`.

---

## Code Examples

### Verified Type Pattern: const Object with Derived Union

```typescript
// src/types/index.ts
// Source: TypeScript handbook — const assertions for literal types

export const REGION_VALUES = {
  arabic: 'arabic',
  cjk: 'cjk',
  cyrillic: 'cyrillic',
  latin: 'latin',
} as const;

export type Region = (typeof REGION_VALUES)[keyof typeof REGION_VALUES];
// Equivalent to: 'arabic' | 'cjk' | 'cyrillic' | 'latin'
// Adding a new region requires editing only REGION_VALUES — the union updates automatically.
```

### Verified Pattern: SdnEntry using derived types

```typescript
// src/types/index.ts (continued)

export const ENTITY_TYPE_VALUES = {
  individual: 'individual',
  business: 'business',
  vessel: 'vessel',
  aircraft: 'aircraft',
} as const;

export type EntityType = (typeof ENTITY_TYPE_VALUES)[keyof typeof ENTITY_TYPE_VALUES];

export interface SdnEntry {
  id: string;
  name: string;
  entityType: EntityType;
  region: Region;
  country?: string;          // optional — display purposes only
}
```

### Verified Pattern: ResultRow referencing SdnEntry types

```typescript
// src/types/index.ts (continued)

export interface ResultRow {
  id: string;                              // stable React key
  originalName: string;
  entityType: SdnEntry['entityType'];      // reference, not redefinition
  region: SdnEntry['region'];              // reference, not redefinition
  degradedVariant: string;
  ruleId: string;                          // machine identifier
  ruleLabel: string;                       // human-readable (e.g. "Space Removal")
  similarityScore: number;                 // Jaro-Winkler 0–1, populated Phase 4
  caught: boolean;                         // score > DEFAULT_CATCH_THRESHOLD
}
```

### Verified Pattern: RunParams with inline entityCounts shape

```typescript
// src/types/index.ts (continued)

export interface RunParams {
  entityCounts: {
    individual: number;      // 0–500
    business: number;
    vessel: number;
    aircraft: number;
  };
  regions: Region[];         // at least one required
  ruleIds: string[];         // at least one required
  clientName: string;        // used in CSV filename
}
```

### Verified Pattern: create-next-app Command

```bash
# Source: https://nextjs.org/docs/app/api-reference/cli/create-next-app
# Confirmed current as of March 2026.
npx create-next-app@latest ofac-sensitivity-testing \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Verified Pattern: shadcn/ui init + component add

```bash
# Source: https://ui.shadcn.com/docs/installation/next
# Select: style=New York OR Default, base color=neutral, CSS variables=yes

npx shadcn@latest init

# Add baseline components (use --legacy-peer-deps if npm throws ERESOLVE)
npx shadcn@latest add button input checkbox label card
# or:
npx shadcn@latest add button input checkbox label card --legacy-peer-deps
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router (`/pages/api`) | App Router + Server Actions | Next.js 13.4 (stable) | No separate API route needed; form submission handled by co-located Server Action |
| `getServerSideProps` | RSC + Server Actions | Next.js 13 | Data fetching co-located with components |
| Install UI library as npm package | shadcn/ui copy-on-demand | 2023 | No vendor lock-in; Tailwind-native; source code owned by project |
| `tsconfig.json` written manually | Auto-generated by `create-next-app` | Current | Correct path aliases, module resolution, and JSX settings generated automatically |

**Deprecated/outdated:**
- `npx create-next-app` without `--app` flag: defaults to Pages Router — do not use
- `next/font` import from `next/dist/client/font`: use `next/font/google` or `next/font/local` (current API)
- `eslint-config-next` manual installation: bundled automatically with `--eslint` flag

---

## Open Questions

1. **Where to run `create-next-app` given the existing root**
   - What we know: The project root already exists with an orphan `node_modules/` and a `.docx` file. The true project code does not yet exist.
   - What's unclear: Whether to run `create-next-app` targeting the existing root (`.`) or a subdirectory. Running with `.` inside an existing directory can conflict with pre-existing files.
   - Recommendation: The planner should specify `create-next-app` with `.` as the target directory name (initializes in-place), or alternatively create a `next-app/` subdirectory and treat the root as a workspace. Given the project is a single Next.js app with no monorepo need, initializing in-place with `.` is cleaner. Add explicit step to verify no existing files conflict.

2. **Tailwind version: v3 vs v4**
   - What we know: Tailwind v4 was released after the knowledge cutoff (Aug 2025); `create-next-app@latest` may now default to v4. The STACK.md notes "verify stable release status." The architecture doc says "3.x or 4.x."
   - What's unclear: Whether Tailwind v4's configuration format (no `tailwind.config.ts` in some setups) creates friction with shadcn/ui which was designed for v3.
   - Recommendation: After running `create-next-app`, check which Tailwind version was installed. If v4, verify shadcn/ui init works correctly. If shadcn/ui has issues with v4, downgrade to Tailwind v3 by following shadcn/ui docs. This is a Phase 1 execution concern, not a blocker for planning.

3. **Git repository initialization**
   - What we know: The project root is not currently a git repo (per the environment context). Phase 1 must include `git init`.
   - What's unclear: Whether `create-next-app` initializes git automatically (it does in most versions) or whether a manual `git init` is needed.
   - Recommendation: The planner should include a git init step with a check: if `create-next-app` already initialized git, skip. Verify with `git status` before adding any files.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed yet — Wave 0 gap (Phase 1 is scaffolding only; no logic to test) |
| Config file | None — see Wave 0 |
| Quick run command | `npx tsc --noEmit && npm run lint` |
| Full suite command | `npx tsc --noEmit && npm run lint && npm run dev` (smoke: dev server starts) |

### Phase Requirements to Test Map

Phase 1 has no v1 requirement IDs (it is a scaffolding prerequisite). Verification is structural and build-based:

| Check | Behavior | Test Type | Command | File Exists? |
|-------|----------|-----------|---------|-------------|
| Dev server starts | `npm run dev` exits without error | smoke | `npm run dev -- --port 3001 &; sleep 5; kill %1` | N/A — generated by scaffold |
| TypeScript compiles | Zero type errors on scaffold + types | type-check | `npx tsc --noEmit` | N/A — generated by scaffold |
| ESLint passes | Zero lint errors | lint | `npm run lint` | N/A — generated by scaffold |
| Types importable | `SdnEntry`, `ResultRow`, `RunParams` defined and importable | compile-check | `npx tsc --noEmit` (types included) | Wave 0 gap: `src/types/index.ts` |
| Directories exist | `lib/rules/`, `data/`, `app/actions/`, `components/` skeleton | file-system | manual or `ls` check | Wave 0 gap: create empty dirs with `.gitkeep` |
| Constants exportable | `DEFAULT_CATCH_THRESHOLD` exported from `lib/constants.ts` | compile-check | `npx tsc --noEmit` | Wave 0 gap: `src/lib/constants.ts` |

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit && npm run lint`
- **Per wave merge:** `npx tsc --noEmit && npm run lint` (no test runner yet in Phase 1)
- **Phase gate:** Dev server starts (`npm run dev`) AND TypeScript + ESLint both exit zero

### Wave 0 Gaps

- [ ] `src/types/index.ts` — defines `SdnEntry`, `ResultRow`, `RunParams`, `Region`, `EntityType`
- [ ] `src/lib/constants.ts` — exports `DEFAULT_CATCH_THRESHOLD = 0.85`, `MAX_ENTITY_COUNT = 500`
- [ ] `src/lib/rules/.gitkeep` — empty placeholder so directory is tracked by git
- [ ] `src/app/actions/.gitkeep` — empty placeholder
- [ ] `data/.gitkeep` — empty placeholder (at `src/data/` or project-root `data/` per architecture)
- [ ] `.prettierrc` — formatting config
- [ ] `.prettierignore` — exclude `.next/`, `node_modules/`, `data/sdn.json`
- [ ] `.gitignore` additions — `node_modules/`, `.vercel/`, `.env.local`, `*.docx`

*(No test runner framework gaps — Phase 1 has no pure functions to unit test. Test framework setup is deferred to Phase 3 which introduces pure functions.)*

---

## Sources

### Primary (HIGH confidence)

- [Next.js create-next-app CLI docs](https://nextjs.org/docs/app/api-reference/cli/create-next-app) — flags verified
- [Next.js TypeScript configuration](https://nextjs.org/docs/app/api-reference/config/typescript) — tsconfig options
- [shadcn/ui Next.js installation](https://ui.shadcn.com/docs/installation/next) — init command and prompts
- [shadcn/ui React 19 compatibility docs](https://ui.shadcn.com/docs/react-19) — `--legacy-peer-deps` pattern
- `.planning/research/STACK.md` — stack decisions (researched 2026-03-03)
- `.planning/research/ARCHITECTURE.md` — directory structure and type patterns (researched 2026-03-03)

### Secondary (MEDIUM confidence)

- [Next.js 15 version history](https://nextjs.org/blog/next-15) — version currency check
- Community consensus (DEV.to, Medium 2025): Prettier config defaults (`singleQuote`, `trailingComma: "es5"`, `printWidth: 100`)
- WebSearch result: Next.js 15 latest patch as of 2026 (15.x series; Next.js 16 now also available — use 15.x per locked decision)

### Tertiary (LOW confidence)

- Tailwind v4 + shadcn/ui compatibility — behavior depends on exact versions installed by `create-next-app@latest`; verify at execution time

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — create-next-app flags, shadcn init command, and TypeScript strict config all verified against current official docs
- Architecture: HIGH — directory structure and type patterns derived directly from `.planning/research/ARCHITECTURE.md` (stable, verified patterns)
- Pitfalls: HIGH — npm peer-dep behavior with React 19, git risks from orphan node_modules, and tsconfig strict-mode edge cases are all verifiable, concrete problems

**Research date:** 2026-03-03
**Valid until:** 2026-06-03 (stable scaffold patterns; shadcn/ui compatibility with Tailwind should be re-verified if more than 60 days pass)
