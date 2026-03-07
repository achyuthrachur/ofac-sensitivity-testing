// Pure Server Component — no 'use client'

export function OfacContextSection() {
  return (
    <>
      {/* Page-level intro — before the OFAC Context section heading */}
      <div className="space-y-4 pb-4 border-b border-border">
        <p className="text-base text-muted-foreground leading-relaxed">
          This tool is designed for compliance consultants demonstrating OFAC screening effectiveness
          to financial institution clients. It has two modes:{' '}
          <strong className="text-foreground">Sensitivity Test</strong> (how well would your
          screening system catch evasion tactics?) and{' '}
          <strong className="text-foreground">Screening Mode</strong> (does your client list contain
          any SDN near-matches?). Use the sidebar to jump to any section.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed">
          All name data in this tool is synthetic — no real SDN names, no real client names are ever
          loaded or transmitted.
        </p>
      </div>

      {/* OFAC Compliance Context section */}
      <section id="ofac-context" className="scroll-mt-20 space-y-8">
        <h2 className="text-2xl font-bold text-crowe-indigo-dark">OFAC Compliance Context</h2>

        {/* 1.1 — What Is OFAC? */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
            What Is OFAC?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Office of Foreign Assets Control (OFAC) is a financial intelligence and enforcement
            agency within the U.S. Department of the Treasury. OFAC administers and enforces
            economic and trade sanctions based on U.S. foreign policy and national security goals
            against targeted foreign countries, terrorists, international narcotics traffickers, and
            others.
          </p>
        </div>

        {/* 1.2 — The SDN List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
            The SDN List
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Specially Designated Nationals (SDN) list is OFAC&apos;s primary enforcement tool —
            a continuously updated registry of individuals, companies, vessels, and aircraft whose
            assets are blocked and with whom U.S. persons are generally prohibited from doing
            business. As of 2025 the SDN list contains over 13,000 entries. Financial institutions
            are required to screen customer names, counterparty names, and transaction parties
            against the SDN list before processing transactions.
          </p>
        </div>

        {/* 1.3 — Why Sensitivity Testing Matters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
            Why Sensitivity Testing Matters
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Screening systems differ in their ability to catch name variants — intentional or
            accidental variations in how a sanctioned name appears. A system that only catches
            exact-match entries will miss transliteration variants (OSAMA vs USAMAH), word-order
            differences (HASSAN ALI vs ALI HASSAN), and character substitutions (BILAL vs 81L@L).
            Sensitivity testing measures the catch rate: what percentage of degraded name variants
            would your system flag?
          </p>
          {/* Amber-accent callout */}
          <div className="rounded-lg border-l-4 border-crowe-amber bg-crowe-amber/10 p-4">
            <p className="text-sm text-foreground leading-relaxed">
              A catch rate of 85% means 15 out of every 100 degraded variants would escape detection
              unnoticed. For a large-volume transaction processor, this represents a meaningful
              compliance exposure.
            </p>
          </div>
        </div>

        {/* 1.4 — Cost of Miss */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
            Cost of Miss
          </h3>
          {/* Dark callout */}
          <div className="rounded-xl bg-crowe-indigo-dark p-6 space-y-3">
            <p className="text-lg font-semibold text-white">Cost of Miss</p>
            <p className="text-sm text-white/80 leading-relaxed">
              When an SDN hit escapes detection, the institution may be liable for a civil penalty of
              up to four times the transaction value. A single missed $1,000,000 transaction carries
              a potential OFAC exposure of{' '}
              <strong className="text-crowe-amber">$4,000,000</strong>. This 4.0&times; multiplier
              is derived from OFAC civil penalty guidelines and is hardcoded into the tool&apos;s
              Cost of Miss calculation.
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              The tool uses this multiplier in the dashboard to translate abstract catch-rate
              percentages into concrete dollar figures — making the compliance argument tangible for
              client presentations.
            </p>
          </div>
        </div>

        {/* 1.5 — How Consultants Use This Tool */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
            How Consultants Use This Tool
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The standard demonstration narrative runs as follows: first, run the Sensitivity Test to
            establish a baseline catch rate with the client&apos;s current screening configuration.
            Next, show which degradation rules defeat the screening system — these are the
            vulnerabilities. Then switch to Screening Mode and run the same logic against the
            client&apos;s own name list to show that the three-algorithm composite raises the catch
            rate compared to a simple string-match system. The goal is to give clients a data-driven
            reason to review and strengthen their screening configuration — backed by dollar figures
            rather than abstract percentages.
          </p>
        </div>
      </section>
    </>
  );
}
