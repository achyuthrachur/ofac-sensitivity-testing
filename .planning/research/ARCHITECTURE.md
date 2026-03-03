# Architecture Patterns

**Domain:** Form-driven data processing tool (Next.js App Router, TypeScript, Vercel)
**Researched:** 2026-03-03
**Confidence:** HIGH — Next.js App Router patterns are stable and well-established.

---

## Recommended Architecture

Single-repo Next.js App Router application. All computation happens server-side via Server Action. The client renders a controlled form, sends a single submission, and receives a complete result set.

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  ParameterForm (Client Component)                       │
│    ↓ submit (useTransition + Server Action)             │
│  ResultsPanel (Client Component)                        │
│    ├── ResultsTable (virtualized via @tanstack/virtual) │
│    └── CSVDownloadButton (client-side Blob generation)  │
└─────────────────────────────────────────────────────────┘
                        ↕ Server Action call
┌─────────────────────────────────────────────────────────┐
│                     Next.js Server                      │
│                                                         │
│  app/actions/runTest.ts  (Server Action)                │
│    ├── lib/sampler.ts    (filter dataset by params)     │
│    ├── lib/degrader.ts   (apply transformation rules)   │
│    └── data/sdn.json     (synthetic SDN dataset, static)│
└─────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Location | Responsibility | Communicates With |
|-----------|----------|---------------|-------------------|
| `ParameterForm` | `app/_components/ParameterForm.tsx` | Collect entity counts, linguistic regions, degradation rule selection, client name. Calls Server Action on submit. | Server Action `runTest` |
| `ResultsPanel` | `app/_components/ResultsPanel.tsx` | Holds result state. Conditionally renders table and CSV button. | `ParameterForm` (receives results), `ResultsTable`, `CSVDownloadButton` |
| `ResultsTable` | `app/_components/ResultsTable.tsx` | Virtualized display of up to ~5000 rows. Columns: original name, entity type, region, degraded variant, rule applied. | `ResultsPanel` |
| `CSVDownloadButton` | `app/_components/CSVDownloadButton.tsx` | Client-side CSV serialization. Triggers browser download via Blob + URL.createObjectURL. | `ResultsPanel` |
| `runTest` | `app/actions/runTest.ts` | Server Action. Validates params, calls sampler then degrader, returns typed result array. | `sampler`, `degrader`, `sdn.json` |
| `sampler` | `lib/sampler.ts` | Pure function. Filters SDN dataset by entity type and linguistic region. Returns deterministic subset. | `sdn.json` |
| `degrader` | `lib/degrader.ts` | Pure function. Applies selected transformation rules to name strings. Returns augmented rows. | Rule registry |
| `sdn.json` | `data/sdn.json` | Static synthetic dataset. Module-imported at build time. Zero I/O latency. | Consumed by `sampler` |
| Rule definitions | `lib/rules/index.ts` | Typed registry of all degradation rules (id, label, description, apply fn). | `degrader` + `ParameterForm` |

---

## Data Flow

```
1. USER fills ParameterForm
   entityCounts: { individual: number, business: number, vessel: number, aircraft: number }
   regions: string[]         (e.g. ["Arabic", "CJK", "Cyrillic"])
   ruleIds: string[]         (e.g. ["remove-spaces", "char-sub-ocr", "transliteration"])
   clientName: string

2. SUBMIT triggers Server Action (via useTransition)
   - Form state: isPending = true, results = null

3. SERVER ACTION: runTest(params)
   a. Validate params (Zod schema)
   b. sampler(sdn, params) → SdnRow[]
      - Filter sdn.json by entityType + region
      - Select up to entityCount rows
      - Deterministic (seeded or stable sort)
   c. degrader(rows, ruleIds) → ResultRow[]
      - For each row × each selected rule: apply rule.apply(name)
      - Return: { originalName, entityType, region, degradedVariant, ruleApplied, ruleId }
   d. Return ResultRow[] to client

4. CLIENT receives ResultRow[]
   - ResultsPanel stores in useState
   - ResultsTable renders (virtualized)
   - CSVDownloadButton becomes active

5. CSV DOWNLOAD (client-side, no server round-trip)
   - Serialize ResultRow[] to CSV string with UTF-8 BOM
   - Create Blob, fire anchor click → browser download
```

---

## Key Architectural Decisions

### Decision 1: Server Action vs API Route

**Chosen: Server Action**

Form-driven tool with a single compute operation → Server Actions are correct. Eliminate separate `/api/` route, integrate with `useTransition` for pending state, co-located with the invoking form.

Use API routes for external callers, webhooks, REST consumers. Use Server Actions when caller is your own React component.

### Decision 2: Where Degradation Engine Lives — Server

Engine lives in `lib/degrader.ts`, invoked inside the Server Action. Keeps rule logic out of client bundle. Future rules that call external services won't expose credentials.

### Decision 3: Synthetic Dataset Storage — Static JSON Module

`data/sdn.json` imported as a TypeScript module at build time. Zero I/O latency, type-safe, no database, no env vars. Keep under 1MB for comfortable serverless cold-start (~5,000 entries will be well under this).

### Decision 4: Batch Response (Not Streaming)

~5,000 rows ≈ 500KB JSON — within Vercel's 4.5MB response limit. Processing takes <500ms. Streaming adds complexity with no benefit.

### Decision 5: Table Virtualization (Non-Negotiable)

`@tanstack/react-virtual` — render only visible viewport rows (~20–30 at a time). Required since max row count can reach several thousand.

### Decision 6: Single Route

Entire tool lives on `app/page.tsx`. No routing needed.

---

## Directory Structure

```
src/
  app/
    page.tsx                    ← Server Component (layout shell)
    layout.tsx
    _components/
      ParameterForm.tsx          ← "use client"
      ResultsPanel.tsx           ← "use client"
      ResultsTable.tsx           ← "use client" + virtualized
      CSVDownloadButton.tsx      ← "use client"
    actions/
      runTest.ts                 ← "use server" (Server Action)
  lib/
    sampler.ts                   ← pure function
    degrader.ts                  ← pure function
    rules/
      index.ts                   ← rule registry (typed)
      remove-spaces.ts
      char-sub-ocr.ts
      diacritics.ts
      word-order.ts
      abbreviation.ts
      truncation.ts
      phonetic-variants.ts
      punctuation.ts
      prefix-suffix.ts
      add-spaces.ts
  data/
    sdn.json                     ← synthetic dataset
    sdn.types.ts                 ← TypeScript interface for SDN rows
  types/
    results.ts                   ← ResultRow, RunParams interfaces
```

---

## Key Code Patterns

### Server Action
```typescript
// app/actions/runTest.ts
"use server";
import { z } from "zod";
import { sampler } from "@/lib/sampler";
import { degrader } from "@/lib/degrader";
import sdn from "@/data/sdn.json";

const RunParamsSchema = z.object({
  entityCounts: z.object({
    individual: z.number().int().min(0).max(500),
    business: z.number().int().min(0).max(500),
    vessel: z.number().int().min(0).max(500),
    aircraft: z.number().int().min(0).max(500),
  }),
  regions: z.array(z.string()).min(1),
  ruleIds: z.array(z.string()).min(1),
  clientName: z.string().min(1).max(100),
});

export async function runTest(params: unknown): Promise<ResultRow[]> {
  const validated = RunParamsSchema.parse(params);
  const sampled = sampler(sdn, validated);
  return degrader(sampled, validated.ruleIds);
}
```

### Rule Registry
```typescript
// lib/rules/index.ts
export interface DegradationRule {
  id: string;
  label: string;
  description: string;
  applicableScripts: ('latin' | 'arabic' | 'cjk' | 'cyrillic' | 'all')[];
  apply: (name: string) => string;
}

export const RULES: DegradationRule[] = [removeSpaces, charSubOcr, ...];
export const RULE_MAP = new Map(RULES.map((r) => [r.id, r]));
// CANONICAL ORDER — always apply in this order when multiple rules are active
export const CANONICAL_ORDER = RULES.map(r => r.id);
```

### useTransition for Pending State
```typescript
// app/_components/ParameterForm.tsx
"use client";
const [isPending, startTransition] = useTransition();

function handleSubmit(params: RunParams) {
  startTransition(async () => {
    const rows = await runTest(params);
    onResults(rows);
  });
}
```

---

## Suggested Build Order

```
1. Data layer (types first — shared contract)
   - Define SdnEntry type  (data/sdn.types.ts)
   - Define ResultRow + RunParams types  (types/results.ts)
   - Build synthetic sdn.json

2. Core engine (pure functions, independently testable)
   - lib/rules/index.ts + first 3-4 rule modules
   - lib/sampler.ts
   - lib/degrader.ts
   → Unit test before building any UI

3. Server Action
   - app/actions/runTest.ts
   - Zod schema for RunParams

4. UI shell
   - app/layout.tsx + app/page.tsx

5. Parameter form
   - ParameterForm.tsx + wire to runTest with useTransition

6. Results display
   - ResultsTable.tsx (virtualized from day 1)
   - ResultsPanel.tsx

7. CSV download
   - CSVDownloadButton.tsx (depends on result shape being stable)

8. Remaining rule implementations
   - All rule modules in lib/rules/

9. Polish
   - Error handling, loading skeleton, rule help text, Crowe branding
```

**Critical dependency:** `SdnEntry` and `ResultRow` types MUST be defined before any other module — they are the shared contract.

---

## Anti-Patterns to Avoid

1. **Client-side computation** — ships rule set and dataset to browser; keep in Server Action
2. **Storing results in URL state** — 5000-row results exceed URL length limits; use `useState`
3. **Monolithic rule file** — one giant switch/case is untestable; each rule is its own module
4. **Untyped SDN data** — always import `sdn.json` against a typed `SdnEntry` interface
5. **`useEffect` for Server Action calls** — call from `onSubmit` wrapped in `startTransition`
6. **No table virtualization** — rendering 2000+ DOM rows causes layout thrashing; always virtualize
