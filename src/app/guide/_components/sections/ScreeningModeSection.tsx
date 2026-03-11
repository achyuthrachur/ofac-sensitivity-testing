export function ScreeningModeSection() {
  return (
    <section id="screening-mode" className="scroll-mt-20 space-y-8">
      <h2 className="text-2xl font-bold text-crowe-indigo-dark">Screening Mode</h2>

      <div className="space-y-3">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          What it does
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Screening Mode runs a batch of names against the synthetic watchlist and returns the strongest match for each input, including a tier, score, and recommended action. It is designed to show how the workflow feels during a realistic review rather than only at the rule-by-rule test level.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          Start with the preloaded list
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The default demo list loads automatically. It gives you a balanced mix of clear names, near matches, and more ambiguous cases so you can show how the threshold and tiering logic behave without preparing a separate file.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          Input options
        </h3>
        <div className="rounded-lg border border-border p-5 space-y-2">
          <p className="text-sm font-semibold text-foreground">Use the preloaded list</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The fastest demo path. Switch to Screening Mode and click <strong className="text-foreground">Run Screening</strong>.
          </p>
        </div>
        <div className="rounded-lg border border-border p-5 space-y-2">
          <p className="text-sm font-semibold text-foreground">Upload a file</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Upload a CSV or Excel file when you want to test a custom list. The tool reads the first column and prepares the names for screening.
          </p>
        </div>
        <div className="rounded-lg border border-border p-5 space-y-2">
          <p className="text-sm font-semibold text-foreground">Paste names directly</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Paste one name per line or a comma-separated list. The live counter confirms how many entries are ready before you run the batch.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
          Review and refine
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          After the run, use the threshold control to see how alert volume changes, review the tier legend, and open match details to explain why a result landed where it did. CSV and PDF exports are available when you want to capture the output for a working session or presentation.
        </p>
      </div>

      <div className="rounded-lg border-l-4 border-crowe-amber bg-crowe-amber/10 p-5">
        <p className="text-sm leading-relaxed text-foreground">
          <strong>Demo tip:</strong> Run the preloaded list first, then adjust the threshold to show the tradeoff between broader review coverage and tighter alert volume.
        </p>
      </div>
    </section>
  );
}
