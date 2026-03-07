// Pure Server Component — no 'use client'

export function ScreeningModeSection() {
  return (
    <section id="screening-mode" className="scroll-mt-20 space-y-8">
      <h2 className="text-2xl font-bold text-crowe-indigo-dark">Screening Mode</h2>

      {/* What It Does */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          What It Does
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Screening Mode lets you run a name list against the full 285-entry synthetic SDN dataset.
          Every input name is scored against all 285 SDN entries and the best match is returned —
          with a risk tier, a match score, and the winning algorithm. Use Screening Mode to show
          clients what a real screening run looks like against a representative dataset.
        </p>
      </div>

      {/* The Pre-Loaded List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          The Pre-Loaded List
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The tool includes a pre-loaded list of 50 synthetic client names. The list is
          intentionally constructed: 12 names are near-matches to SDN entries (testing how the
          scoring engine handles real-world similarity), 28 are clearly unrelated (establishing the
          expected CLEAR tier baseline), and 10 are edge cases designed to test the name-length
          penalty and phonetic-matching paths. The order is deliberate — do not sort the list before
          running a demo, as it is structured to build a narrative.
        </p>
      </div>

      {/* Input Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Input Options
        </h3>

        {/* Option A */}
        <div className="rounded-lg border border-border p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Option A — Use the Pre-Loaded List</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No action required. The 50 synthetic names are loaded automatically when you switch to
            Screening Mode. Click <strong className="text-foreground">Run Screening</strong> to
            proceed.
          </p>
        </div>

        {/* Option B */}
        <div className="rounded-lg border border-border p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Option B — Upload a File</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Click the upload area and select a CSV or Excel (.xlsx) file. For CSV: one name per row;
            an optional header row in the first column is automatically detected and skipped. For
            Excel: the first column of the first sheet is used. Files are parsed entirely in your
            browser — no data is sent to any server.
          </p>
        </div>

        {/* Option C */}
        <div className="rounded-lg border border-border p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Option C — Paste Names</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Click the paste text area and type or paste names directly. Accepted formats: one name
            per line, or comma-separated on a single line. A live count updates as you type.
          </p>
        </div>
      </div>

      {/* Input Limits and Validation */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Input Limits and Validation
        </h3>
        <div className="rounded-lg border-l-4 border-crowe-amber bg-crowe-amber/10 p-4">
          <p className="text-sm text-foreground leading-relaxed">
            The tool accepts a maximum of 10,000 names per screening run. Submitting more than
            10,000 names shows a validation error before the run starts. Malformed rows (empty
            lines, duplicate names, names longer than 200 characters) generate per-row error
            messages identifying the row number and a specific fix instruction.
          </p>
        </div>
      </div>

      {/* Run Screening */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Run Screening
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Once names are loaded (pre-loaded list or your own import), click{' '}
          <strong className="text-foreground">Run Screening</strong>. The engine runs in a
          background Web Worker — the UI stays responsive during the run. Results appear when the
          full dataset has been processed.
        </p>
      </div>

      {/* Phase 18 note */}
      <div className="rounded-lg border-l-4 border-crowe-amber bg-crowe-amber/10 p-4">
        <p className="text-sm text-foreground leading-relaxed">
          <strong>Note:</strong> The full results view — tier badges, detail cards, and threshold
          slider — is coming in the next release. The current release shows screening results in the
          benchmark panel. The tier badge system and compliance framing described in the Scoring
          Engine section below reflect the complete scoring logic that is already live.
        </p>
      </div>
    </section>
  );
}
