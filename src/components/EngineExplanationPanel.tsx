import { TermTooltip } from '@/components/education/TermTooltip';

export function EngineExplanationPanel() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-crowe-indigo-dark">Methodology</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A practical guide to the synthetic dataset, match scoring, and the rule library used in the demo workflow.
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          Synthetic dataset
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The demo uses 285 synthetic watchlist entries across individuals, businesses, vessels, and aircraft. The names are fictitious but intentionally shaped to resemble the kinds of transliteration, spacing, and naming-pattern issues that appear in sanctions screening.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entity coverage</p>
            <ul className="space-y-1 text-sm text-foreground">
              <li><strong>Individuals</strong> test multi-part personal names.</li>
              <li><strong>Businesses</strong> test legal suffixes and trading names.</li>
              <li><strong>Vessels</strong> test maritime naming patterns.</li>
              <li><strong>Aircraft</strong> test tail-number style identifiers.</li>
            </ul>
          </div>
          <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Region coverage</p>
            <ul className="space-y-1 text-sm text-foreground">
              <li><strong>Arabic</strong> names include common connectors and prefixes.</li>
              <li><strong>Chinese/CJK</strong> names test transliterated forms.</li>
              <li><strong>Russian/Cyrillic</strong> names test transliteration variance.</li>
              <li><strong>Latin/European</strong> names test Western formatting and diacritics.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          How scores are interpreted
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Each original name and degraded variant is compared with <strong className="text-foreground"><TermTooltip term="jaro-winkler">Jaro-Winkler similarity</TermTooltip></strong> and supporting logic that helps the tool account for phonetic overlap and reordered tokens. Scores run from 0 to 1, where higher values indicate a stronger match signal.
        </p>
        <div className="grid gap-4 text-sm md:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-lg font-bold text-crowe-indigo-dark">1.0</p>
            <p className="mt-1 text-xs text-muted-foreground">Identical strings</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-lg font-bold text-crowe-amber">0.85</p>
            <p className="mt-1 text-xs text-muted-foreground">Common benchmark threshold</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-lg font-bold text-foreground">0.0</p>
            <p className="mt-1 text-xs text-muted-foreground">No meaningful similarity</p>
          </div>
        </div>
        <div className="rounded-xl bg-crowe-indigo-dark p-6 space-y-3">
          <p className="text-lg font-semibold text-white">What the catch rate means</p>
          <p className="text-sm leading-relaxed text-white/80">
            Catch rate shows how often the screening logic still flags a degraded name. A 97 percent catch rate means 97 out of 100 altered variants still clear the active threshold and would surface for review.
          </p>
          <p className="text-sm leading-relaxed text-white/80">
            Higher is better. Lower results signal the kinds of naming changes that deserve additional tuning or control review.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          What the degradation rules simulate
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The rule library introduces the kinds of variations screening teams see in practice: removed spaces, punctuation changes, dropped vowels, phonetic alternatives, reordered tokens, and shortened names. Each selected rule is evaluated independently so the results make it clear which patterns the current configuration handles well and which patterns still create exposure.
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-foreground">Formatting changes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Space removal, punctuation removal, and prefix or suffix removal test whether normalization catches common formatting drift.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-foreground">Linguistic variation</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Diacritic removal, abbreviation, phonetic variants, and alias substitution test transliteration and spelling changes across regions.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-foreground">Workflow and data-entry noise</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Word reorder, OCR-style substitution, and truncation simulate the kinds of issues created by manual entry, scanning, and inconsistent source systems.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          Recommended demo sequence
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Start with the Sensitivity Test to establish a baseline. Move into Screening Mode with the preloaded name list to show how the tiering and threshold controls behave on a realistic batch. Finish with the Baseline simulation to explain how performance may change as evasion tactics become more sophisticated over time.
        </p>
      </section>
    </div>
  );
}
