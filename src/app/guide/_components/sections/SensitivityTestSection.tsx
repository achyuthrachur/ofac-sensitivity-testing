export function SensitivityTestSection() {
  return (
    <section id="sensitivity-test" className="scroll-mt-20 space-y-8">
      <h2 className="text-2xl font-bold text-crowe-indigo-dark">Sensitivity Test</h2>

      <div className="space-y-3">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          What it does
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sensitivity Test shows how well the screening logic withstands common naming changes. The tool samples synthetic entries, applies the selected degradation rules, and reports how many altered names would still be flagged above the active threshold.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          Recommended setup
        </h3>
        <ol className="space-y-4">
          {[
            {
              n: 1,
              title: 'Set entity counts',
              body: 'For the standard demo, keep each entity type at 10 so the run stays balanced and easy to explain.',
            },
            {
              n: 2,
              title: 'Leave all regions enabled',
              body: 'This keeps the sample representative across Arabic, CJK, Cyrillic, and Latin naming patterns.',
            },
            {
              n: 3,
              title: 'Keep all degradation rules selected',
              body: 'Running the full rule set gives the clearest picture of where the screening logic is resilient and where it is more exposed.',
            },
            {
              n: 4,
              title: 'Optionally label the run',
              body: 'Add a client or project name if you want the CSV export to carry a recognizable label.',
            },
            {
              n: 5,
              title: 'Run the test and review the catch rate',
              body: 'Use the results table to identify which transformations are still caught and which ones create misses.',
            },
          ].map(({ n, title, body }) => (
            <li key={n} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-crowe-indigo-dark text-xs font-bold text-white">
                {n}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">{title}</strong> - {body}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-4">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          What the rule library covers
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The rule set is meant to mimic the kinds of issues compliance teams actually see: spacing changes, transliteration differences, punctuation loss, shortened names, and phonetic alternatives. Each rule is applied independently so the output makes it clear which variation patterns are responsible for the strongest misses.
        </p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-5 space-y-1">
            <p className="text-sm font-semibold text-foreground">Formatting and normalization</p>
            <p className="text-sm text-muted-foreground">
              Space removal, punctuation removal, and prefix or suffix removal test whether standard normalization catches formatting drift.
            </p>
          </div>
          <div className="rounded-lg border border-border p-5 space-y-1">
            <p className="text-sm font-semibold text-foreground">Transliteration and spelling changes</p>
            <p className="text-sm text-muted-foreground">
              Diacritic removal, abbreviation, phonetic variants, and alias substitution test whether similar names still score strongly when spelling shifts.
            </p>
          </div>
          <div className="rounded-lg border border-border p-5 space-y-1">
            <p className="text-sm font-semibold text-foreground">Order and omission</p>
            <p className="text-sm text-muted-foreground">
              Word reorder, truncation, and OCR-style substitutions show how the screening logic behaves when source data is inconsistent or partially degraded.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          Reading the results
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The results table pairs each original name with its degraded version and score. Teal rows represent variants that remain detectable. Coral rows represent variants that fall below the threshold and deserve closer review.
        </p>
        <div className="rounded-lg border-l-4 border-crowe-amber bg-crowe-amber/10 p-5">
          <p className="text-sm leading-relaxed text-foreground">
            <strong>Note:</strong> Some region-specific rules only apply to certain naming patterns, so it is normal for the final row count to differ from the maximum theoretical total.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          Exporting the run
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use the CSV export below the results table when you need a client-ready record of the degraded pairs, scores, and caught or missed outcomes.
        </p>
      </div>
    </section>
  );
}
