// Pure Server Component — no 'use client'

export function SensitivityTestSection() {
  return (
    <section id="sensitivity-test" className="scroll-mt-20 space-y-8">
      <h2 className="text-2xl font-bold text-crowe-indigo-dark">Sensitivity Test</h2>

      {/* What It Does */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          What It Does
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Sensitivity Test runs a controlled degradation experiment. The engine samples SDN
          entries from the synthetic dataset, applies your chosen name-transformation rules to each
          entry, then scores the degraded variant against the original using Jaro-Winkler
          similarity. The catch rate is the percentage of degraded names that score above the 0.85
          threshold — meaning your screening system would still flag them despite the
          transformation.
        </p>
      </div>

      {/* How to Run a Test — numbered steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          How to Run a Test
        </h3>
        <ol className="space-y-4">
          {[
            {
              n: 1,
              title: 'Select Entity Types',
              body: 'Choose one or more: Individual, Business, Vessel, Aircraft. Each controls which entries are included in the SDN pool.',
            },
            {
              n: 2,
              title: 'Select Regions',
              body: 'Arabic, Chinese/CJK, Russian/Cyrillic, Latin/European. Determines the linguistic composition of the sampled entries.',
            },
            {
              n: 3,
              title: 'Select Degradation Rules',
              body: 'Choose which name-transformation rules to apply. Each entry will be tested against all selected rules independently. The 10 rules are explained in the table below.',
            },
            {
              n: 4,
              title: 'Set Name Count',
              body: 'The slider controls how many SDN entries to sample (1–285). The engine samples with replacement using a seeded PRNG (seed=42), so results are reproducible.',
            },
            {
              n: 5,
              title: 'Click Run Test',
              body: 'Results appear in the table on the right panel.',
            },
          ].map(({ n, title, body }) => (
            <li key={n} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-crowe-indigo-dark text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {n}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{title}</strong> — {body}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Degradation Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          The 10 Degradation Rules
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Each rule simulates a real-world name-variant pattern seen in OFAC evasion or data entry
          errors.
        </p>
        <div className="space-y-3">

          {/* Rule 1 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Space Removal</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">Removes all spaces from the name.</p>
            <p className="text-xs text-muted-foreground font-mono">AHMED ALI → AHMEDALI</p>
          </div>

          {/* Rule 2 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">OCR/Leet Substitution</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Replaces letters with visually similar characters: O→0, I→1, E→3, A→@, S→5, B→8,
              G→9, T→7. Simulates OCR misreads and leet-style obfuscation.
            </p>
            <p className="text-xs text-muted-foreground font-mono">BILAL → 81L@L</p>
          </div>

          {/* Rule 3 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Diacritic Removal</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Latin · Cyrillic</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Strips accent marks (NFD decomposition). Covers ä→a, ö→o, ü→u, é→e, ñ→n, and all
              combining diacritical marks.
            </p>
            <p className="text-xs text-muted-foreground font-mono">MÜLLER → MULLER</p>
          </div>

          {/* Rule 4 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Word Reorder</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Rotates name tokens left by one position. Mimics different name-order conventions
              across cultures.
            </p>
            <p className="text-xs text-muted-foreground font-mono">HASSAN ALI AL-RASHIDI → ALI AL-RASHIDI HASSAN</p>
          </div>

          {/* Rule 5 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Abbreviation (Vowel Drop)</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Arabic · Cyrillic · Latin</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Drops vowels from content tokens. Preserves Arabic genealogical connectors (IBN, BIN,
              ABU, UMM) and the AL- prefix verbatim.
            </p>
            <p className="text-xs text-muted-foreground font-mono">HASSAN IBN ALI → HSSN IBN L</p>
          </div>

          {/* Rule 6 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Truncation</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Drops the last name token. Simulates data entry truncation or deliberate omission.
            </p>
            <p className="text-xs text-muted-foreground font-mono">HASSAN IBN ALI AL-RASHIDI → HASSAN IBN ALI</p>
          </div>

          {/* Rule 7 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Phonetic Variant</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Arabic · Cyrillic</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Substitutes a token with an alternate transliteration. Covers OSAMA→USAMAH,
              AHMAD→AHMED, ALEKSANDR→ALEKSANDER, and others.
            </p>
            <p className="text-xs text-muted-foreground font-mono">OSAMA BIN LADEN → USAMAH BIN LADEN</p>
          </div>

          {/* Rule 8 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Punctuation Removal</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Strips hyphens, periods, slashes, and non-word non-space characters.
            </p>
            <p className="text-xs text-muted-foreground font-mono">AL-NOOR TRADING CO. → ALNOOR TRADING CO</p>
          </div>

          {/* Rule 9 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Prefix/Suffix Removal</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">All regions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Strips honorific prefixes (DR, MR, SHEIKH, IMAM, HAJI) and generational suffixes (JR,
              SR, PHD, MD, II, III).
            </p>
            <p className="text-xs text-muted-foreground font-mono">DR CARLOS RODRIGUEZ JR → CARLOS RODRIGUEZ</p>
          </div>

          {/* Rule 10 */}
          <div className="rounded-lg border border-border p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Alias Substitution</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Arabic only</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Replaces given name with a known spelling variant: MOHAMMED→MOHAMAD,
              HUSSEIN→HOSSEIN, ABDULLAH→ABDALLAH.
            </p>
            <p className="text-xs text-muted-foreground font-mono">MOHAMMED ALI HASSAN → MOHAMAD ALI HASSAN</p>
          </div>

        </div>
      </div>

      {/* Reading Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Reading Results
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The results table shows each (original name, degraded variant) pair. Score color coding:{' '}
          <strong className="text-crowe-teal">teal</strong> = caught (score above 0.85 — the
          screening system would flag this variant),{' '}
          <strong className="text-crowe-coral">coral</strong> = missed (score at or below 0.85 —
          this variant would escape detection). The catch rate summary at the top shows the overall
          percentage.
        </p>
        <div className="rounded-lg border-l-4 border-crowe-amber bg-crowe-amber/10 p-4">
          <p className="text-sm text-foreground leading-relaxed">
            <strong>Note:</strong> CJK entries are only tested against rules that apply to all
            regions. Region-specific rules (Diacritic, Abbreviation, Phonetic, Alias) return no
            result row for CJK entries — this is expected behavior, not an error.
          </p>
        </div>
      </div>

      {/* Export CSV */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Export CSV
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Use the Export CSV button below the results table to download all rows as a UTF-8 CSV
          file. The file includes the original name, degraded variant, score, and caught/missed
          status for every row.
        </p>
      </div>
    </section>
  );
}
