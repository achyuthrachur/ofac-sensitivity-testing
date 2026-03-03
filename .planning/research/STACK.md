# Technology Stack

**Project:** OFAC Sensitivity Testing Web Tool
**Researched:** 2026-03-03
**Note:** Verify all versions against npm before install.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x | Full-stack React framework | App Router is the standard; Vercel-native deployment; React Server Components reduce client bundle |
| React | 19.x (ships with Next.js 15) | UI rendering | Server Components improve initial load for data-heavy result tables |
| TypeScript | 5.x | Static typing | Enforces contract between form schema, API payload, and result types |
| Node.js | 20.x LTS | Runtime (Vercel serverless) | Vercel's default runtime; LTS stability |

**Confidence:** MEDIUM — Next.js 15 / React 19 were current at knowledge cutoff. Verify on npm.

---

### Form State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Hook Form | 7.x | Form state, validation, submission | Zero re-renders on keystroke; native Zod integration; ~25KB vs Formik ~90KB |
| Zod | 3.x | Schema validation | Single schema serves as TypeScript type source AND runtime validator for frontend + API route |
| @hookform/resolvers | 3.x | Bridge between RHF and Zod | Official adapter |

**Confidence:** HIGH — RHF 7 + Zod 3 is the de-facto standard for Next.js TypeScript form projects.

**Do NOT use:**
- Formik — larger bundle, more re-renders, development slowed
- Controlled `useState` per field — full re-render on every keystroke
- Yup — Zod has better TypeScript inference; community default is Zod

---

### Table / Data Grid Display

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TanStack Table (react-table) | 8.x | Headless table with sorting, filtering, pagination | Headless = own all markup; no style conflicts with Tailwind; TypeScript-first |
| @tanstack/react-virtual | 3.x | Row virtualization | Must-have for 2000+ rows; renders only visible viewport |
| Tailwind CSS | 3.x or 4.x | Styling | Utility-first; trivial to style dense data tables |

**Confidence:** HIGH for TanStack Table v8. Verify Tailwind version (v4 was in RC at cutoff).

**Do NOT use:**
- AG Grid — overkill; large bundle; license complexity
- MUI DataGrid — brings full Material Design overhead
- react-table v6/v7 — deprecated

---

### CSV Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Native Blob approach | N/A | CSV download | Zero dependency; standard browser API |
| Papa Parse | 5.x | Fallback if quoting complexity | Battle-tested; handles edge cases; MIT license |

**Implementation pattern (client-side, no library):**
```typescript
function downloadCSV(rows: ResultRow[], filename: string) {
  const headers = Object.keys(rows[0]).join(',');
  const body = rows.map(r =>
    Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  // BOM required for Excel to decode UTF-8 correctly
  const blob = new Blob(['\uFEFF' + `${headers}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
```

**Do NOT use:**
- `xlsx` / SheetJS for CSV-only output — ~800KB for functionality not needed
- Server-side CSV streaming — adds a round-trip; prefer client-side from already-fetched results

---

### API / Computation Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js Server Actions | Built-in | Server-side data processing | Co-located with form; `useTransition` integration; eliminates separate `/api/` route boilerplate |
| Zod (reused) | 3.x | API input validation | Same schema as form validation |

**Do NOT use:**
- Pages Router `/pages/api` — legacy; do not mix with App Router
- Edge Runtime — OFAC processing is CPU-bound; use default Node.js runtime

---

### UI Component Layer

| Technology | Purpose | Why |
|------------|---------|-----|
| shadcn/ui | Pre-built accessible components | Copy-on-demand (not an npm install); Radix UI primitives; Tailwind-styled; no vendor lock-in |
| Radix UI | Accessibility primitives | Keyboard nav, ARIA roles; used transitively via shadcn |

**Do NOT use:** MUI, Chakra UI, Ant Design — all conflict with Tailwind or add unnecessary bundle weight.

---

### Infrastructure / Deployment

| Technology | Purpose | Why |
|------------|---------|-----|
| Vercel | Hosting + CI/CD | Zero-config for Next.js; automatic preview deployments; edge network |

---

## Installation

```bash
npx create-next-app@latest ofac-sensitivity-testing \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd ofac-sensitivity-testing

npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-table @tanstack/react-virtual
npm install papaparse && npm install -D @types/papaparse

npx shadcn@latest init
npx shadcn@latest add input checkbox label button card table
```

---

## Version Verification

```bash
npm info next version
npm info react version
npm info react-hook-form version
npm info zod version
npm info @tanstack/react-table version
npm info @tanstack/react-virtual version
npm info tailwindcss version
```

---

## Confidence Summary

| Area | Confidence | Reason |
|------|------------|--------|
| Next.js 15 + App Router | MEDIUM | Current at Aug 2025 cutoff; verify patch version |
| React Hook Form + Zod | HIGH | Dominant standard; stable API |
| TanStack Table v8 | HIGH | Dominant headless table; API stable since 2022 |
| shadcn/ui | HIGH | Dominant component approach for Tailwind+Next.js |
| CSV native approach | HIGH | Standard browser API; no dependency risk |
| Vercel deployment | HIGH | Zero-config, unchanged pattern |
