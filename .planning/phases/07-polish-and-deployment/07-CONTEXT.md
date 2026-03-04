# Phase 7: Polish and Deployment - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply Crowe brand styling to the existing functional app (globals.css + component tweaks), add a branded header and footer, polish UX rough edges, fix the build-blocking Google Fonts issue, and deploy to Vercel production. Phase ends when there is a live URL.

</domain>

<decisions>
## Implementation Decisions

### Fonts
- Keep Geist fonts from Google Fonts — loads fine for end users on production Vercel; only blocked on the Crowe dev machine
- No self-hosted Helvetica Now — license not available; use `'Helvetica Neue', Arial, system-ui, sans-serif` as the brand fallback stack in CSS
- **Build fix:** Remove the `next/font/google` Geist import from `layout.tsx` — replace with a plain CSS font-family stack in `globals.css`. This fixes the `npm run build` failure caused by Google Fonts being blocked on the corporate network

### Brand Depth — Full Warm Crowe Design System
Apply all CLAUDE.md brand tokens to `globals.css` (Tailwind v4 CSS-first — no tailwind.config.ts):

- **Page background:** `#f8f9fc` (warm off-white, never pure #FFFFFF)
- **Primary text:** `#2d3142` (warm dark slate, never pure #000)
- **shadcn token overrides:** `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--accent`, `--muted`, `--border` → Crowe Indigo/Amber/tint values
- **Cards:** White (`#ffffff`) on off-white background — soft indigo-tinted shadows (`rgba(1,30,65,0.06)`), no hard borders, `border-radius: 12px`
- **Submit button (Run Test):** Amber background `#F5A800`, dark text `#011E41`, amber glow on hover
- **Indigo accents:** Page heading, card titles, header bar in Crowe Indigo Dark (`#011E41`)
- **Muted/secondary text:** `#545968` (tint-700)
- **Destructive/error:** Crowe Coral (`#E5376B`) — already partially used

### Branded Header
- Slim top bar: Crowe Indigo Dark (`#011E41`) background
- Left: "Crowe" wordmark text in white (no image dependency)
- Right: "OFAC Sensitivity Testing" in soft white
- No navigation, no logo image file needed

### UX Refinements
- **Score column:** Color-coded — caught scores in Crowe Teal (`#05AB8C`), missed scores in Crowe Coral (`#E5376B`). Text color only, not background
- **Remove the 'N results generated' placeholder** from `page.tsx` — redundant once the table and catch-rate summary are visible
- **Footer:** Minimal indigo-background footer — `© 2026 Crowe LLP. For demonstration purposes only.` in soft white text

### Deployment
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

</decisions>

<specifics>
## Specific Ideas

- Tailwind v4 uses `@theme inline { --color-*: ... }` in globals.css for token registration — brand color overrides go there, not in a tailwind.config.ts
- The `--background` shadcn token should map to Crowe `#f8f9fc` (warm off-white) instead of white
- The `--primary` shadcn token should map to Crowe Indigo Dark `#011E41` — this makes the default `Button variant="default"` indigo-colored
- A new `--color-amber` token should be registered for the Run Test button override
- The Run Test button already has `className="w-full"` — override its background/hover via a custom CSS class or direct Tailwind arbitrary value
- `layout.tsx` currently imports `Geist` and `Geist_Mono` from `next/font/google` — remove both imports and the `className` variables; add CSS font-family fallback in globals.css `body` rule

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/globals.css` — Tailwind v4 CSS-first config; `@theme inline { }` block is where brand tokens are registered; `:root { }` block has current shadcn oklch tokens to override
- `src/app/layout.tsx` — Geist font imports to remove; `<body>` className to simplify
- `src/app/page.tsx` — `{result?.ok && <p>...{rows.length} results generated</p>}` to remove; header/footer to add around main content
- `src/components/ResultsTable.tsx` — Score cell `{row.caught ? '✓' : '✗'}` to add color classes

### Established Patterns
- Tailwind v4 CSS-first: no tailwind.config.ts; `@theme` block in globals.css; utility classes work via CSS variable references
- `'use client'` on page.tsx — header/footer can be static (no client directive needed if extracted to layout)
- Named exports convention

### Integration Points
- `src/app/layout.tsx` — add header/footer here (wraps every page; keeps page.tsx clean)
- `src/app/globals.css` — single file for all brand token overrides
- Vercel deployment reads from the GitHub repo main branch

</code_context>

<deferred>
## Deferred Ideas

- Self-hosted Helvetica Now — deferred until font license is obtained
- CI/CD GitHub Actions pipeline — Phase 7 uses manual `vercel deploy`; automated deploys are a future enhancement
- Dark mode — out of scope per CLAUDE.md brand guidelines (no large black backgrounds)
- Crowe logo image — deferred until SVG asset is available

</deferred>

---

*Phase: 07-polish-and-deployment*
*Context gathered: 2026-03-04*
