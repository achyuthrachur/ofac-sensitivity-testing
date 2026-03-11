export function OfacContextSection() {
  return (
    <>
      <div className="space-y-4 border-b border-border pb-4">
        <p className="text-base leading-relaxed text-muted-foreground">
          This tool supports client conversations about sanctions-screening effectiveness. It combines a controlled sensitivity exercise, a batch-screening workflow, and a simple simulation view so users can explain current performance, likely blind spots, and the operational impact of missed matches.
        </p>
        <p className="text-base leading-relaxed text-muted-foreground">
          All names used in the demo are synthetic. No real client list and no live watchlist data are required to run the workflow.
        </p>
      </div>

      <section id="ofac-context" className="scroll-mt-20 space-y-8">
        <h2 className="text-2xl font-bold text-crowe-indigo-dark">OFAC Compliance Context</h2>

        <div className="space-y-3">
          <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
            What is OFAC?
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The Office of Foreign Assets Control administers and enforces U.S. sanctions programs. Financial institutions use screening controls to identify names and entities that may require a block, reject, or escalation decision before a transaction proceeds.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
            Why sensitivity matters
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A screening control can look effective on exact matches and still struggle with realistic name variation. Transliteration changes, reordered tokens, omitted suffixes, and typing noise can all weaken match quality if the configuration is too rigid.
          </p>
          <div className="rounded-lg border-l-4 border-crowe-amber bg-crowe-amber/10 p-5">
            <p className="text-sm leading-relaxed text-foreground">
              A catch rate of 85 percent means 15 out of every 100 tested variants would not clear the threshold. That gap is often the most useful starting point for a control-tuning conversation.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
            Cost of a missed match
          </h3>
          <div className="space-y-3 rounded-xl bg-crowe-indigo-dark p-5">
            <p className="text-lg font-semibold text-white">Cost of Miss</p>
            <p className="text-sm leading-relaxed text-white/80">
              The calculator in the tool turns a missed alert into an estimated dollar exposure by applying a multiplier to the transaction value. It is there to make the risk discussion concrete and easier to communicate in a working session.
            </p>
            <p className="text-sm leading-relaxed text-white/80">
              The number is not a legal conclusion. It is a directional way to connect screening quality with operational and compliance impact.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="border-b border-border pb-2 text-lg font-semibold text-crowe-indigo-dark">
            Typical demo flow
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A strong walkthrough starts with Sensitivity Test, moves into Screening Mode with the preloaded batch, and ends with the Baseline simulation. That sequence helps users explain current performance, review threshold tradeoffs, and discuss how controls may age as evasion tactics change.
          </p>
        </div>
      </section>
    </>
  );
}
