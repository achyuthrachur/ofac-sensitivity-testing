// src/components/EngineExplanationPanel.tsx
// Pure presentational component — no 'use client', no hooks, no browser APIs
import { TermTooltip } from '@/components/education/TermTooltip';

export function EngineExplanationPanel() {
  return (
    <div className="space-y-10 max-w-3xl">

      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-crowe-indigo-dark">Engine Documentation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          How the OFAC sensitivity testing engine works — dataset, scoring, and degradation rules
        </p>
      </div>

      {/* ────────────────────────────────────────────
          SECTION 1 — ABOUT THE DATASET (EXPL-02)
      ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          About the Dataset
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The engine tests against <strong className="text-foreground">285 synthetic SDN (Specially
          Designated Nationals) entries</strong>. These are fictitious names constructed to mirror real
          OFAC watchlist patterns — they are not real individuals, businesses, vessels, or aircraft.
          The dataset is static and lives at <code className="text-xs bg-muted px-1 py-0.5 rounded">data/sdn.json</code>.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entity Types</p>
            <ul className="text-sm space-y-1 text-foreground">
              <li><strong>Individual</strong> — persons with multi-part given/family names</li>
              <li><strong>Business</strong> — corporate entities (often with legal suffixes: CO, LTD)</li>
              <li><strong>Vessel</strong> — ship and maritime entity names</li>
              <li><strong>Aircraft</strong> — tail numbers and aviation registrations</li>
            </ul>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Linguistic Regions</p>
            <ul className="text-sm space-y-1 text-foreground">
              <li><strong>Arabic</strong> — genealogical connectors (IBN, BIN, ABU) and AL- prefix</li>
              <li><strong>Chinese/CJK</strong> — transliterated to uppercase Latin for processing</li>
              <li><strong>Russian/Cyrillic</strong> — transliterated to uppercase Latin</li>
              <li><strong>Latin/European</strong> — Western European names</li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Sampling:</strong> The engine uses a Mulberry32 seeded
          PRNG (seed=42) to sample entries from the filtered pool. Sampling is{' '}
          <em>with replacement</em> — the same entry can appear multiple times in a run. This is
          intentional: it ensures consistent test sizes even when a given entity type + region
          combination has a small pool. The seed guarantees identical results for identical parameters
          across runs.
        </p>
      </section>

      {/* ────────────────────────────────────────────
          SECTION 2 — HOW SCORING WORKS (EXPL-03)
      ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          How Scoring Works
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Each (original name, degraded variant) pair is scored using the{' '}
          <strong className="text-foreground"><TermTooltip term="jaro-winkler">Jaro-Winkler similarity algorithm</TermTooltip></strong>. The score
          is a number from 0 to 1:
        </p>

        <div className="flex gap-4 text-sm">
          <div className="flex-1 rounded-lg bg-muted/50 p-3 text-center">
            <p className="font-bold text-lg text-crowe-indigo-dark">1.0</p>
            <p className="text-muted-foreground text-xs mt-1">Identical strings</p>
          </div>
          <div className="flex-1 rounded-lg bg-muted/50 p-3 text-center">
            <p className="font-bold text-lg text-crowe-amber">0.85</p>
            <p className="text-muted-foreground text-xs mt-1">Catch threshold</p>
          </div>
          <div className="flex-1 rounded-lg bg-muted/50 p-3 text-center">
            <p className="font-bold text-lg text-foreground">0.0</p>
            <p className="text-muted-foreground text-xs mt-1">Completely dissimilar</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Jaro-Winkler is optimized for short strings and gives extra weight to matching characters
          at the beginning of strings. It handles common real-world name variations — typos,
          abbreviations, transliteration variants — better than edit-distance metrics, making it
          standard in watchlist screening.
        </p>

        {/* Catch-rate callout card — prominent EXPL-03 treatment */}
        <div className="rounded-xl bg-crowe-indigo-dark p-6 space-y-3">
          <p className="text-lg font-semibold text-white">What does the catch rate mean?</p>
          <p className="text-sm text-white/80 leading-relaxed">
            A catch rate of <strong className="text-crowe-amber">97%</strong> means that 97 out of
            100 degraded name variants — after being intentionally distorted — would still score
            above the <strong className="text-crowe-amber">85% match threshold</strong> and be
            flagged by your screening system.
          </p>
          <p className="text-sm text-white/80 leading-relaxed">
            A <strong className="text-white">higher catch rate is better</strong>. A score near 100%
            means your screening engine is robust to these name variation patterns. A low catch rate
            signals a coverage gap worth investigating with your compliance team.
          </p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Score color coding in the results table:</strong>{' '}
          Teal = caught (score above 0.85, would be flagged) ·
          Coral = missed (score at or below 0.85, would escape detection)
        </p>
      </section>

      {/* ────────────────────────────────────────────
          SECTION 3 — DEGRADATION RULES (EXPL-01)
      ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Degradation Rules
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Each entry is tested against all selected rules independently. Rules that do not apply to a
          given entry&apos;s region return no result row — this is why some runs produce fewer rows than
          the maximum possible. Rules are applied in canonical order regardless of checkbox order.
        </p>

        <div className="space-y-3">

          {/* Rule 1 — Space Removal */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Space Removal</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">Removes all spaces from the name.</p>
            <p className="text-xs text-muted-foreground font-mono">
              AHMED ALI → AHMEDALI
            </p>
          </div>

          {/* Rule 2 — OCR/Leet Substitution */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">OCR/Leet Substitution</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Replaces letters with visually similar characters: O→0, I→1, E→3, A→@, S→5, B→8, G→9, T→7.
              Simulates OCR misreads and leet-style obfuscation seen in real watchlist evasion.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              BILAL → 81L@L
            </p>
          </div>

          {/* Rule 3 — Diacritic Removal */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Diacritic Removal</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Latin · Cyrillic</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Strips accent marks using Unicode NFD decomposition. Covers ä→a, ö→o, ü→u, é→e, ñ→n,
              and all other combining diacritical marks.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              MÜLLER → MULLER
            </p>
          </div>

          {/* Rule 4 — Word Reorder */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Word Reorder</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Rotates name tokens left by one position — the first token moves to the end.
              Mimics different name-order conventions across cultures (given-first vs family-first).
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              HASSAN ALI AL-RASHIDI → ALI AL-RASHIDI HASSAN
            </p>
          </div>

          {/* Rule 5 — Abbreviation (Vowel Drop) */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Abbreviation (Vowel Drop)</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Arabic · Cyrillic · Latin</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Drops vowels from name tokens. Preserves Arabic genealogical connectors (IBN, BIN, ABU,
              UMM) and the AL- nisba prefix verbatim — only content tokens are abbreviated.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              HASSAN IBN ALI → HSSN IBN L
            </p>
          </div>

          {/* Rule 6 — Truncation */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Truncation</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Drops the last name token. Simulates data entry truncation or deliberate omission of a
              name component in financial records.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              HASSAN IBN ALI AL-RASHIDI → HASSAN IBN ALI
            </p>
          </div>

          {/* Rule 7 — Phonetic Variant */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Phonetic Variant</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Arabic · Cyrillic</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Substitutes a name token with an alternate transliteration. Covers common Arabic names
              (OSAMA→USAMAH, AHMAD→AHMED, KHALID→KHALED) and Russian names
              (ALEKSANDR→ALEKSANDER, DMITRY→DMITRI, MIKHAIL→MICHAEL).
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              OSAMA BIN LADEN → USAMAH BIN LADEN
            </p>
          </div>

          {/* Rule 8 — Punctuation Removal */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Punctuation Removal</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Strips hyphens, periods, slashes, and all non-word non-space characters. Common in
              legacy screening systems that normalize punctuation before matching.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              AL-NOOR TRADING CO. → ALNOOR TRADING CO
            </p>
          </div>

          {/* Rule 9 — Prefix/Suffix Removal */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Prefix/Suffix Removal</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Strips recognized honorific prefixes (DR, MR, SHEIKH, IMAM, HAJI) and generational
              suffixes (JR, SR, PHD, MD, II, III).
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              DR CARLOS RODRIGUEZ JR → CARLOS RODRIGUEZ
            </p>
          </div>

          {/* Rule 10 — Alias Substitution */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Alias Substitution</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Arabic only</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Replaces the given name with a known spelling variant from an alias table. Covers
              MOHAMMED→MOHAMAD, HUSSEIN→HOSSEIN, ABDULLAH→ABDALLAH, and other common Arabic
              given name alternates used across OFAC watchlist entries.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              MOHAMMED ALI HASSAN → MOHAMAD ALI HASSAN
            </p>
          </div>

        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Note:</strong> CJK region entries are only tested
          against rules that apply to all regions (Space Removal, OCR/Leet, Word Reorder,
          Truncation, Punctuation Removal, Prefix/Suffix Removal). Region-specific rules
          (Diacritic, Abbreviation, Phonetic, Alias) exclude CJK and return no result row for
          those entries.
        </p>
      </section>

    </div>
  );
}
