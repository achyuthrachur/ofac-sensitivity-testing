# Phase 15: Architecture Foundation — Research

**Researched:** 2026-03-06
**Domain:** Next.js 16 Web Workers, directory scaffolding, type contracts, synthetic data design
**Confidence:** HIGH for directory structure, tab wiring, type contracts, stub design; MEDIUM for Web Worker Turbopack compatibility (issue closed but empirical Vercel confirmation still required by Phase 15 spike)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCREEN-01 | Screening Mode opens with a pre-loaded synthetic client name list already loaded and ready to screen (standalone demo — no upload required) | `src/data/clientNames.ts` static array; ScreeningMode tab reads it on mount with no server call |
| SCREEN-06 | Each input name is scored against all SDN entries using JW + DM + TSR; best match retained with winning algorithm (FOUNDATION ONLY — Phase 15 delivers type scaffold and Web Worker skeleton, not the scoring logic) | `src/types/screening.ts` MatchResult interface; `src/lib/workers/screening.worker.ts` stub |
| SCREEN-07 | Five risk tiers based on match score (FOUNDATION ONLY — Phase 15 delivers RiskTier enum and threshold constants, not the tier assignment logic) | RiskTier enum + TIER_THRESHOLDS constant in `src/lib/constants.ts` |
</phase_requirements>

---

## Summary

Phase 15 is a spike-and-scaffold phase. It has two independent deliverables: (1) empirically proving that the 2.85M-comparison compute model is feasible on the actual Vercel production deployment within the 10-second Hobby-plan timeout, and (2) creating the isolated directory structure that all subsequent v3.0 phases depend on.

The single highest-risk item is Web Worker support under Next.js 16 with Turbopack as the default bundler. Research confirms that the `new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })` pattern was broken under Turbopack (GitHub issue #62650, opened Feb 2024) but is now closed as resolved. The exact Next.js version that fixed it is not documented in search results, so empirical confirmation on the live deployment is mandatory. A server-action batching fallback (1,000 names per call) is the validated alternative if the Web Worker approach fails on Vercel.

The directory structure, type stubs, and synthetic client name list are all low-risk mechanical work with clear, verified patterns from the existing codebase.

**Primary recommendation:** Create all scaffolding files first (directory structure, type stubs, synthetic data, tab stub). Then deploy the benchmark commit to Vercel and measure. The benchmark result drives the final architecture choice for Phase 16+.

---

## Standard Stack

### Core (no new installs for Phase 15 foundation work)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `talisman` | `^1.1.4` (installed) | JW scoring in the benchmark | Already verified in codebase; same import used in `runTest.ts` |
| Web Worker API | Browser native | Off-main-thread compute | Eliminates Vercel 10s timeout as a constraint |
| `comlink` | `^4.4.1` | Typed async wrapper for the Web Worker | 3KB; eliminates raw `postMessage`/`onmessage` boilerplate; Google Chrome Labs maintained |

### Supporting (Phase 15 only — installs deferred to later phases)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `comlink` | `^4.4.1` | Worker messaging — install in Phase 15 alongside the worker scaffold | Required in Phase 15 if Web Worker approach is confirmed |

### What NOT to Install in Phase 15

- `double-metaphone` standalone — already in talisman
- `fuzzball` — Token Sort Ratio is 10 lines of TypeScript
- `recharts`, `jspdf`, SheetJS — deferred to Phases 20–22

**Installation (Phase 15 only):**
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npm install comlink
```

---

## Architecture Patterns

### Recommended Directory Structure

Phase 15 creates this skeleton. No files outside this structure are modified except the additive changes to `tool/page.tsx`, `src/lib/constants.ts`, and the new `src/types/screening.ts`.

```
src/
├── types/
│   ├── index.ts              ← UNCHANGED — v2.0 types never modified
│   └── screening.ts          ← NEW — all v3.0 type contracts live here
├── data/
│   └── clientNames.ts        ← NEW — synthetic pre-loaded demo list
├── lib/
│   ├── constants.ts          ← ADDITIVE — RiskTier thresholds appended at end
│   ├── workers/
│   │   └── screening.worker.ts  ← NEW — stub (Phase 15), implemented in Phase 16
│   ├── screening/
│   │   └── index.ts          ← NEW stub — exports placeholder for screeningScorer
│   └── simulation/
│       └── index.ts          ← NEW stub — exports placeholder for simulationEngine
└── app/
    └── tool/
        └── page.tsx          ← ADDITIVE — add Screening Mode tab trigger + content
```

### Pattern 1: Web Worker in a Next.js 16 App Router Client Component

**What:** A `'use client'` component instantiates the Web Worker inside `useEffect` (never at module top level), wraps it with Comlink, and cleans up on unmount.

**When to use:** Any component that triggers the screening computation loop.

**Critical constraint for Next.js 16 + Turbopack:** The `new Worker(new URL(...), { type: 'module' })` pattern requires `type: 'module'` for TypeScript worker files. The `import.meta.url` issue with Turbopack (#62650) is listed as closed. If the Phase 15 benchmark build fails with Turbopack, fall back to `next build --webpack` in `package.json` scripts — or set `turbopack: false` in `next.config.ts`.

```typescript
// Source: https://park.is/blog_posts/20250417_nextjs_comlink_examples/
// Pattern: useRef for both the Comlink remote AND the raw Worker instance

'use client';
import { useEffect, useRef } from 'react';
import * as Comlink from 'comlink';
import type { ScreeningWorkerApi } from '@/lib/workers/screening.worker';

export function useScreeningWorker() {
  const workerRef = useRef<Worker | null>(null);
  const apiRef = useRef<Comlink.Remote<ScreeningWorkerApi> | null>(null);

  useEffect(() => {
    // Worker constructor MUST be inside useEffect — window.Worker is undefined during SSR
    workerRef.current = new Worker(
      new URL('../../lib/workers/screening.worker.ts', import.meta.url),
      { type: 'module' }
    );
    apiRef.current = Comlink.wrap<ScreeningWorkerApi>(workerRef.current);

    return () => {
      apiRef.current?.[Comlink.releaseProxy]();
      workerRef.current?.terminate();
    };
  }, []);

  return apiRef;
}
```

**Worker file pattern:**
```typescript
// src/lib/workers/screening.worker.ts
// Source: https://github.com/GoogleChromeLabs/comlink
import * as Comlink from 'comlink';

// Phase 15: stub — implemented in Phase 16
export interface ScreeningWorkerApi {
  screenNames(inputNames: string[], sdnEntries: unknown[]): Promise<unknown[]>;
}

const workerApi: ScreeningWorkerApi = {
  async screenNames(_inputNames, _sdnEntries) {
    throw new Error('Not implemented — Phase 16');
  },
};

Comlink.expose(workerApi);
```

### Pattern 2: Server-Action Batching Fallback (≤1,000 names per call)

**What:** If the Web Worker approach fails the Phase 15 benchmark (Turbopack compatibility, MIME type error, or Vercel production issue), fall back to sequential server-action calls with 1,000-name batches.

**When to use:** Phase 15 benchmark shows the Web Worker cannot be deployed, OR if names ≤1,000 (no Worker needed).

```typescript
// Fallback architecture — runs in Phase 15 benchmark as the comparison arm
// Batch client-side, accumulate results
async function screenNamesViaServerAction(names: string[]): Promise<void> {
  const BATCH_SIZE = 1000;
  const batches = chunk(names, BATCH_SIZE);
  for (let i = 0; i < batches.length; i++) {
    const batchResult = await runScreeningBatch(batches[i]);
    // accumulate...
  }
}
```

**Timeout math for Vercel Hobby plan (10s limit):**
- Existing benchmark: 500 names × 10 rules × 1 algorithm = 5,000 JW ops in ~53ms → ~94,000 JW ops/sec
- 1,000 names × 285 SDN entries × 3 algorithms = 855,000 operations → estimated 4–9s
- 1,000-name batch is borderline; 500-name batch is safe
- Phase 15 spike must measure actual time for 1,000-name batch on live Vercel

### Pattern 3: Tab Addition to tool/page.tsx (Minimal Change)

**What:** Adds a "Screening Mode" tab trigger and content slot to the existing `<Tabs>` component in the right panel. The tab is always visible — not conditional on `rows.length > 0` like the current Results/Engine Docs tabs.

**When to use:** Phase 15 only — tab wiring before any screening logic exists.

The existing tab pattern lives inside the `rows.length === 0` branch (renders `EngineExplanationPanel` when no results), and the `<Tabs>` block when results exist. Phase 15 restructures this so the outer layout always has a top-level `<Tabs>` with three triggers: Sensitivity Test, Screening Mode, and (later) Simulation.

```tsx
// Current structure in tool/page.tsx (right panel):
{rows.length === 0 ? (
  <EngineExplanationPanel />
) : (
  <Tabs defaultValue="results">
    <TabsTrigger value="results">Results</TabsTrigger>
    <TabsTrigger value="explanation">Engine Docs</TabsTrigger>
    ...
  </Tabs>
)}

// Phase 15 target structure — top-level tabs, Sensitivity Test tab conditional internally:
<Tabs defaultValue="sensitivity">
  <TabsList>
    <TabsTrigger value="sensitivity">Sensitivity Test</TabsTrigger>
    <TabsTrigger value="screening">Screening Mode</TabsTrigger>
  </TabsList>
  <TabsContent value="sensitivity">
    {rows.length === 0 ? (
      <EngineExplanationPanel />
    ) : (
      <Tabs defaultValue="results">
        <TabsTrigger value="results">Results</TabsTrigger>
        <TabsTrigger value="explanation">Engine Docs</TabsTrigger>
        ...nested tabs unchanged...
      </Tabs>
    )}
  </TabsContent>
  <TabsContent value="screening">
    {/* Phase 15: stub ScreeningMode component */}
    <ScreeningModeStub />
  </TabsContent>
</Tabs>
```

**Key constraint:** The `defaultValue` on the outer tabs must be `"sensitivity"` so the existing Sensitivity Test behavior is unchanged on first load. The Screening Mode tab stub must render without errors.

### Pattern 4: Stub Module Design

**What:** Stub files exist so TypeScript strict build passes and Phase 16+ can import from the correct paths without restructuring imports.

**Stub contract:** Export the type (no runtime implementation). The function body throws `new Error('Not implemented — Phase N')`.

```typescript
// src/lib/screening/index.ts — Phase 15 stub
export type { MatchResult, RiskTier } from '@/types/screening';

// Placeholder so Phase 16 can fill in the real implementation
export function screenNames(
  _inputNames: string[],
  _sdnEntries: unknown[]
): never {
  throw new Error('Not implemented — Phase 16');
}

// src/lib/simulation/index.ts — Phase 15 stub
export type { SimulationSnapshot } from '@/types/screening';

export function runSimulation(_preset: unknown): never {
  throw new Error('Not implemented — Phase 21');
}
```

TypeScript `never` return type on placeholder functions allows `tsc --noEmit` to pass without the caller needing to handle the return value — and the planner cannot accidentally use a stub in production without TypeScript catching it.

### Anti-Patterns to Avoid

- **Importing screening types from `@/types/index.ts`:** All v3.0 types go in `@/types/screening.ts`. The existing `src/types/index.ts` is read-only for v3.0.
- **Modifying `sampler.ts`, `ResultsTable.tsx`, or `runTest.ts`:** Isolation constraint from STATE.md. Any v3.0 work in these files constitutes a regression risk.
- **Instantiating `new Worker()` at module top level:** Will crash during SSR. Must be inside `useEffect`.
- **Pushing all benchmark timing to a console.log only:** The benchmark result must be visible in the Vercel Function Logs AND as a UI-visible timing display so the spike result is inspectable without SSH access.
- **Making the Screening Mode tab conditional on a results state:** The tab must always be visible after Phase 15.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Worker message serialization | Custom postMessage protocol | `comlink` | Handles async RPC, TypeScript types, proxy cleanup — 3KB |
| Tab routing between modes | New routes `/screen`, `/simulate` | shadcn `<Tabs>` (already installed) | Preserves demo narrative continuity; zero nav changes needed |
| Type stubs colliding with v2.0 types | Adding RiskTier to `src/types/index.ts` | New `src/types/screening.ts` | STATE.md locked decision: v3.0 types isolated |

**Key insight:** The isolation constraint is the most important architectural rule for Phase 15. The v2.0 codebase (57+ passing tests) must be untouched. Every new file goes in a new location.

---

## Common Pitfalls

### Pitfall 1: Web Worker Fails Under Turbopack (MIME Type Error)

**What goes wrong:** Turbopack serves the worker file with an incorrect MIME type, causing `Failed to execute 'importScripts'` or `Refused to execute script` in the browser. The same code works under `next dev` (webpack) but fails under `next build` (Turbopack default in Next.js 16).

**Why it happens:** Turbopack's Web Worker bundling took a different code path from webpack's. GitHub issue #62650 (`import.meta.url` does not work with Turbopack) was opened Feb 2024 and closed, but the exact resolved-in version is not documented.

**How to avoid:** The Phase 15 benchmark must be deployed to Vercel production (not just tested locally). If the build fails or the worker is not callable:
1. Add `{ type: 'module' }` to the Worker constructor if missing
2. If still failing: fall back to webpack with `next build --webpack` (verified to work for Web Workers with `import.meta.url`)
3. Document which path succeeded in the benchmark commit message

**Warning signs:** Console error `net::ERR_ABORTED 404` for the worker URL, or `TypeError: Failed to construct 'Worker': Script at '...' cannot be accessed from origin 'null'`.

### Pitfall 2: Worker File Imports sdnData But JSON is Not Transferable as a Module Import

**What goes wrong:** The worker file attempts `import sdnData from '@data/sdn.json'` — the `@data/*` alias is a tsconfig path alias configured in the project. Inside a Web Worker, tsconfig path aliases are resolved by the bundler at build time. If the worker file is not processed by the same bundler configuration that handles tsconfig paths, the import fails.

**Why it happens:** Web Worker files are entry points for the bundler. They must be bundled with the same alias resolution as the main bundle. Under webpack (used pre-Next.js-16), this worked automatically. Under Turbopack, the alias resolution for worker files may differ.

**How to avoid:** In the Phase 15 stub, the worker does not import sdnData — it receives the SDN entries as a `postMessage` argument from the main thread. This sidesteps the alias resolution issue entirely. The main thread imports sdnData (client component, resolved by the main bundler), then posts it to the worker.

```typescript
// Main thread passes SDN data to worker — worker does not import it directly
apiRef.current?.screenNames(inputNames, sdnEntries); // sdnEntries from main-thread import
```

### Pitfall 3: Benchmark Measures Dev Server, Not Production

**What goes wrong:** Running the benchmark against `npm run dev` (Turbopack dev server, hot reload) measures dev performance, which is 3–5× slower than production. The 10-second constraint applies to Vercel serverless function execution in production, not local development.

**Why it happens:** The natural path of least resistance is to test locally. Dev server JW performance is significantly slower than V8-compiled production bundles.

**How to avoid:** The benchmark MUST be deployed to Vercel production and measured there. The benchmark commit should include a visible timing display in the Screening Mode tab stub, so the time is observable in the browser on the production URL without needing DevTools.

### Pitfall 4: TypeScript Build Fails Due to Stub `never` Returns

**What goes wrong:** If Phase 15 stubs use `return undefined` or `return [] as unknown as MatchResult[]`, TypeScript strict mode may not catch improper use of the stub in downstream code. Worse, if the stub's return type does not match the expected call site type, `tsc --noEmit` fails.

**How to avoid:** Use the `never` return type pattern for unimplemented functions. TypeScript allows a `never`-returning function to satisfy any return type at call sites (it is assignable to all types in TypeScript's type system). The function body throws, which is consistent with `never`.

### Pitfall 5: Outer Tabs Restructure Breaks the Existing Animation Scope

**What goes wrong:** `tool/page.tsx` uses `createScope({ root: toolRoot })` to target `.form-card` elements in the left panel. This scope targets the left panel ref. The Tabs restructuring is on the right panel and does not touch the left panel or the `toolRoot` ref. However, if the file restructuring accidentally moves the `<div ref={toolRoot}>` or changes its parent, the Anime.js scope breaks.

**How to avoid:** The `toolRoot` ref and `<div ref={toolRoot}>` (left panel, 420px wide) are not modified in Phase 15. Only the right panel (`flex-1 overflow-y-auto`) receives the new `<Tabs>` wrapper.

---

## Code Examples

### Benchmark Timing Display Pattern

The benchmark must show visible timing in the Screening Mode stub UI on Vercel production.

```typescript
// Source: standard Performance API (MDN)
// Used in ScreeningModeStub.tsx for the Phase 15 benchmark

const [benchmarkResult, setBenchmarkResult] = useState<string>('');

const runBenchmark = async () => {
  const start = performance.now();
  // Run the test computation (Web Worker OR server action)
  await computeMethod(syntheticNames1000, sdnEntries);
  const elapsed = performance.now() - start;
  setBenchmarkResult(`1,000 names: ${elapsed.toFixed(0)}ms`);
};
```

### RiskTier Enum and Threshold Constants

```typescript
// src/types/screening.ts — Phase 15 foundation

export const RISK_TIER_VALUES = {
  EXACT: 'EXACT',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  CLEAR: 'CLEAR',
} as const;

export type RiskTier = (typeof RISK_TIER_VALUES)[keyof typeof RISK_TIER_VALUES];

export interface MatchResult {
  inputName: string;
  matchedSdnName: string;
  sdnId: string;
  entityType: string;
  region: string;
  country: string | null;
  jwScore: number;
  dmBonus: number;
  tsrScore: number;
  compositeScore: number;
  matchAlgorithm: 'jaro-winkler' | 'double-metaphone' | 'token-sort-ratio';
  riskTier: RiskTier;
  nameLengthPenaltyApplied: boolean;
  transformationDetected: boolean;
  normalizedInput: string;
  rawInput: string;
  // Phase 16 will populate all fields; Phase 15 stubs may leave numeric fields as 0
}

// Phase 15 only needs these — rest of MatchResult fields are Phase 16 work
export interface MatchResultStub {
  inputName: string;
  compositeScore: number;
  riskTier: RiskTier;
}
```

```typescript
// src/lib/constants.ts — additive append (never modify existing constants)

// v3.0 additions — Phase 15
export const TIER_THRESHOLDS = {
  EXACT: 0.97,
  HIGH: 0.90,
  MEDIUM: 0.80,
  LOW: 0.70,
  // CLEAR: below LOW
} as const;

export const MAX_SCREENING_NAMES = 10_000;

export const COST_OF_MISS_MULTIPLIER = 4.0; // OFAC civil penalty basis — not configurable
```

### talisman.d.ts Extension for Double Metaphone

The existing shim at `src/types/talisman.d.ts` declares only `jaro-winkler`. Extend it in Phase 15 so Phase 16 can import without a TypeScript error.

```typescript
// Append to existing src/types/talisman.d.ts
declare module 'talisman/phonetics/double-metaphone' {
  /**
   * Returns [primaryCode, secondaryCode] — both max 4 uppercase chars.
   * English-optimized. Returns ['', ''] for non-Latin script inputs.
   */
  const doubleMetaphone: (word: string) => [string, string];
  export default doubleMetaphone;
}
```

---

## Synthetic Client Name List Design

The `src/data/clientNames.ts` file must produce interesting screening results against the 290 SDN entries (160 individuals, 80 businesses, 30 vessels, 20 aircraft across Arabic/68, CJK/64, Cyrillic/60, Latin/98).

### Design Principles

1. **Demo narrative first:** The list must show a spectrum of results — some EXACT/HIGH matches that validate the screener catches dangerous matches, some CLEAR results that validate legitimate clients pass through.
2. **Region coverage:** Include names from all four linguistic regions to show the tool works across scripts.
3. **Edge cases:** A few entries that specifically test algorithm behavior (short names, word-order transposition, phonetic near-matches).
4. **Count:** 50 names — large enough to show a populated results table, small enough to complete instantly in the demo without a progress bar.

### Recommended Name Composition (50 names)

**Near-matches to SDN entries — will score EXACT or HIGH (12 names):**
These test that the screener catches real threats. Derived by slightly modifying actual SDN names from `data/sdn.json`.

| Client Name | SDN Near-Match | Expected Result |
|-------------|---------------|-----------------|
| `HASSAN IBN ALI AL-RASHIDI` | `HASSAN IBN ALI IBN OMAR AL-RASHIDI` | HIGH (missing middle segment) |
| `AHMAD KHALID AL-MASRI` | `AHMAD IBN KHALID AL-MASRI` | HIGH (IBN removed) |
| `ZHANG WEI` | `ZHANG WEI` | EXACT |
| `IGOR PETROV` | `IGOR VLADIMIROVICH PETROV` | HIGH (patronymic removed) |
| `HASSAN AL RASHIDI` | `HASSAN IBN ALI IBN OMAR AL-RASHIDI` | MEDIUM (word-order variant) |
| `AL-RASHIDI HASSAN` | `HASSAN IBN ALI IBN OMAR AL-RASHIDI` | MEDIUM (TSR catches word order) |
| `LIBIA PETROVA` | `ALEKSEI BORISOVICH SOKOLOV` | LOW (partial token match only) |
| `SERGEI IVANOV` | `SERGEI NIKOLAYEVICH IVANOV` | HIGH (patronymic removed) |
| `WANG JIANGUO` | `WANG JIANGUO` | EXACT |
| `CARLOS RODRIGUEZ` | `CARLOS EDUARDO RODRIGUEZ GARCIA` | HIGH (middle names removed) |
| `AL-ZARQAWI ABU MUSAB` | `ABU MUSAB AL-ZARQAWI` | HIGH/EXACT (TSR handles word order) |
| `LI HONG MEI` | `LI HONG MEI` | EXACT |

**Clearly unrelated names — will score CLEAR (28 names):**
Normal client names that should pass screening with high confidence.

```
ACME FINANCIAL CORP
NORTHERN TRUST ADVISORS LLC
JAMES WORTHINGTON
SARAH CHEN
MICHAEL OKONKWO
DEUTSCHE BANK AG
SUNRISE CAPITAL PARTNERS
BLUE RIDGE INVESTMENT GROUP
MARGARET HOLLOWAY
WILLIAM FITZGERALD
TOKYO ELECTRONICS LTD
PARIS ASSET MANAGEMENT
NORDIC SHIPPING AS
GLOBAL TRADE SOLUTIONS INC
AMANDA MORRISON
CHRISTOPHER PATEL
SUMMIT INFRASTRUCTURE FUND
CLEARWATER LEASING CO
JENNIFER NAKAMURA
ROBERT KOWALSKI
PACIFIC COAST VENTURES
ATLANTIC MERIDIAN BANK
HANNAH GOLDSTEIN
ETHAN BLACKWOOD
SUNRISE MARITIME GROUP
CONTINENTAL HOLDINGS PLC
RIVER VALLEY EXPORTS
ALPINE CREDIT UNION
```

**Edge cases — will exercise algorithm guards (10 names):**

```
AL              -- short name (≤6 chars, name-length penalty fires)
ALI             -- short name + DM ambiguity test
LI              -- 2-char input, DM should be skipped
IRAN BANK       -- stop-token test (TSR should filter BANK)
BANK OF HASSAN  -- stop-token test (BANK + OF both filtered)
TRADING CORP INTERNATIONAL  -- all stop tokens, falls back to JW
EP-TQA          -- aircraft registration format (matches SDN vessel/aircraft)
SEA EAGLE SHIPPING  -- vessel name near-match to SDN vessel "SEA EAGLE"
EVER HORIZON    -- vessel name near-miss to SDN "EVER GIVEN" (Low/Clear)
ATLANTIC SPIRIT MARITIME  -- near-match to SDN vessel "ATLANTIC SPIRIT"
```

**Implementation:**

```typescript
// src/data/clientNames.ts
// Pre-loaded synthetic client name list for Screening Mode demo.
// These names are designed to produce a representative spread of EXACT, HIGH,
// MEDIUM, LOW, and CLEAR results when screened against data/sdn.json.
// 50 names: 12 near-matches, 28 clear, 10 edge cases.

export const CLIENT_NAMES: string[] = [
  // Near-matches to SDN entries (expect EXACT or HIGH tier)
  'HASSAN IBN ALI AL-RASHIDI',
  'AHMAD KHALID AL-MASRI',
  'ZHANG WEI',
  'IGOR PETROV',
  'HASSAN AL RASHIDI',
  'AL-RASHIDI HASSAN',
  'SERGEI IVANOV',
  'WANG JIANGUO',
  'CARLOS RODRIGUEZ',
  'AL-ZARQAWI ABU MUSAB',
  'LI HONG MEI',
  'DMITRI VOLKOV',
  // Clearly unrelated names (expect CLEAR tier)
  'ACME FINANCIAL CORP',
  'NORTHERN TRUST ADVISORS LLC',
  'JAMES WORTHINGTON',
  'SARAH CHEN',
  'MICHAEL OKONKWO',
  'DEUTSCHE BANK AG',
  'SUNRISE CAPITAL PARTNERS',
  'BLUE RIDGE INVESTMENT GROUP',
  'MARGARET HOLLOWAY',
  'WILLIAM FITZGERALD',
  'TOKYO ELECTRONICS LTD',
  'PARIS ASSET MANAGEMENT',
  'NORDIC SHIPPING AS',
  'GLOBAL TRADE SOLUTIONS INC',
  'AMANDA MORRISON',
  'CHRISTOPHER PATEL',
  'SUMMIT INFRASTRUCTURE FUND',
  'CLEARWATER LEASING CO',
  'JENNIFER NAKAMURA',
  'ROBERT KOWALSKI',
  'PACIFIC COAST VENTURES',
  'ATLANTIC MERIDIAN BANK',
  'HANNAH GOLDSTEIN',
  'ETHAN BLACKWOOD',
  'SUNRISE MARITIME GROUP',
  'CONTINENTAL HOLDINGS PLC',
  'RIVER VALLEY EXPORTS',
  'ALPINE CREDIT UNION',
  // Edge cases (test algorithm guards and penalties)
  'AL',
  'ALI',
  'LI',
  'IRAN BANK',
  'BANK OF HASSAN',
  'TRADING CORP INTERNATIONAL',
  'EP-TQA',
  'SEA EAGLE SHIPPING',
  'EVER HORIZON',
  'ATLANTIC SPIRIT MARITIME',
];
```

---

## Benchmark Plan

### What to Measure

The Phase 15 benchmark must answer one question: **Can 10,000 names be screened against 290 SDN entries on the actual Vercel production deployment within 10 seconds?**

Two paths to test:

| Approach | How to Measure | Pass Criteria |
|----------|---------------|---------------|
| **Web Worker (primary)** | Client-side `performance.now()` around the full worker computation | 10,000 names in ≤10s |
| **Server-action batching (fallback)** | Client-side timer across sequential 1,000-name batch calls | Each 1,000-name batch in ≤8s |

### Benchmark Commit Structure

The Phase 15 benchmark is a visible UI element in the Screening Mode tab stub — NOT a hidden console.log. Reason: the benchmark must be inspectable on the Vercel production URL without DevTools.

The benchmark UI shows:
- "Run Benchmark" button
- Input: pre-generated 10,000 synthetic names (generated client-side with `Array.from({length: 10000}, (_, i) => 'CLIENT ' + i)`)
- Output: elapsed time in milliseconds for the full computation
- Both approaches (Web Worker AND 1,000-name server action batch) shown side by side

**Benchmark commit message** must record the actual measured times. Example:
```
feat(15): compute model spike — Web Worker: 3,240ms for 10k names on Vercel prod
```

### What "Pass" Means

- Web Worker approach: 10,000 names completed in ≤10,000ms total → Web Worker is confirmed as primary architecture for Phase 16+
- Server-action fallback: each 1,000-name batch completes in ≤8,000ms → batching approach is confirmed as viable
- If neither passes: escalate to discussion; Phase 16 cannot begin until compute model is proven

### Benchmark Scope for Phase 15

The Phase 15 benchmark uses a simplified scoring loop — only Jaro-Winkler (already in the codebase), not the full 3-algorithm composite (that is Phase 16 work). This is intentional: the bottleneck is the comparison count (10,000 × 290 = 2.9M), not the per-pair algorithm complexity. If JW-only passes within budget, the full 3-algorithm version must be benchmarked again in Phase 16 with a 3× compute factor applied.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Web Workers required `worker-loader` webpack plugin | Native webpack 5 `new Worker(new URL(...))` — no plugin | Next.js 11 (2021) | No custom webpack config needed |
| Turbopack did not support `import.meta.url` in workers | Issue #62650 closed (resolved) | ~2024–2025 | Web Worker pattern works in Next.js 16 Turbopack builds |
| Next.js 16 uses webpack for `next build` | Next.js 16 uses Turbopack for both `next dev` AND `next build` by default | Next.js 16 (2026) | Worker MIME type issues that only affected dev-vs-prod now affect both; empirical test on Vercel still required |
| Comlink required complex type gymnastics | `Comlink.Remote<T>` provides clean typed proxy | Comlink 4.x | Phase 15 can wire typed async interface from day one |

**Deprecated/outdated:**
- `worker-loader` webpack plugin: superseded by native webpack 5 syntax; do not install
- `next/script` with `worker` strategy: documented as "not yet stable" for App Router — do not use this path

---

## Open Questions

1. **Does `new Worker(new URL(..., import.meta.url), { type: 'module' })` work in the live Next.js 16 + Turbopack production build on Vercel?**
   - What we know: GitHub issue #62650 is closed (resolved), confirming the fix exists. Blog post from April 2025 confirms working in Next.js 15 with Comlink.
   - What's unclear: Exact resolved-in version number; whether Next.js 16's Turbopack (now default for build) introduced any regressions.
   - Recommendation: Phase 15 benchmark is the empirical test. If it fails, `next build --webpack` fallback is well-documented and reliable.

2. **Is 1,000 names per server-action batch reliably within 10s on Vercel Hobby plan?**
   - What we know: Existing benchmark is 53ms for 5,000 JW ops (~94k ops/sec). 1,000 names × 290 SDN × 3 algorithms ≈ 870k ops → extrapolated 9–10s (borderline).
   - What's unclear: Actual Vercel cold start overhead and whether the function can sustain 870k ops without throttling.
   - Recommendation: Phase 15 must measure with the actual talisman JW on Vercel production — 500-name batches may be the safe ceiling if 1,000-name batches time out.

3. **Does the `@data/sdn.json` tsconfig alias resolve inside the Web Worker?**
   - What we know: The alias works in server-side imports (`runTest.ts`). Worker files are separate bundler entry points.
   - What's unclear: Whether Turbopack handles tsconfig path aliases inside worker files the same way as in component files.
   - Recommendation: Worker stub should NOT import sdnData directly. The main thread imports it and posts it as a message payload. This is the architecturally correct pattern regardless of alias resolution status.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |
| Pattern | `src/**/__tests__/**/*.test.ts` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCREEN-01 | `CLIENT_NAMES` array is non-empty and contains string values | unit | `npm test -- clientNames` | ❌ Wave 0 |
| SCREEN-06 (foundation) | `src/types/screening.ts` exports `MatchResult` interface with required fields | type-check | `npx tsc --noEmit` | ❌ Wave 0 |
| SCREEN-07 (foundation) | `TIER_THRESHOLDS.EXACT === 0.97`, `.HIGH === 0.90`, `.MEDIUM === 0.80`, `.LOW === 0.70` | unit | `npm test -- constants` | ❌ Wave 0 |
| SCREEN-07 (foundation) | `RiskTier` union includes all five values | type-check | `npx tsc --noEmit` | ❌ Wave 0 |
| Regression | All 57+ existing tests remain green after new file additions | regression | `npm test` | ✅ exists |
| Isolation | `src/types/index.ts` is not modified (no v3.0 types leaked in) | manual | inspect file content | n/a |
| Build | `next build` (Turbopack) produces zero TypeScript errors | build | `npm run build` | n/a |

### Sampling Rate

- **Per task commit:** `npm test` (regression guard — all existing tests green)
- **Per wave merge:** `npm run build && npm test` (full TypeScript + test gate)
- **Phase gate:** `npm run build` green + benchmark Vercel URL accessible + timing displayed + existing Sensitivity Test tab produces correct results

### Manual Validation (Benchmark Spike — Cannot be Automated)

The compute model proof requires manual verification on the live Vercel production deployment:

1. Deploy Phase 15 benchmark commit to Vercel production
2. Open the production URL, navigate to Screening Mode tab
3. Click "Run Web Worker Benchmark (10k names)" — record elapsed time
4. Click "Run Server Action Benchmark (1k batch × 10)" — record elapsed time per batch
5. Document in the commit message: which approach passed, exact timing
6. If both pass: Web Worker is primary (eliminates server load, no timeout risk)
7. If only server action passes: server action batching is confirmed for Phase 16

### Wave 0 Gaps

- [ ] `src/lib/__tests__/screening-types.test.ts` — covers SCREEN-06 foundation (MatchResult shape), SCREEN-07 foundation (RiskTier enum, TIER_THRESHOLDS)
- [ ] `src/lib/__tests__/clientNames.test.ts` — covers SCREEN-01 (CLIENT_NAMES non-empty, all strings, reasonable count)
- [ ] `src/lib/__tests__/constants-v3.test.ts` — covers SCREEN-07 TIER_THRESHOLDS exact values

*(The existing `resultsUtils.test.ts` and `runTest.integration.test.ts` cover all v2.0 behavior — no changes to those files.)*

---

## Sources

### Primary (HIGH confidence)
- `src/app/tool/page.tsx` (codebase inspection 2026-03-06) — existing Tabs structure, animation scope pattern
- `src/types/index.ts` (codebase inspection 2026-03-06) — existing type contract pattern to follow
- `src/app/actions/runTest.ts` (codebase inspection 2026-03-06) — server action pattern, Zod schema, talisman import
- `src/lib/constants.ts` (codebase inspection 2026-03-06) — additive constant pattern to follow
- `vitest.config.ts` (codebase inspection 2026-03-06) — test infrastructure: environment `node`, include pattern
- `data/sdn.json` (codebase inspection 2026-03-06) — 290 entries: 160 individual, 80 business, 30 vessel, 20 aircraft; 4 regions verified
- `.planning/STATE.md` (2026-03-06) — locked architecture decisions: isolation constraint, Web Worker primary, server-action fallback at ≤1,000 names
- `.planning/research/SUMMARY.md` (2026-03-06) — compute model synthesis, talisman verification, stack decisions
- `.planning/research/PITFALLS.md` (2026-03-06) — Pitfall 1 (timeout), Pitfall 2 (memory model), Web Worker pattern
- Vercel Functions Limitations (official) — 10s Hobby timeout: https://vercel.com/docs/functions/limitations
- comlink npm — `^4.4.1`, Google Chrome Labs: https://www.npmjs.com/package/comlink
- comlink GitHub — `Comlink.expose`, `Comlink.wrap`, `Remote<T>` type pattern: https://github.com/GoogleChromeLabs/comlink

### Secondary (MEDIUM confidence)
- Next.js issue #62650 (`import.meta.url` + Turbopack) — closed/resolved: https://github.com/vercel/next.js/issues/62650
- Web Workers in Next.js 15 with Comlink (Ye Joo Park, April 2025) — `useRef` + `useEffect` + cleanup pattern, `{ type: 'module' }` required: https://park.is/blog_posts/20250417_nextjs_comlink_examples/
- Next.js 16 release — Turbopack default for dev AND build: https://nextjs.org/blog/next-16
- Next.js 16 upgrade guide — webpack opt-out via `--webpack` flag: https://nextjs.org/docs/app/guides/upgrading/version-16
- Medium: Web Workers in Next.js — `new Worker(new URL(...), { type: 'module' })` pattern confirmed working on Next.js 15.0.4: https://medium.com/@ngrato/harnessing-the-power-of-web-workers-with-next-js-350901a99a10

### Tertiary (LOW confidence — validate in Phase 15 spike)
- Extrapolated server-action timing (94k JW ops/sec from 53ms/5k ops benchmark) — must be measured on actual Vercel production, not dev server

---

## Metadata

**Confidence breakdown:**
- Directory structure / scaffolding: HIGH — direct codebase inspection, no unknowns
- Type contracts (MatchResult, RiskTier): HIGH — specification-grade from REQUIREMENTS.md + research docs
- Synthetic client name list: HIGH — designed against verified SDN dataset (290 entries inspected)
- Tab wiring pattern: HIGH — existing `<Tabs>` component usage fully inspected in `tool/page.tsx`
- Stub module design: HIGH — TypeScript `never` pattern is well-documented
- Web Worker + Turbopack (Next.js 16): MEDIUM — issue closed, blog confirms Next.js 15 working, Next.js 16 not empirically tested
- Server-action batch timing: MEDIUM — extrapolated from existing benchmark; actual Vercel production performance unverified

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (Turbopack Web Worker support is actively evolving — recheck if Phase 15 is delayed beyond 30 days)
