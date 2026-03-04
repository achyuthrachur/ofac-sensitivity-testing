# Phase 4: Server Action - Research

**Researched:** 2026-03-04
**Domain:** Next.js Server Actions, Zod v4 validation, Jaro-Winkler similarity scoring
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Return type is a discriminated union: `{ ok: true; rows: ResultRow[] } | { ok: false; error: string }` — type named `ActionResult`, defined in `src/types/index.ts`
- Zero rows = `{ ok: true; rows: [] }` — not an error condition
- `'use server'` directive on action file — true Next.js App Router Server Action
- Jaro-Winkler via **talisman** npm package, both strings uppercase-normalized before scoring
- Similarity threshold is `DEFAULT_CATCH_THRESHOLD` from `src/lib/constants.ts` (0.85) — hardcoded, not a RunParams field
- `caught` = `similarityScore > DEFAULT_CATCH_THRESHOLD`
- Verification: integration test only (no placeholder UI wired to page.tsx)
- Vercel plan: Hobby (10s timeout) — timing assertion in integration test, < 5s for worst case 500×10
- Fallback if timing fails: lower `MAX_ENTITY_COUNT` from 500 to 200

### Claude's Discretion

- Exact Zod schema shape for `RunParams` validation (min/max values, required fields)
- Test file location and naming (consistent with Phase 3 pattern)
- Error message strings returned in `{ ok: false; error: string }`

### Deferred Ideas (OUT OF SCOPE)

- Interactive match threshold slider (ANAL-01) — v2; would require `matchThreshold` in `RunParams` and slider in Phase 5
- Explicit in-action abort/timeout guard — only if benchmark shows > 5s; prefer cap on `MAX_ENTITY_COUNT` first
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FORM-05 | Form shows loading state while results generate; submit button disabled to prevent duplicate submissions | Phase 4 delivers the working `runTest` action contract that Phase 5 wires to `useActionState` / `startTransition`. The action's discriminated-union return type, Zod validation, and tested pipeline directly enable FORM-05's loading/disabled behavior in Phase 5. |
</phase_requirements>

---

## Summary

Phase 4 implements `app/actions/runTest.ts` — a Next.js App Router Server Action that is the glue between the transformation engine (Phase 3) and the parameter form (Phase 5). It validates `RunParams` with Zod, invokes `sampleEntries` + the rule engine, scores each original→degraded pair with Jaro-Winkler similarity, and returns a typed `ActionResult` discriminated union. Phase 5 consumes the returned type to drive its loading/disabled state (FORM-05).

The scope is narrow and well-bounded. All the hard work is already done: `ruleMap`, `CANONICAL_RULE_ORDER`, and `sampleEntries` exist and are tested. Phase 4 writes one orchestration function, one test file, and one new type alias. No UI, no form, no placeholder pages.

The most important pre-flight concerns are: (1) talisman is not yet installed — it must be added as a dependency; (2) the Zod v4 import path differs slightly from Zod v3; and (3) the vitest.config.ts `include` glob currently only covers `src/**/__tests__/**/*.test.ts`, so if the integration test lives under `app/actions/__tests__/`, the config must be extended.

**Primary recommendation:** Keep all test files under `src/lib/__tests__/` (consistent with Phase 3, already in the Vitest glob) by placing the integration test at `src/lib/__tests__/runTest.integration.test.ts` and importing `runTest` from `app/actions/runTest.ts`. This avoids any vitest.config.ts changes.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zod | 4.3.6 (installed) | Validate `RunParams` at the action boundary | Already in project; v4 installed; discriminated union result from `safeParse` |
| talisman | 1.1.4 (to install) | Jaro-Winkler similarity scoring | Zero-dependency, tree-shakeable, well-tested; locked decision from CONTEXT.md |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (project internals) | — | `sampleEntries`, `ruleMap`, `CANONICAL_RULE_ORDER`, `RULE_LABELS` | Already implemented and tested in Phase 3 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| talisman | natural (npm) | natural is heavier (~2MB bundle), talisman is ~2KB for jaro-winkler module alone |
| talisman | jaro-winkler (npm) | jaro-winkler package is unmaintained (last publish 2016); talisman is actively maintained |
| talisman | hand-rolled | Jaro-Winkler has subtle edge cases (prefix scaling, boost threshold) — don't hand-roll |

**Installation:**
```bash
npm install talisman
```

---

## Architecture Patterns

### File Locations

```
app/
└── actions/
    └── runTest.ts          # 'use server' action — Phase 4 creates this

src/
├── types/
│   └── index.ts            # Add ActionResult type alias here (alongside ResultRow)
└── lib/
    └── __tests__/
        └── runTest.integration.test.ts  # Integration test — lives in existing Vitest glob
```

### Pattern 1: Next.js App Router Server Action

**What:** A module with `'use server'` at the top. Every exported async function becomes a server action callable from client components via `useActionState` or `startTransition`.

**When to use:** Any async server-side logic triggered by user interaction. Exactly what Phase 4 is.

```typescript
// app/actions/runTest.ts
'use server';

import { z } from 'zod';
import sdnData from '@data/sdn.json';
import type { SdnEntry, RunParams, ResultRow, ActionResult } from '@/types';
import { REGION_VALUES, ENTITY_TYPE_VALUES } from '@/types';
import { sampleEntries } from '@/lib/sampler';
import { ruleMap, CANONICAL_RULE_ORDER, RULE_LABELS } from '@/lib/rules';
import { DEFAULT_CATCH_THRESHOLD, MAX_ENTITY_COUNT } from '@/lib/constants';
import jaroWinkler from 'talisman/metrics/jaro-winkler';

// Zod schema mirrors RunParams — defines the validation boundary
const RunParamsSchema = z.object({
  entityCounts: z.object({
    individual: z.number().int().min(0).max(MAX_ENTITY_COUNT),
    business:   z.number().int().min(0).max(MAX_ENTITY_COUNT),
    vessel:     z.number().int().min(0).max(MAX_ENTITY_COUNT),
    aircraft:   z.number().int().min(0).max(MAX_ENTITY_COUNT),
  }),
  regions: z.array(z.enum([
    REGION_VALUES.arabic,
    REGION_VALUES.cjk,
    REGION_VALUES.cyrillic,
    REGION_VALUES.latin,
  ])).min(1),
  ruleIds: z.array(z.string()).min(1),
  clientName: z.string().trim().min(1).max(100),
});

export async function runTest(params: unknown): Promise<ActionResult> {
  // 1. Validate
  const parsed = RunParamsSchema.safeParse(params);
  if (!parsed.success) {
    return { ok: false, error: z.prettifyError(parsed.error) };
  }
  const validParams = parsed.data as RunParams;

  // 2. Sample
  const sampled = sampleEntries(sdnData as SdnEntry[], validParams);
  if (sampled.length === 0) {
    return { ok: true, rows: [] };
  }

  // 3. Apply rules + score
  const rows: ResultRow[] = [];
  for (const entry of sampled) {
    for (const ruleId of CANONICAL_RULE_ORDER) {
      if (!validParams.ruleIds.includes(ruleId)) continue;
      const degraded = ruleMap[ruleId](entry);
      if (degraded === null) continue;
      const a = entry.name.toUpperCase();
      const b = degraded.toUpperCase();
      const similarityScore = jaroWinkler(a, b);
      rows.push({
        id: `${entry.id}-${ruleId}`,
        originalName: entry.name,
        entityType: entry.entityType,
        region: entry.region,
        degradedVariant: degraded,
        ruleId,
        ruleLabel: RULE_LABELS[ruleId],
        similarityScore,
        caught: similarityScore > DEFAULT_CATCH_THRESHOLD,
      });
    }
  }

  return { ok: true, rows };
}
```

### Pattern 2: ActionResult Type

**What:** Discriminated union added to `src/types/index.ts`.

```typescript
// src/types/index.ts — add after ResultRow definition
export type ActionResult =
  | { ok: true; rows: ResultRow[] }
  | { ok: false; error: string };
```

**Why discriminated union, not throwing:** Next.js Server Actions return values to the client. Throwing causes the framework to serialize a generic error. The discriminated union gives Phase 5 a typed, predictable contract with a single code path for both validation failures and runtime errors.

### Pattern 3: Talisman Jaro-Winkler Import

**What:** Talisman uses a default export from a deep module path.

```typescript
// Correct — default import from the specific metric module
import jaroWinkler from 'talisman/metrics/jaro-winkler';

// Usage: returns a number in [0, 1] where 1 = identical
const score: number = jaroWinkler('AL QAEDA', 'ALQAEDA');
// → ~0.972 (high similarity — spaces removed but otherwise identical)

const score2: number = jaroWinkler('MULLER', 'MÜLLER');
// → ~0.944
```

**Note:** talisman is a CommonJS package (no named `similarity` export at the default level). The default export IS the similarity function. TypeScript may require `"esModuleInterop": true` for default imports — this is already set in the project's `tsconfig.json`.

### Pattern 4: Zod v4 safeParse

**What:** Installed version is Zod 4.3.6. The main entry `import { z } from 'zod'` works and resolves to the v4 classic API. The `safeParse` return type is a discriminated union on `success`.

```typescript
import { z } from 'zod';

const result = schema.safeParse(input);
if (!result.success) {
  // result.error is a ZodError
  const message = z.prettifyError(result.error); // Zod v4 built-in
  return { ok: false, error: message };
}
// result.data is typed as the schema's output
```

**Zod v4 breaking change to know:** `safeParse` no longer accepts a `path` parameter. Error maps now use `error` (not `message` or `errorMap`) in schema definitions. Both of these only matter if copying Zod v3 patterns from the internet — write fresh v4 code.

### Anti-Patterns to Avoid

- **Throwing inside the action:** Phase 5 would need a try/catch and cannot use the typed discriminated union. Return `{ ok: false }` instead.
- **Importing from individual rule files:** Phase 4 must import ONLY from `@/lib/rules` (the barrel). Direct imports from `@/lib/rules/space-removal` etc. would bypass the public API contract.
- **Hardcoding region or entity type strings:** Always derive from `REGION_VALUES` and `ENTITY_TYPE_VALUES` const objects so the Zod enum stays in sync with the TypeScript types.
- **Scoring identical strings (degraded === original name):** Some rules (e.g., space-removal on a single-token name) return `null` for inapplicable cases. The `null` guard in the loop handles this, but never score when `degraded === entry.name` — it adds a trivially-caught row with score 1.0 and distorts catch-rate stats.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Jaro-Winkler scoring | Custom string distance algorithm | `talisman/metrics/jaro-winkler` | Jaro-Winkler has non-obvious edge cases: prefix scaling factor (p=0.1), boost threshold (default 0.7), character transposition counting. A hand-rolled version will silently produce wrong numbers. |
| Input validation | Manual `typeof` / bounds checks | Zod schema | Zod already installed; schema produces human-readable error messages automatically via `z.prettifyError()` |

**Key insight:** The two "don't hand-roll" items in this phase (similarity scoring and input validation) are both covered by libraries already decided. The engine loop itself is simple iteration with no external complexity — that part IS hand-rolled by design.

---

## Common Pitfalls

### Pitfall 1: talisman Not Yet Installed

**What goes wrong:** Build and tests fail with `Cannot find module 'talisman/metrics/jaro-winkler'`.

**Why it happens:** talisman is not in package.json — it was decided in the CONTEXT.md discussion but not yet installed.

**How to avoid:** `npm install talisman` is Wave 0 of Phase 4's first plan. Verify it appears in `package.json` dependencies before writing the action.

**Warning signs:** Any import of talisman producing a module-not-found error.

---

### Pitfall 2: Vitest glob does not cover app/actions/__tests__/

**What goes wrong:** Tests written under `app/actions/__tests__/` are silently ignored — `npm test` passes with 0 collected tests from that file.

**Why it happens:** `vitest.config.ts` has `include: ['src/**/__tests__/**/*.test.ts']`. The `app/` directory is outside the `src/` glob.

**How to avoid:** Place the integration test at `src/lib/__tests__/runTest.integration.test.ts` and import `runTest` from its real location (`../../app/actions/runTest` relative path, or configure an `@actions/*` alias). No vitest.config.ts change required.

**Alternative:** Extend the vitest.config.ts glob to `['src/**/__tests__/**/*.test.ts', 'app/**/__tests__/**/*.test.ts']`. Either works; staying in `src/` is simpler.

---

### Pitfall 3: 'use server' Directive and Vitest

**What goes wrong:** Concern that `'use server'` at the top of the action file will cause the Vitest test import to fail.

**Why it doesn't:** In a Node.js runtime (which Vitest uses with `environment: 'node'`), `'use server'` is a plain string expression statement — identical to `'use strict'`. It has no runtime effect outside Next.js's bundler. The function is directly importable and callable in tests.

**Warning signs:** If `import { runTest } from '@/app/actions/runTest'` causes an error, it would be a module resolution issue (alias not configured), not the directive.

---

### Pitfall 4: talisman TypeScript Types

**What goes wrong:** TypeScript errors on `import jaroWinkler from 'talisman/metrics/jaro-winkler'` — "Could not find a declaration file".

**Why it happens:** talisman ships a `index.d.ts` but may not ship deep `.d.ts` files for every sub-module path.

**How to avoid:** Add a local declaration shim if needed:

```typescript
// src/types/talisman.d.ts (only if TypeScript complains)
declare module 'talisman/metrics/jaro-winkler' {
  const jaroWinkler: (a: string, b: string) => number;
  export default jaroWinkler;
}
```

This is a narrow, accurate declaration — the function takes two strings and returns a number in [0, 1].

---

### Pitfall 5: Uppercase Normalization Side Effect on CJK

**What goes wrong:** `entry.name.toUpperCase()` on a CJK name like `张 伟` (Zhang Wei) is a no-op — CJK characters have no case — but the call is harmless. However, if talisman has internal encoding assumptions that fail on non-ASCII input, the score could be NaN or undefined.

**Why it matters:** NaN propagates silently. `NaN > 0.85` is `false`, so `caught` would always be `false` for CJK names.

**How to avoid:** In the integration test, assert that `similarityScore` is a finite number in [0, 1] for at least one CJK fixture. If talisman returns NaN, switch to a JS-native implementation or add a guard: `const score = Number.isFinite(raw) ? raw : 0`.

---

### Pitfall 6: Zod v4 vs v3 Error API

**What goes wrong:** Code copied from Zod v3 examples uses `parsed.error.flatten()` or `parsed.error.format()`, which may behave differently or have moved in Zod v4.

**How to avoid:** Use `z.prettifyError(parsed.error)` (Zod v4 built-in) to get a human-readable string for the `error` field. This produces a clean single string suitable for `{ ok: false; error: string }`. Do not call `.message` directly on the ZodError — it returns the raw JSON structure.

---

## Code Examples

### Integration Test Pattern (consistent with Phase 3)

```typescript
// src/lib/__tests__/runTest.integration.test.ts
import { describe, it, expect } from 'vitest';
import { runTest } from '../../../app/actions/runTest';
import type { ActionResult } from '@/types';
import { CANONICAL_RULE_ORDER } from '@/lib/rules';

const FIXTURE_PARAMS = {
  entityCounts: { individual: 10, business: 0, vessel: 0, aircraft: 0 },
  regions: ['arabic', 'latin'] as const,
  ruleIds: CANONICAL_RULE_ORDER.slice(),
  clientName: 'Test Client',
};

describe('runTest server action', () => {
  it('returns ok: true with rows for a valid RunParams fixture', async () => {
    const result: ActionResult = await runTest(FIXTURE_PARAMS);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows.length).toBeGreaterThan(0);
    }
  });

  it('each row has similarityScore in [0, 1] and caught is boolean', async () => {
    const result: ActionResult = await runTest(FIXTURE_PARAMS);
    if (result.ok) {
      for (const row of result.rows) {
        expect(row.similarityScore).toBeGreaterThanOrEqual(0);
        expect(row.similarityScore).toBeLessThanOrEqual(1);
        expect(Number.isFinite(row.similarityScore)).toBe(true);
        expect(typeof row.caught).toBe('boolean');
      }
    }
  });

  it('returns ok: false for invalid params (count above MAX)', async () => {
    const bad = { ...FIXTURE_PARAMS, entityCounts: { individual: 9999, business: 0, vessel: 0, aircraft: 0 } };
    const result: ActionResult = await runTest(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(typeof result.error).toBe('string');
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it('returns ok: false for completely invalid input', async () => {
    const result: ActionResult = await runTest(null);
    expect(result.ok).toBe(false);
  });

  it('returns ok: true with empty rows when all counts are zero', async () => {
    const zeroParams = {
      ...FIXTURE_PARAMS,
      entityCounts: { individual: 0, business: 0, vessel: 0, aircraft: 0 },
    };
    const result: ActionResult = await runTest(zeroParams);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows).toHaveLength(0);
    }
  });

  it('worst-case benchmark: 500 names × 10 rules completes in < 5000ms', async () => {
    const worstCase = {
      entityCounts: { individual: 500, business: 0, vessel: 0, aircraft: 0 },
      regions: ['arabic', 'latin', 'cjk', 'cyrillic'] as const,
      ruleIds: CANONICAL_RULE_ORDER.slice(),
      clientName: 'Benchmark',
    };
    const start = Date.now();
    const result: ActionResult = await runTest(worstCase);
    const elapsed = Date.now() - start;
    expect(result.ok).toBe(true);
    expect(elapsed).toBeLessThan(5000);
  }, 10_000); // 10s Vitest timeout (longer than assertion threshold for headroom)
});
```

### ResultRow.id Stable Key Pattern

```typescript
// Produces: "ind-ara-001-space-removal"
rows.push({
  id: `${entry.id}-${ruleId}`,
  // ...
});
```

The `entry.id` values from `data/sdn.json` are already unique per entry. Appending `-${ruleId}` makes each `ResultRow.id` globally unique across the entire result array, satisfying React's key requirement in Phase 6.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import z from 'zod'` (v3 default) | `import { z } from 'zod'` (v4 named export also works; `import z from 'zod'` still works via `export default z`) | Zod v4 (2024) | No change needed — both work; named import is cleaner |
| `parsed.error.format()` or `.flatten()` | `z.prettifyError(parsed.error)` | Zod v4 | prettifyError returns a clean string; format/flatten still exist but are verbose |
| Zod `errorMap` param | Zod `error` param | Zod v4 | Param renamed; old name emits deprecation warning |

**Deprecated/outdated:**
- Zod v3 patterns for error message extraction: `.message` on ZodError returns JSON, not a clean string. Use `z.prettifyError()` in v4.

---

## Open Questions

1. **talisman and non-ASCII (CJK) inputs**
   - What we know: talisman's jaro-winkler implements the standard algorithm which operates on Unicode code points, not bytes. Should work on CJK.
   - What's unclear: No CJK-specific test found in talisman's own test suite. Score may technically be "correct" but semantically meaningless for ideographic scripts.
   - Recommendation: Add a CJK assertion in the integration test. If `similarityScore` is NaN or > 1.0, add a numeric guard before pushing to rows. The UX impact is low — CJK names get few rule hits anyway (most rules target Latin/Arabic transliteration patterns).

2. **talisman TypeScript typings depth**
   - What we know: talisman ships an `index.d.ts`. Deep path imports (`talisman/metrics/jaro-winkler`) may or may not have `.d.ts` coverage.
   - What's unclear: Whether TypeScript will resolve the type automatically or require a manual `declare module` shim.
   - Recommendation: Attempt the import first; add the minimal shim in `src/types/talisman.d.ts` only if TypeScript complains. This is a Wave 0 step — resolve before writing the action.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (exists, root of project) |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-05 | `runTest` returns typed `ActionResult` enabling Phase 5 to show loading/disabled state | Integration | `npm test -- src/lib/__tests__/runTest.integration.test.ts` | Wave 0 |
| FORM-05 | Valid params produce `{ ok: true; rows: ResultRow[] }` with correct field shapes | Integration | `npm test -- src/lib/__tests__/runTest.integration.test.ts` | Wave 0 |
| FORM-05 | Invalid params produce `{ ok: false; error: string }` (not a thrown exception) | Integration | `npm test -- src/lib/__tests__/runTest.integration.test.ts` | Wave 0 |
| FORM-05 | Worst-case 500×10 pipeline completes in < 5s (Vercel Hobby 10s timeout safety margin) | Integration (timed) | `npm test -- src/lib/__tests__/runTest.integration.test.ts` | Wave 0 |

**Note on FORM-05 traceability:** FORM-05 is "Form shows loading/disabled state while `runTest` is pending." The loading/disabled UI is Phase 5's concern. Phase 4's responsibility is to deliver a working, tested `ActionResult` contract so that Phase 5 can safely use `useActionState`/`startTransition` against it. The integration tests prove the contract is sound before Phase 5 touches it.

### Sampling Rate

- **Per task commit:** `npm test -- src/lib/__tests__/runTest.integration.test.ts`
- **Per wave merge:** `npm test` (full suite — all Phase 3 rules + sampler + new integration test)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/__tests__/runTest.integration.test.ts` — covers all FORM-05 behaviors above
- [ ] `src/types/talisman.d.ts` — type shim for talisman deep import (create only if TypeScript complains; not guaranteed to be needed)
- [ ] talisman install: `npm install talisman` — package not yet in `package.json`

---

## Sources

### Primary (HIGH confidence)

- Installed `node_modules/zod/index.js` — confirmed Zod v4.3.6 is installed; `import { z } from 'zod'` resolves to v4 classic API
- Installed `node_modules/zod/src/v4/classic/tests/error.test.ts` — confirmed `safeParse` returns `{ success, error }` discriminated union; `z.prettifyError` is real v4 API
- `src/types/index.ts` — confirmed existing type definitions for `ResultRow`, `RunParams`, `SdnEntry`, `Region`, `EntityType`
- `src/lib/rules/index.ts` — confirmed `ruleMap`, `CANONICAL_RULE_ORDER`, `RULE_LABELS`, `RuleId` public API
- `src/lib/sampler.ts` — confirmed `sampleEntries(data, params, seed?)` signature
- `src/lib/constants.ts` — confirmed `DEFAULT_CATCH_THRESHOLD = 0.85`, `MAX_ENTITY_COUNT = 500`
- `vitest.config.ts` — confirmed `include: ['src/**/__tests__/**/*.test.ts']`, `environment: 'node'`
- `tsconfig.json` — confirmed `esModuleInterop: true` (enables talisman default import)

### Secondary (MEDIUM confidence)

- WebSearch (npm registry): talisman v1.1.4, `import jaroWinkler from 'talisman/metrics/jaro-winkler'`, returns number in [0, 1]
- WebSearch (Zod docs): Zod v4 release notes confirming `z.prettifyError`, `safeParse` discriminated union shape, and `error` param replacing `errorMap`

### Tertiary (LOW confidence)

- WebSearch (Next.js GitHub issues #53065): `'use server'` directive does not cause Vitest node-environment test failures — treated as a string expression, not processed by the bundler. No official docs confirm this directly; inferred from the fact that the directive is a string literal at the JS level.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Zod v4 verified in node_modules; talisman v1.1.4 confirmed via npm search with function signature
- Architecture: HIGH — all upstream APIs (ruleMap, sampleEntries, types) read directly from source; patterns derived from actual installed code
- Pitfalls: MEDIUM — 'use server' testing behavior inferred from language semantics and issue discussion, not official docs; talisman TypeScript types unconfirmed until install

**Research date:** 2026-03-04
**Valid until:** 2026-06-04 (stable; talisman and Zod are not fast-moving in these APIs)
