# Phase 7: Polish and Deployment - Research

**Researched:** 2026-03-04
**Domain:** Crowe brand CSS (Tailwind v4 CSS-first), Next.js layout composition, Vercel CLI deployment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Fonts**
- Keep Geist fonts from Google Fonts — loads fine for end users on production Vercel; only blocked on the Crowe dev machine
- No self-hosted Helvetica Now — license not available; use `'Helvetica Neue', Arial, system-ui, sans-serif` as the brand fallback stack in CSS
- **Build fix:** Remove the `next/font/google` Geist import from `layout.tsx` — replace with a plain CSS font-family stack in `globals.css`. This fixes the `npm run build` failure caused by Google Fonts being blocked on the corporate network

**Brand Depth — Full Warm Crowe Design System**
Apply all CLAUDE.md brand tokens to `globals.css` (Tailwind v4 CSS-first — no tailwind.config.ts):
- **Page background:** `#f8f9fc` (warm off-white, never pure #FFFFFF)
- **Primary text:** `#2d3142` (warm dark slate, never pure #000)
- **shadcn token overrides:** `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--accent`, `--muted`, `--border` → Crowe Indigo/Amber/tint values
- **Cards:** White (`#ffffff`) on off-white background — soft indigo-tinted shadows (`rgba(1,30,65,0.06)`), no hard borders, `border-radius: 12px`
- **Submit button (Run Test):** Amber background `#F5A800`, dark text `#011E41`, amber glow on hover
- **Indigo accents:** Page heading, card titles, header bar in Crowe Indigo Dark (`#011E41`)
- **Muted/secondary text:** `#545968` (tint-700)
- **Destructive/error:** Crowe Coral (`#E5376B`) — already partially used

**Branded Header**
- Slim top bar: Crowe Indigo Dark (`#011E41`) background
- Left: "Crowe" wordmark text in white (no image dependency)
- Right: "OFAC Sensitivity Testing" in soft white
- No navigation, no logo image file needed

**UX Refinements**
- **Score column:** Color-coded — caught scores in Crowe Teal (`#05AB8C`), missed scores in Crowe Coral (`#E5376B`). Text color only, not background
- **Remove the 'N results generated' placeholder** from `page.tsx` — redundant once the table and catch-rate summary are visible
- **Footer:** Minimal indigo-background footer — `© 2026 Crowe LLP. For demonstration purposes only.` in soft white text

**Deployment**
- **Build fix first:** Replace `next/font/google` Geist import with CSS font-family fallback → `npm run build` must pass before deployment
- **GitHub:** `achyuthrachur/ofac-sensitivity-testing` — public repo, using `gh` CLI at `C:\Users\RachurA\AppData\Local\gh-cli\bin\gh.exe`
- **Vercel:** Project name `ofac-sensitivity-testing`, link and deploy with `NODE_TLS_REJECT_UNAUTHORIZED=0` prefix
- **Target:** Live production URL on Vercel — phase not complete until URL is accessible
- **Vercel plan:** Hobby (10s function timeout — already validated at ~53ms in Phase 4 benchmark)

### Claude's Discretion
- Exact Tailwind utility class names used to apply brand tokens (extend Tailwind v4 `@theme` or use inline CSS variables)
- Exact oklch or hex values chosen for the Tailwind v4 token overrides (convert from CLAUDE.md hex values)
- Spacing adjustments between form cards and results table
- Header height and padding
- Footer padding and exact text styling

### Deferred Ideas (OUT OF SCOPE)
- Self-hosted Helvetica Now — deferred until font license is obtained
- CI/CD GitHub Actions pipeline — Phase 7 uses manual `vercel deploy`; automated deploys are a future enhancement
- Dark mode — out of scope per CLAUDE.md brand guidelines (no large black backgrounds)
- Crowe logo image — deferred until SVG asset is available
</user_constraints>

---

## Summary

Phase 7 is a pure CSS + deployment phase. All application logic (rules, server action, form, results table) is complete and green (114 tests passing). There is no new TypeScript logic to write. The work falls into four well-bounded areas: (1) fix the build-blocking `next/font/google` import, (2) apply Crowe brand tokens to `globals.css` using Tailwind v4's CSS-first `@theme` mechanism, (3) add a static header and footer in `layout.tsx`, and (4) push to GitHub and deploy to Vercel via CLI.

The technical risk is low. The existing `globals.css` already has the full Tailwind v4 `@theme inline { }` + `:root { }` structure that receives shadcn oklch tokens. Overriding those to Crowe values is a direct substitution — no new build tooling is needed. The only deployment wrinkle is the corporate network TLS proxy, which is already handled by the `NODE_TLS_REJECT_UNAUTHORIZED=0` prefix on all npm and vercel CLI commands.

**Primary recommendation:** Fix the font import first (single line removal in `layout.tsx`, single font-family rule in `globals.css`), validate `npm run build` passes, then apply brand CSS, then deploy. Never attempt deployment before the build is clean.

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App framework | Already scaffolded; App Router layout.tsx wraps all pages |
| Tailwind CSS | ^4 | Utility styles | Already installed; v4 CSS-first — no tailwind.config.ts |
| shadcn/ui | 3.8.5 | Component tokens | Already wired; `:root` CSS vars control all component colors |
| tw-animate-css | ^1.4.0 | Tailwind animation utilities | Already imported in globals.css |

### No New Packages Required

Phase 7 uses zero new npm dependencies. All brand work is pure CSS variable overrides in `globals.css`. The header and footer are plain JSX in `layout.tsx` using existing Tailwind utilities.

---

## Architecture Patterns

### Recommended File Changes

```
src/
├── app/
│   ├── globals.css       ← MODIFY: remove Geist vars; add brand tokens in @theme + :root
│   ├── layout.tsx        ← MODIFY: remove next/font/google; add <Header> + <Footer>
│   └── page.tsx          ← MODIFY: remove 'N results generated' paragraph
└── components/
    └── ResultsTable.tsx  ← MODIFY: score cell color-coding by row.caught
```

No new files are needed. Header and footer are inline JSX in `layout.tsx` — they are static markup with no interactivity, so no separate component file or `'use client'` directive is required.

### Pattern 1: Tailwind v4 CSS-First Token Override

**What:** In Tailwind v4, there is no `tailwind.config.ts`. Brand color tokens are registered in two places in `globals.css`:
- `@theme inline { }` block — registers Tailwind utility class names (e.g., `bg-crowe-indigo`, `text-crowe-amber`)
- `:root { }` block — overrides shadcn component tokens (`--primary`, `--background`, etc.)

**When to use:** All brand color and font changes go here. Never in a config file.

**Example — exact pattern for this project:**
```css
/* In globals.css — @theme inline block */
@theme inline {
  /* Replace Geist font vars with brand fallback stack */
  --font-sans: 'Helvetica Neue', Arial, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  /* Crowe brand colors as Tailwind utilities */
  --color-crowe-indigo-dark: #011E41;
  --color-crowe-indigo-core: #002E62;
  --color-crowe-amber: #F5A800;
  --color-crowe-amber-dark: #D7761D;
  --color-crowe-teal: #05AB8C;
  --color-crowe-coral: #E5376B;

  /* Page background utility */
  --color-page: #f8f9fc;

  /* Pass-through for shadcn tokens (keep existing @theme lines) */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... rest of existing @theme lines unchanged ... */
}

/* In globals.css — :root block — override shadcn oklch values to Crowe hex */
:root {
  --radius: 0.75rem;                      /* 12px — warm cards */
  --background: #f8f9fc;                  /* warm off-white page bg */
  --foreground: #2d3142;                  /* warm dark slate text */
  --card: #ffffff;                        /* white card on off-white bg = subtle float */
  --card-foreground: #2d3142;
  --popover: #ffffff;
  --popover-foreground: #2d3142;
  --primary: #011E41;                     /* Crowe Indigo Dark */
  --primary-foreground: #f6f7fa;
  --secondary: #F5A800;                   /* Crowe Amber */
  --secondary-foreground: #011E41;
  --muted: #f0f2f8;                       /* indigo wash */
  --muted-foreground: #545968;
  --accent: #F5A800;
  --accent-foreground: #011E41;
  --destructive: #E5376B;                 /* Crowe Coral */
  --border: #dfe1e8;                      /* soft border */
  --input: #dfe1e8;
  --ring: #002E62;
}
```

**Key insight:** shadcn/ui reads from these CSS variables at runtime. Changing `:root` values instantly re-skins every shadcn Button, Card, Input, Checkbox, and Label to Crowe brand — no component-level changes needed for standard theming.

### Pattern 2: Run Test Button — Amber Override

**What:** The default `Button variant="default"` will become Crowe Indigo Dark once `--primary` is set to `#011E41`. The Run Test button needs Amber instead. Override via a direct className utility.

**Example:**
```tsx
// In page.tsx — replace the existing Button className
<Button
  type="button"
  onClick={handleSubmit}
  disabled={isPending}
  className="w-full bg-crowe-amber text-crowe-indigo-dark font-semibold hover:bg-crowe-amber-dark hover:shadow-[0_4px_16px_rgba(245,168,0,0.30)] transition-all"
>
```

The `bg-crowe-amber` utility works because `--color-crowe-amber` is registered in `@theme inline`.

### Pattern 3: Header and Footer in layout.tsx

**What:** Static indigo header + footer added to `layout.tsx`. Because these are server components (no hooks, no event handlers), they need no `'use client'` directive and do not affect the client bundle.

**Example:**
```tsx
// layout.tsx — after removing Geist imports
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Slim indigo header */}
        <header className="bg-crowe-indigo-dark px-6 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-lg tracking-tight">Crowe</span>
          <span className="text-white/80 text-sm">OFAC Sensitivity Testing</span>
        </header>

        {children}

        {/* Minimal indigo footer */}
        <footer className="bg-crowe-indigo-dark px-6 py-4 text-center">
          <p className="text-white/70 text-xs">
            &copy; 2026 Crowe LLP. For demonstration purposes only.
          </p>
        </footer>
      </body>
    </html>
  );
}
```

**Critical:** Remove `${geistSans.variable} ${geistMono.variable}` from `<body className>` when removing the Geist imports.

### Pattern 4: Score Cell Color-Coding in ResultsTable.tsx

**What:** The last `<td>` in the virtualized row already renders `{Math.round(row.similarityScore * 100)}% {row.caught ? '✓' : '✗'}`. Add a conditional text color class.

**Example:**
```tsx
// ResultsTable.tsx — replace the score <td>
<td
  className={`px-3 py-2 text-sm font-mono ${
    row.caught ? 'text-crowe-teal' : 'text-crowe-coral'
  }`}
>
  {Math.round(row.similarityScore * 100)}% {row.caught ? '✓' : '✗'}
</td>
```

`text-crowe-teal` maps to `--color-crowe-teal: #05AB8C` and `text-crowe-coral` to `--color-crowe-coral: #E5376B`, both registered in `@theme inline`.

### Pattern 5: Sticky Table Header Background Update

**What:** `ResultsTable.tsx` has `<thead className="sticky top-0 z-10 bg-white">`. After the brand tokens change `--card` to white and `--background` to `#f8f9fc`, the sticky header needs to match the card background (white) to stay legible during scroll. The current `bg-white` is correct — no change needed. However the table's outer `rounded-md border` uses the shadcn `--border` token which will update automatically to `#dfe1e8`.

### Pattern 6: Card Box-Shadow Override

**What:** CLAUDE.md specifies borderless cards with indigo-tinted shadows. The existing shadcn Cards use the CSS variable `--card` for background and `--border` for borders. The border on the scroll container in `ResultsTable` (`className="rounded-md border"`) will soften automatically when `--border` is updated to `#dfe1e8`. For form Cards, shadcn's default card rendering uses a subtle border — this will also update automatically. No additional CSS needed for basic compliance. For the full "floating" card effect with shadows, add a global `.card` shadow override in `@layer base`.

**Example — add to globals.css `@layer base`:**
```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  /* Crowe card shadow — indigo-tinted, not pure black */
  [data-slot="card"] {
    box-shadow:
      0 1px 3px rgba(1, 30, 65, 0.04),
      0 6px 16px rgba(1, 30, 65, 0.04),
      0 12px 32px rgba(1, 30, 65, 0.02);
    border: none;
  }
}
```

shadcn/ui v3 uses `data-slot="card"` attribute on its Card root element — this selector safely targets only shadcn Cards without affecting other elements.

### Anti-Patterns to Avoid

- **Do not convert hex to oklch manually** — Tailwind v4 accepts hex values directly in `@theme inline` and `:root`. oklch is only required when shadcn upstream uses it (existing unchanged tokens).
- **Do not add `tailwind.config.ts`** — Tailwind v4 CSS-first; a config file is not only unnecessary but conflicts with the `@theme` approach.
- **Do not use `next/font/google` for ANY font** — the corporate TLS proxy blocks `fonts.googleapis.com` at build time on the dev machine.
- **Do not attempt Vercel deployment before `npm run build` passes** — Vercel runs the same build step; a local build failure = deployment failure.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Brand color system | Custom Tailwind config plugin | `@theme inline` CSS vars in globals.css | Tailwind v4 native, zero config overhead |
| Font loading | next/font/google call | CSS `font-family` stack in globals.css body rule | Google Fonts blocked on Crowe network at build time |
| Header/footer layout | New component files | Inline JSX in layout.tsx | Static markup, no state, no reason for separate file |
| Amber button override | Custom Button variant in shadcn | Direct Tailwind utility on className | Simpler, auditable, no variant system changes needed |
| Score color logic | CSS-in-JS or styled-components | Conditional Tailwind class string | Already using Tailwind everywhere; class string is idiomatic |

---

## Common Pitfalls

### Pitfall 1: Build Fails Because of Geist Font Import

**What goes wrong:** `npm run build` fails with a network error like `ECONNREFUSED` or `CERT_UNTRUSTED` because Next.js tries to download font metadata from `fonts.googleapis.com` during the build step on the corporate machine.

**Why it happens:** `next/font/google` fetches font subsets at build time. The Crowe network TLS inspection proxy blocks or rejects the connection.

**How to avoid:** Remove both `import { Geist, Geist_Mono } from 'next/font/google'` lines and the `const geistSans = ...` / `const geistMono = ...` declarations entirely. Simplify `<body className>` to just `className="antialiased"`. Add `font-family: 'Helvetica Neue', Arial, system-ui, sans-serif;` to the `body` rule in `globals.css`.

**Warning signs:** Any `npm run build` error mentioning `googleapis`, `google fonts`, or a TLS/network error during the fonts optimization step.

### Pitfall 2: Tailwind Utility Not Generating Because Token Not in @theme

**What goes wrong:** `bg-crowe-amber` or `text-crowe-teal` appears in JSX but renders no style. The element keeps its default background/color.

**Why it happens:** In Tailwind v4, a utility class only exists if the corresponding `--color-*` CSS variable is declared inside `@theme inline { }`. Variables in `:root { }` alone are NOT scanned by Tailwind — they only override shadcn internal values.

**How to avoid:** Every custom color used as a Tailwind utility MUST appear in `@theme inline { }` as `--color-<name>: <value>`. The `:root` block is for shadcn token overrides only.

**Warning signs:** Classes like `bg-crowe-indigo-dark` apply nothing, no style appears in DevTools computed styles for that property.

### Pitfall 3: Sticky Table Header Shows Through After Background Change

**What goes wrong:** After setting `--background` to `#f8f9fc`, the sticky `<thead>` with `bg-white` now visibly contrasts with the table's own background color during scroll, creating a "flash" effect where rows scroll under a white stripe.

**Why it happens:** The table scroll container sits on a card (white background). The sticky `thead` has `bg-white` which is correct. No change needed — this pitfall only bites if someone changes `bg-white` to `bg-background` on the thead (which would make it transparent/off-white).

**How to avoid:** Keep `bg-white` on the sticky `<thead>` — it matches the card background, which IS white (`--card: #ffffff`). Do not change it to `bg-background` or `bg-card`.

### Pitfall 4: NODE_TLS_REJECT_UNAUTHORIZED=0 Forgotten on Deployment Commands

**What goes wrong:** `vercel deploy` or `gh` commands fail with TLS handshake errors on the Crowe corporate machine.

**Why it happens:** Crowe's network inspection proxy presents a self-signed certificate that Node.js rejects by default.

**How to avoid:** All CLI commands involving network calls on the Crowe machine must be prefixed: `NODE_TLS_REJECT_UNAUTHORIZED=0 vercel ...` and the `gh` binary used must be `C:\Users\RachurA\AppData\Local\gh-cli\bin\gh.exe`.

**Warning signs:** Any error message containing `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, `CERT_UNTRUSTED`, or `certificate verify failed`.

### Pitfall 5: Vercel CLI Deployment Targets Wrong Team

**What goes wrong:** `vercel deploy` creates a project under the wrong team scope, making the URL inaccessible or requiring re-linking.

**Why it happens:** Vercel CLI uses the default team from its config, which may not match `achyuth-rachurs-projects`.

**How to avoid:** On first `vercel link`, confirm the team selection interactively or pass `--scope achyuth-rachurs-projects`. Verify the displayed project URL matches `ofac-sensitivity-testing.vercel.app` before accepting.

### Pitfall 6: Dark Mode Styles Leaking

**What goes wrong:** The `.dark { }` block in `globals.css` overrides brand colors if the user's OS is set to dark mode, producing a black-background layout that violates Crowe branding.

**Why it happens:** The current `globals.css` scaffold includes a `.dark` CSS class block. It is applied conditionally by shadcn/ui only when the `dark` class is on the `<html>` element — but since there is no dark mode toggle in this app, the class is never added programmatically. The browser's prefers-color-scheme media query does NOT trigger it (class-based dark mode requires the class to be set explicitly).

**How to avoid:** The `.dark { }` block is harmless as-is (it's class-based, not media-query-based). No action needed. Do NOT convert it to `@media (prefers-color-scheme: dark)`.

---

## Code Examples

### Complete globals.css Brand Token Section

The full replacement for the `:root { }` block:

```css
/* Source: CLAUDE.md Section 2.2 + verified hex values */
:root {
  --radius: 0.75rem;
  --background: #f8f9fc;
  --foreground: #2d3142;
  --card: #ffffff;
  --card-foreground: #2d3142;
  --popover: #ffffff;
  --popover-foreground: #2d3142;
  --primary: #011E41;
  --primary-foreground: #f6f7fa;
  --secondary: #f0f2f8;
  --secondary-foreground: #011E41;
  --muted: #f0f2f8;
  --muted-foreground: #545968;
  --accent: #F5A800;
  --accent-foreground: #011E41;
  --destructive: #E5376B;
  --border: #dfe1e8;
  --input: #dfe1e8;
  --ring: #002E62;
  /* Chart and sidebar tokens — leave existing values or set to Crowe secondary palette */
  --chart-1: #F5A800;
  --chart-2: #05AB8C;
  --chart-3: #011E41;
  --chart-4: #54C0E8;
  --chart-5: #B14FC5;
  --sidebar: #f8f9fc;
  --sidebar-foreground: #2d3142;
  --sidebar-primary: #011E41;
  --sidebar-primary-foreground: #f6f7fa;
  --sidebar-accent: #f0f2f8;
  --sidebar-accent-foreground: #011E41;
  --sidebar-border: #dfe1e8;
  --sidebar-ring: #002E62;
}
```

### @theme inline additions (append to existing block)

```css
/* Source: CLAUDE.md Section 2.2 — Tailwind v4 utility registration */
@theme inline {
  /* ... existing lines kept unchanged ... */

  /* Override font vars — remove Geist, use Crowe fallback stack */
  --font-sans: 'Helvetica Neue', Arial, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;

  /* Crowe brand color utilities */
  --color-crowe-indigo-dark: #011E41;
  --color-crowe-indigo-core: #002E62;
  --color-crowe-indigo-bright: #003F9F;
  --color-crowe-amber: #F5A800;
  --color-crowe-amber-dark: #D7761D;
  --color-crowe-amber-bright: #FFD231;
  --color-crowe-teal: #05AB8C;
  --color-crowe-coral: #E5376B;
  --color-crowe-tint-900: #2d3142;
  --color-crowe-tint-700: #545968;
  --color-crowe-tint-50: #f6f7fa;

  /* Page background utility */
  --color-page: #f8f9fc;
}
```

### layout.tsx after Geist removal

```tsx
// Source: derived from existing layout.tsx + CONTEXT.md decisions
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OFAC Sensitivity Testing — Crowe',
  description: 'Synthetic OFAC name degradation testing for AML screening demonstrations.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="bg-crowe-indigo-dark px-6 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-lg tracking-tight">Crowe</span>
          <span className="text-white/80 text-sm">OFAC Sensitivity Testing</span>
        </header>

        {children}

        <footer className="bg-crowe-indigo-dark px-6 py-4 text-center">
          <p className="text-white/70 text-xs">
            &copy; 2026 Crowe LLP. For demonstration purposes only.
          </p>
        </footer>
      </body>
    </html>
  );
}
```

### page.tsx — remove placeholder paragraph

```tsx
// Remove this block entirely (lines 246-250 in current page.tsx):
// {result?.ok && (
//   <p className="text-center text-sm text-muted-foreground">
//     {rows.length} result{rows.length !== 1 ? 's' : ''} generated
//   </p>
// )}

// ResultsTable immediately follows the last Card with no gap element
<ResultsTable rows={rows} clientName={clientName} />
```

### Deployment command sequence (Crowe network)

```bash
# 1. Validate build passes (must be green before anything else)
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build

# 2. Push to GitHub
C:\Users\RachurA\AppData\Local\gh-cli\bin\gh.exe repo create achyuthrachur/ofac-sensitivity-testing --public --source=. --remote=origin --push

# 3. Link Vercel project (interactive — confirm team and project name)
NODE_TLS_REJECT_UNAUTHORIZED=0 npx vercel link

# 4. Deploy to production
NODE_TLS_REJECT_UNAUTHORIZED=0 npx vercel --prod
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.ts` for colors | `@theme inline { }` in CSS | Tailwind v4 (2024) | No config file; tokens are CSS; utility classes generated from CSS vars |
| `next/font/google` for custom fonts | CSS `font-family` stack | Phase 7 build-fix decision | Eliminates build-time network dependency on Google Fonts |
| oklch tokens (shadcn default) | hex values | Phase 7 override | Hex is specified in CLAUDE.md; direct substitution is cleaner than oklch conversion |

**Current shadcn/ui version note:** shadcn/ui 3.8.5 (installed) uses `data-slot="card"` on the Card root element. The CSS selector `[data-slot="card"]` is the correct target for card shadow overrides rather than a CSS class name.

---

## Open Questions

1. **Vercel team slug accuracy**
   - What we know: CONTEXT.md names the team `achyuth-rachurs-projects` with ID `team_jTMSsUBJBbOqgNTyjjsr9PY2`
   - What's unclear: Whether `vercel link` will prompt interactively or if `--scope` flag is needed on the corporate network
   - Recommendation: Run `vercel link` interactively on first attempt; verify the team selection before confirming; if it hangs, add `--scope achyuth-rachurs-projects`

2. **GitHub repo — existing vs. new**
   - What we know: The git remote may or may not already exist at `achyuthrachur/ofac-sensitivity-testing`
   - What's unclear: Whether `gh repo create` will error if a repo with that name already exists
   - Recommendation: Before `gh repo create`, run `gh repo view achyuthrachur/ofac-sensitivity-testing` — if it exists, use `git remote add origin` + `git push -u origin main` instead

3. **shadcn Card border removal interaction with ResultsTable scroll container**
   - What we know: ResultsTable uses `className="rounded-md border"` on the scroll container div (not a shadcn Card)
   - What's unclear: If the `[data-slot="card"] { border: none; }` global override would accidentally remove borders from non-card elements
   - Recommendation: The `data-slot="card"` selector is specific to shadcn Card components only; the ResultsTable scroll `div` does not have this attribute and is unaffected. Confirm via browser DevTools inspection.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test -- --reporter=verbose` |

### Phase Requirements to Test Map

Phase 7 has no new TypeScript logic. All 114 existing tests remain the regression baseline. The phase's success criteria are verified manually (visual inspection + URL accessibility) rather than automated unit tests.

| Behavior | Test Type | Automated Command | Notes |
|----------|-----------|-------------------|-------|
| Build passes with no font errors | Build smoke | `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build` | Must pass before deployment |
| Existing 114 tests still green after CSS changes | Regression | `npm run test` | CSS changes cannot break TypeScript logic tests |
| Brand colors visually correct in browser | Manual visual | n/a | Verify page bg #f8f9fc, text #2d3142, header indigo, amber button |
| Score column color-coding correct | Manual visual | n/a | Green ✓ for caught, coral ✗ for missed |
| Header and footer render on all pages | Manual visual | n/a | Single layout.tsx — only one page to check |
| Live Vercel URL accessible | Smoke (manual) | `curl https://ofac-sensitivity-testing.vercel.app` | Phase complete when URL returns 200 |

### Sampling Rate

- **Per task commit:** `npm run test` — confirms no logic regressions from CSS changes
- **Per wave merge:** `NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build` — confirms build clean
- **Phase gate:** Build green + live URL accessible before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all phase requirements. Phase 7 introduces no new TypeScript modules requiring unit tests.

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection: `src/app/globals.css` — confirmed Tailwind v4 `@theme inline { }` + `:root { }` structure already in place; exact token names identified
- Direct code inspection: `src/app/layout.tsx` — confirmed exact lines to remove (Geist imports, `const geistSans`, `const geistMono`, `className` template literals)
- Direct code inspection: `src/app/page.tsx` — confirmed exact lines to remove (the `{result?.ok && <p>...` block)
- Direct code inspection: `src/components/ResultsTable.tsx` — confirmed exact `<td>` to modify for score color-coding
- CLAUDE.md Section 2.2 — authoritative Crowe hex color values; all hex values in this document sourced from there
- CONTEXT.md `<decisions>` block — locked implementation choices; all decisions treated as HIGH confidence constraints
- `vitest.config.ts` + test run output — confirmed 114 tests, `npm run test` command, node environment

### Secondary (MEDIUM confidence)

- CLAUDE.md Section 4.1 — confirms Tailwind v4 CSS-first pattern (project already uses this; no gap between doc and reality)
- shadcn/ui `data-slot` attribute — confirmed in shadcn/ui v3 component source patterns; used for CSS targeting

### Tertiary (LOW confidence)

- Vercel team slug `achyuth-rachurs-projects` — taken from CONTEXT.md; not independently verified against Vercel dashboard during this research session

---

## Metadata

**Confidence breakdown:**
- CSS token overrides: HIGH — globals.css structure confirmed by direct file read; CLAUDE.md hex values are authoritative
- Font build fix: HIGH — layout.tsx import confirmed by direct file read; fix is a straightforward line removal
- Header/footer pattern: HIGH — layout.tsx structure confirmed; standard Next.js App Router pattern
- Score color-coding: HIGH — ResultsTable.tsx score cell confirmed by direct file read
- Deployment commands: MEDIUM — NODE_TLS_REJECT_UNAUTHORIZED=0 prefix confirmed by STATE.md decisions; exact vercel CLI flags may vary by interactive prompt
- Vercel team slug: LOW — taken from CONTEXT.md as stated; not verified against live Vercel dashboard

**Research date:** 2026-03-04
**Valid until:** Stable (no fast-moving dependencies; all libraries already installed and frozen in package-lock.json)
