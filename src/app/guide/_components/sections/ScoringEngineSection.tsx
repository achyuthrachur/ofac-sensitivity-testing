// Pure Server Component — no 'use client'

export function ScoringEngineSection() {
  return (
    <section id="scoring-engine" className="scroll-mt-20 space-y-8">
      <h2 className="text-2xl font-bold text-crowe-indigo-dark">Scoring Engine</h2>

      {/* Why Three Algorithms */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Why Three Algorithms
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No single string-similarity algorithm catches every SDN evasion pattern.
          Jaro-Winkler excels at character-level typos and transliteration but fails when names
          are reordered. Double Metaphone catches pronunciation variants that look completely
          different in writing but sound the same — but it cannot encode CJK or Arabic script.
          Token Sort Ratio handles word-order variations that defeat character-level algorithms
          entirely. The three-algorithm composite produces a score that is more robust than any
          individual algorithm alone.
        </p>
      </div>

      {/* Algorithm Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Algorithm Details
        </h3>

        {/* Card 1 — Jaro-Winkler */}
        <div className="rounded-lg border border-border p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Jaro-Winkler</p>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">Weight: 60%</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Measures character-level similarity with extra credit for matching prefix characters.
            Produces a score from 0 (completely different) to 1 (identical). Highly effective for
            short strings — personal names, entity names — and tolerates transposition errors,
            abbreviations, and transliteration variants. This is the highest-weighted algorithm
            because name screening is inherently a short-string problem.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">When it leads:</strong> Jaro-Winkler wins when no
            other algorithm produces a stronger signal. It is the default algorithm for Latin-script
            names without word-order issues.
          </p>
        </div>

        {/* Card 2 — Double Metaphone */}
        <div className="rounded-lg border border-border p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Double Metaphone</p>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">Weight: 25%</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Encodes a name as one or two phonetic codes representing how it sounds rather than how
            it is spelled. If any phonetic code from the input name matches any phonetic code from
            the SDN entry, the algorithm contributes a 1.0 bonus to the composite score. This
            catches pronunciations that look completely different in writing: OSAMA and USAMAH
            produce the same phonetic code.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Limitation:</strong> Double Metaphone cannot encode
            CJK or Arabic-script names — it returns empty codes for those inputs. Two
            empty-code inputs do not produce a false-positive match (the tool guards against this
            explicitly).
          </p>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">When it leads:</strong> Double Metaphone wins
            (overrides other scores) when phonetic codes overlap — signaling that two names sound
            identical regardless of spelling.
          </p>
        </div>

        {/* Card 3 — Token Sort Ratio */}
        <div className="rounded-lg border border-border p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Token Sort Ratio</p>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">Weight: 15%</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Splits each name on whitespace, sorts the tokens alphabetically, joins them back into a
            string, then computes Jaro-Winkler on the sorted result. This makes the score
            word-order invariant. HASSAN ALI and ALI HASSAN produce identical sorted strings and
            therefore score 1.0 against each other. Particularly important for Arabic names, where
            given name and family name order varies by country and data-entry convention.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">When it leads:</strong> Token Sort Ratio wins when
            its sorted-string JW score beats the raw JW score — indicating the match is primarily a
            word-order issue rather than character-level similarity.
          </p>
        </div>
      </div>

      {/* Composite Formula */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Composite Formula
        </h3>
        <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm text-center">
          composite = (JW &times; 0.6) + (DM_bonus &times; 0.25) + (TSR &times; 0.15)
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The composite score is always between 0 and 1. The weights reflect empirical performance
          on the 285-entry synthetic dataset: JW carries the most weight because it is the most
          reliable for the range of name patterns in the dataset; DM and TSR provide targeted
          bonuses for their specific strengths.
        </p>
      </div>

      {/* The Five Risk Tiers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          The Five Risk Tiers
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every match result is assigned to one of five risk tiers based on the composite score.
        </p>
        <div className="space-y-2">

          {/* EXACT */}
          <div className="flex items-start gap-4 rounded-lg border border-border p-4">
            <span className="flex-shrink-0 text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded mt-0.5">
              EXACT
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">composite &ge; 0.97</p>
              <p className="text-sm text-muted-foreground">
                Automatic block recommended. Score is consistent with an identical or near-identical
                match. Manual review required before any transaction proceeds.
              </p>
            </div>
          </div>

          {/* HIGH */}
          <div className="flex items-start gap-4 rounded-lg border border-border p-4">
            <span className="flex-shrink-0 text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded mt-0.5">
              HIGH
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">composite &ge; 0.90</p>
              <p className="text-sm text-muted-foreground">
                Strong hit — high confidence of a true positive. Escalate to compliance officer
                immediately.
              </p>
            </div>
          </div>

          {/* MEDIUM */}
          <div className="flex items-start gap-4 rounded-lg border border-border p-4">
            <span className="flex-shrink-0 text-xs font-bold bg-yellow-500 text-crowe-indigo-dark px-2 py-0.5 rounded mt-0.5">
              MEDIUM
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">composite &ge; 0.80</p>
              <p className="text-sm text-muted-foreground">
                Probable hit — moderate confidence. Review match context and additional identifying
                information.
              </p>
            </div>
          </div>

          {/* LOW */}
          <div className="flex items-start gap-4 rounded-lg border border-border p-4">
            <span className="flex-shrink-0 text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded mt-0.5">
              LOW
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">composite &ge; 0.70</p>
              <p className="text-sm text-muted-foreground">
                Possible hit — low confidence. Document review and rationale for proceeding.
              </p>
            </div>
          </div>

          {/* CLEAR */}
          <div className="flex items-start gap-4 rounded-lg border border-border p-4">
            <span className="flex-shrink-0 text-xs font-bold bg-green-600 text-white px-2 py-0.5 rounded mt-0.5">
              CLEAR
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">composite &lt; 0.70</p>
              <p className="text-sm text-muted-foreground">
                No actionable match. Standard transaction processing may proceed.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Name-Length Penalty */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Name-Length Penalty
        </h3>
        <div className="rounded-lg border-l-4 border-crowe-amber bg-crowe-amber/10 p-4">
          <p className="text-sm text-foreground leading-relaxed">
            Short names (6 characters or fewer, excluding spaces) are escalated one tier
            automatically. A MEDIUM score for a 5-character name becomes HIGH; a LOW score becomes
            MEDIUM. The rationale: short names have less distinguishing information, so a 0.82
            composite score on a 5-character name is more likely to represent a genuine match than
            the same score on a 15-character name. The raw composite score and the effective
            (post-penalty) tier are both shown in the match results.
          </p>
        </div>
      </div>

      {/* Unicode Normalization */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-crowe-indigo-dark border-b border-border pb-2">
          Unicode Normalization
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The scoring engine normalizes every name before any algorithm runs. The normalization
          pipeline, applied in this order:
        </p>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="flex-shrink-0 text-crowe-indigo-dark font-semibold">(1)</span>
            <span className="leading-relaxed">
              <strong className="text-foreground">Cyrillic homoglyph substitution</strong> — 18
              Cyrillic characters that look identical to Latin letters (Р→R, О→O, А→A, and 15
              others) are replaced with their Latin equivalents. NFKD decomposition alone cannot
              distinguish Cyrillic Р from Latin R visually, which is why this step runs first.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 text-crowe-indigo-dark font-semibold">(2)</span>
            <span className="leading-relaxed">
              <strong className="text-foreground">NFKD Unicode decomposition</strong> — decomposes
              precomposed characters into base character + combining mark.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 text-crowe-indigo-dark font-semibold">(3)</span>
            <span className="leading-relaxed">
              <strong className="text-foreground">Strip combining marks</strong> — removes all
              combining diacritical marks (Unicode category Mn).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 text-crowe-indigo-dark font-semibold">(4)</span>
            <span className="leading-relaxed">
              <strong className="text-foreground">Uppercase.</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 text-crowe-indigo-dark font-semibold">(5)</span>
            <span className="leading-relaxed">
              <strong className="text-foreground">Trim whitespace.</strong>
            </span>
          </li>
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This pipeline ensures that a name entered with a Cyrillic О instead of a Latin O scores
          identically to the all-Latin version — catching a common document-scanning obfuscation
          pattern.
        </p>
      </div>
    </section>
  );
}
