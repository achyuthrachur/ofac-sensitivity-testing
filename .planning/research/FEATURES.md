# Feature Research

**Domain:** OFAC Sanctions Screening — Compliance Demo Tool (v3.0 Screening Engine)
**Researched:** 2026-03-06
**Confidence:** HIGH (requirements are specification-grade from MILESTONE-CONTEXT.md; industry patterns verified across multiple sources)

---

## Context: What Already Exists

v2.0 shipped and is live. These capabilities are existing dependencies — do not re-design them:

- Degradation engine: 10 rules, Jaro-Winkler scoring, 285 synthetic SDN entries
- Parameter form at `/tool`: entity counts, regions, rules, client name
- Virtualized results table: TanStack Virtualizer, 6 columns, sortable score column, catch-rate summary
- CSV download: UTF-8 BOM, client name in filename
- Landing page at `/` with hero, how it works, stats, footer
- Engine documentation panel documenting all 10 rules

v3.0 adds two new modes to the existing tool. Everything below is scoped exclusively to those new modes.

---

## Feature Landscape

### Table Stakes (Compliance Analysts Expect These)

Features that a professional screening tool must have. Missing any one causes the tool to feel like a toy rather than a compliance instrument, undermining the demo's credibility.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **5-tier risk labeling** (EXACT/HIGH/MEDIUM/LOW/CLEAR) | Every professional screening platform (Fiserv, ComplyAdvantage, LSEG) uses tiered risk outputs. Binary pass/fail is not credible for a compliance audience | MEDIUM | Tiers defined by threshold bands: ≥0.97, 0.90–0.96, 0.80–0.89, 0.70–0.79, <0.70. Color coding: EXACT = coral, HIGH = amber, MEDIUM = amber-muted, LOW = teal-muted, CLEAR = teal |
| **Hardcoded recommended action strings per tier** | Compliance teams act on disposition strings. Seeing "Do not transact. File SAR..." anchors the demo in real-world consequence | LOW | Five strings specified verbatim in MILESTONE-CONTEXT.md. Not configurable — hardcoding is intentional and legally safer |
| **Color-coded tier badges in results table** | Visual risk triage is the standard analyst workflow. Analysts scan by color before reading text | LOW | Leftmost column. Badge shape preferred over full-row coloring — row coloring strains readability at 10,000 rows |
| **Threshold slider with live re-tiering** | Customizable screening thresholds are cited as the dominant differentiator across all 2025 AML platforms surveyed. Analysts must see threshold impact immediately | MEDIUM | 200ms client-side recompute (all scores pre-computed at load time; re-tiering is O(n) label assignment). Pair slider with numeric input field for precise entry — this pairing is a documented UX best practice |
| **Summary dashboard with tier breakdown counts** | Aggregate view before drilling into rows. Count by tier is the minimum viable dashboard element | LOW | Total screened, badge count per tier (EXACT/HIGH/MEDIUM/LOW/CLEAR). Update live on slider move |
| **Match detail view on row click** | Side-by-side or panel view on row selection is expected in all professional match review tools. Analysts need to see the full record before taking action | MEDIUM | Right-side drawer or panel. Shows full 19-field match schema, all three algorithm scores, recommended action string |
| **CSV and paste input for name list** | File upload is the standard entry point for batch screening across all platforms surveyed. Paste is essential for quick demos without file prep | MEDIUM | Three input modes: CSV upload, .xlsx upload, free-text paste. Max 10,000 names, 10MB file limit |
| **Input validation with actionable error messages** | Vague validation errors cause import abandonment. Every CSV upload study confirms users need row-specific, fix-oriented error context | LOW | Row number + error type + fix instruction. See detailed patterns below |
| **Summary statistics: avg match score, FP/FN rates** | Professional screening outputs are audited. Aggregate accuracy metrics belong in the header dashboard | MEDIUM | Avg match score across all results. FP rate = analyst-marked FPs / total alerts. FN rate = degraded variants that scored CLEAR / total degraded |
| **PDF compliance memo export** | Professional screening outputs are attached to compliance files. CSV alone is insufficient for a Crowe-branded deliverable | HIGH | Crowe header, threshold used, full match schema sorted by risk tier, compliance framing copy, legal disclaimer footer |

### Differentiators (What Makes This Demo Compelling)

Features that distinguish the Crowe tool from a generic screener. Directly support the five-step demo narrative in MILESTONE-CONTEXT.md.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Multi-algorithm scoring with winning algorithm display** | JW alone misses phonetic evasion. Showing that three algorithms agree or disagree is a teachable moment that justifies Crowe's methodology over a client's existing single-algorithm tool | HIGH | JW + Double Metaphone + Token Sort Ratio. Display winning algorithm as a labeled badge per row. Show all three scores in match detail panel. Double Metaphone result is binary (MATCH/NO MATCH) — display as a pill, not a score |
| **"What would OFAC see?" threshold lock** | Instantly frames the demo in regulatory context. A single toggle that locks to the 0.85 industry benchmark removes abstraction and invites the client to compare their own threshold | LOW | Locks slider to 0.85, shows lock icon on slider track. Tooltip: "0.85 is the industry benchmark used by most regulated financial institutions." Unlocking restores previous value |
| **Name-length penalty modifier** | Short names (≤6 chars) are statistically higher-risk. The escalation logic demonstrates algorithmic sophistication that a client's simple threshold tool lacks | LOW | Visual indicator on affected rows ("length penalty applied"). Tier escalates by 1 step for qualifying names |
| **Unicode normalization pre-processing** | Homoglyph substitution (Cyrillic А vs Latin A) is the most common real-world evasion technique in OFAC enforcement actions. Showing the tool detected it is a credibility moment that resonates with technical compliance staff | MEDIUM | Pre/post comparison available in match detail panel. "Unicode normalized" tag on rows where normalization changed the effective input |
| **FP/FN rate counters in dashboard** | Demonstrates the precision-recall tradeoff in real numbers. Clients immediately understand why threshold selection is not arbitrary | MEDIUM | FP rate driven by analyst-marked FP toggles (row-level). FN rate driven by degraded variants that scored CLEAR. Both rates update live as threshold slider moves |
| **False-positive marking toggle per row** | Enables the FP/FN metrics and gives analysts a way to mark noise during a live demo. Also demonstrates that the tool supports analyst review workflow | MEDIUM | Single icon toggle per row. Marked rows get a FP badge overlay on their tier badge. Drives FP rate counter |
| **Cost of Miss calculator** | Anchors the compliance risk conversation in dollar terms. "$2M × 4.0 = $8M" is the narrative's emotional close | MEDIUM | Inputs: transaction value (free text), CLEAR count (auto-populated). Formula: `transaction_value × 4.0 × clear_count`. Fixed multiplier — not configurable. Compliance framing copy below the output |
| **Catch rate time-series chart (Longitudinal Mode)** | Visualizes how catch rates degrade as adversaries escalate evasion tactics — the "before Crowe / after Crowe" story told in a single chart | HIGH | Five required elements: catch rate line, 3 simultaneous threshold bands (0.75/0.85/0.95), vertical evasion tier markers, cumulative miss count on secondary right Y-axis, recovery line after recalibration event. Use Recharts — it is the safest chart library for React/Next.js apps without canvas complexity |
| **Evasion tier markers with hover annotation** | The catch rate chart tells a story only when the degradation inflection points are labeled. Without markers, decline looks random rather than adversarial | MEDIUM | Vertical dashed lines at snapshot N where each tier activates. Label above line: "Tier 1: Basic Obfuscation" etc. Click/hover reveals tooltip with bullet list of tactics introduced at that tier |
| **Velocity presets for simulation** | BASELINE/ELEVATED/SURGE frames threat urgency without requiring the consultant to configure a scenario. The demo works without setup | LOW | Three radio buttons or segmented control. SURGE is the demo closer — default to SURGE. Each preset drives snapshot count and entry rate |
| **Waterfall decomposition table** | Per-entity CAUGHT/MISSED breakdown is what a compliance auditor actually reviews. Green/red rows make the simulation concrete rather than abstract | MEDIUM | Columns: Entity, Base Name, Transformation, Score, Result (CAUGHT/MISSED), Evasion Tier. Default sort: MISSED rows first (bold). Sortable |
| **Detection lag metric** | Quantifies remediation speed as a concrete KPI that clients can present to their BSA Officer. Translates simulation snapshots into operational days | MEDIUM | Per entity: days from SDN add_date to snapshot where all variants are caught. Color-coded against benchmarks: green <1 day, amber <7 days, coral >7 days |
| **Compliance framing copy embedded in UI** | Regulatory liability strings ("OFAC violations do not require intent. Strict liability applies.") establish that this is a compliance instrument, not a toy. The strings reinforce urgency before and after the Cost of Miss output | LOW | Three hardcoded strings from MILESTONE-CONTEXT.md. Render as an info callout near Cost of Miss widget and near EXACT tier results in the table header |

### Anti-Features (Commonly Requested, Often Problematic)

These features should be explicitly rejected in v3.0 scope. Each has surface appeal but creates complexity, legal exposure, or narrative confusion that undermines the demo.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real OFAC SDN API integration** | "Can this use the real list?" is a common client ask | Real SDN names in a client-facing demo create compliance risk. The tool is a demonstration instrument, not a production screener. Real names could create legal issues if the tool is misused by someone outside the controlled demo context | Keep synthetic data. Clarify authenticity with UI copy: "285 synthetic entries, structurally identical to real SDN records" |
| **Configurable recommended action strings** | Seems like a power feature for enterprise clients | Action strings are legally significant. Custom strings could contradict BSA guidance and expose Crowe to liability if a client relies on them in a real compliance decision | Hardcode all five strings verbatim. No edit mode. No customization |
| **Session persistence and save-and-resume** | Users want to return to a previous screening run | Adds auth, storage, and state complexity. The tool is a live demo instrument — sessions are intentionally ephemeral. Storage creates GDPR/data retention questions even for synthetic data | Ensure CSV and PDF exports are comprehensive. A full re-run takes less than 10 seconds |
| **Real-time collaborative review** | Multiple analysts reviewing simultaneously during a workshop | WebSocket or shared state architecture would add significant infrastructure complexity for a single-user demo context | Single-user per session by design. PDF export is the handoff mechanism for team review |
| **Configurable evasion tier timing in Longitudinal Mode** | Power users want control over when tiers activate | Destroys the narrative clarity of the demo. The five-step story depends on consistent tier activation points that the consultant has rehearsed | Fixed activation points within each preset. Demo coherence is more valuable than configuration flexibility |
| **Mobile-responsive layout** | General best-practice pressure | Explicitly out-of-scope in PROJECT.md. Demo runs on a consultant's laptop at a client site. Adding responsive layout adds significant CSS complexity to TanStack Virtualizer containers | Add a minimum viewport width gate (1024px) with a desktop-only notice for narrow screens |
| **Analyst notes text field per row** | Seems useful for documenting review rationale | Notes stored in client memory only — lost on page close. Creates expectation that this is a workflow tool it is not. Adds state management complexity | FP marking toggle is sufficient for demo purposes. The PDF export analyst_notes field is left blank for post-export completion by the actual analyst |
| **Batch multi-threshold comparison** | Running the same list at three thresholds simultaneously | Complex layout, unclear primary affordance, and high render cost at 10,000 names × 3 thresholds. The threshold slider already shows this comparison interactively | Threshold slider covers the interactive comparison. The three-band chart in Longitudinal Mode covers the static comparison |
| **Excel (.xlsx) output** | Clients often prefer Excel | CSV with UTF-8 BOM opens cleanly in Excel for all character sets. Explicitly out-of-scope in PROJECT.md | CSV download is sufficient. Consider labeling the button "Download for Excel" if client preference is a concern |
| **Per-entity sparkline micro-charts in waterfall table** | Rich visualization of entity-level catch rate history | High implementation cost relative to demo value. Detection lag metric already quantifies what sparklines would visualize | Defer to v3.1. Detection lag + CAUGHT/MISSED column covers the analytical need |

---

## Feature Dependencies

```
[Screening Mode: Core Pipeline]
    ├──requires──> [CSV/paste input + validation]
    ├──requires──> [Unicode normalization pre-processing]
    ├──requires──> [Multi-algorithm scoring engine]
    │                   ├──requires──> [Jaro-Winkler (existing)]
    │                   ├──requires──> [Double Metaphone implementation]
    │                   └──requires──> [Token Sort Ratio implementation]
    ├──requires──> [Name-length penalty modifier]
    └──produces──> [Scored result array — all scores pre-computed and cached in client state]

[Screening Mode: UI Layer]
    ├──requires──> [Scored result array]
    ├──requires──> [5-tier threshold engine]
    │                   └──consumes──> [Scored result array + current threshold value]
    ├──requires──> [Threshold slider + numeric input pair]
    │                   └──drives──> [Live re-tiering of scored result array]
    │                   └──drives──> [Summary dashboard update]
    │                   └──drives──> [FP/FN rate counter update]
    ├──requires──> [Results table with tier badges]
    │                   └──requires──> [Winning algorithm badge per row]
    │                   └──requires──> [FP marking toggle per row]
    │                   └──enables──> [Match detail drawer on row click]
    ├──requires──> [Summary dashboard]
    │                   ├──requires──> [FP marking toggle] (drives FP rate)
    │                   └──requires──> [5-tier engine] (drives tier counts)
    └──requires──> ["What would OFAC see?" toggle]
                       └──mutates──> [Threshold slider position]

[Cost of Miss calculator]
    ├──requires──> [5-tier engine + CLEAR count output]
    └──shared with──> [Longitudinal Mode] (same widget, same formula, same component)

[PDF export]
    └──requires──> [Complete 19-field match schema populated]
                       └──requires──> [Multi-algorithm scoring engine]
                       └──requires──> [5-tier threshold engine]
                       └──requires──> [FP marking state]

[Longitudinal Simulation Mode]
    ├──requires──> [Snapshot data model] (per-update, not calendar time)
    ├──requires──> [Velocity presets] (BASELINE/ELEVATED/SURGE)
    ├──requires──> [Catch rate chart]
    │                   ├──requires──> [3 threshold band overlays]
    │                   ├──requires──> [Evasion tier vertical markers]
    │                   ├──requires──> [Cumulative miss count secondary Y-axis]
    │                   └──requires──> [Recovery line simulation]
    ├──requires──> [Waterfall decomposition table]
    └──enhances via──> [Detection lag metric per entity]
```

### Dependency Notes

- **Multi-algorithm scoring must ship as a unit.** Tier assignment takes the MAX score across all three algorithms. If JW ships first and DM/TS are added later, tier assignments will change for existing results — this is a data model change that breaks re-runs. Build all three algorithms together in one phase.
- **Threshold slider requires pre-computed score cache.** All scores must be computed once at screen-time and stored in client state (a flat `ScoredResult[]` array). Re-tiering on slider move is then O(n) label assignment — no algorithm re-execution. Without this, 10,000 names × slider drag will be visibly laggy at >150ms per update.
- **FP/FN counters have different data sources.** FP rate = analyst-marked FPs / total above-threshold results (driven by FP toggle state). FN rate = degraded variants that scored CLEAR / total degraded variants (driven by the existing degradation engine output being available in context). These are separate counters with separate data pipelines.
- **PDF export requires all 19 schema fields.** Build the full match record schema before building the PDF generator. Partial schema = incomplete memo = unusable output.
- **Longitudinal Mode and Screening Mode share the Cost of Miss widget.** Build once as a shared component. Both modes render it; both pass in transaction value (user input) and miss count (mode-specific calculation).
- **Evasion tier markers must not animate simultaneously with the recovery line.** Stagger tier marker entrance (animate in during chart build at the snapshot where each tier activates), then introduce recovery line after a 500ms delay post-build. Simultaneous animation creates visual noise.
- **Double Metaphone result is not a 0–1 score.** It is binary: phonetic match or no phonetic match. Do not attempt to show it as a score bar in the UI. Display as a "PHONETIC MATCH" pill (green) or empty (gray). The winning algorithm logic must handle this: if DM is a match and its implied score exceeds JW and TS scores, award DM the win.

---

## MVP Definition

This is v3.0 of a shipped product with a known client demo narrative. "MVP" here means the minimum that makes the five-step demo narrative from MILESTONE-CONTEXT.md function end-to-end. The narrative is the acceptance test.

### Launch With (v3.0)

- [ ] **Multi-algorithm scoring engine (JW + Double Metaphone + Token Sort Ratio)** — the demo cannot open without it; all downstream features depend on it
- [ ] **5-tier threshold engine** — drives tier badges, dashboard, and the narrative's pivot moment
- [ ] **CSV/paste input with 5-step validation flow** — Step 1 of the narrative requires uploading a client list
- [ ] **Threshold slider + numeric input pair with live re-tiering** — Step 4 ("At your threshold, 14 slip through") is the demo's pivot moment
- [ ] **"What would OFAC see?" threshold lock at 0.85** — frames the regulatory standard in Step 4
- [ ] **Summary dashboard: tier counts + FP/FN rates** — makes Step 4 quantitative
- [ ] **Cost of Miss calculator** — Step 3 ("$2M × 4.0 = $8M") is the emotional close
- [ ] **Tier badges + recommended action strings visible in table** — compliance framing throughout
- [ ] **Match detail panel on row click showing winning algorithm** — Step 2 requires showing individual names that cleared and why
- [ ] **FP marking toggle per row** — drives FP rate counter; demonstrates analyst review UX
- [ ] **Unicode normalization pre-processing** — required for Cyrillic/Arabic homoglyph evasion detection
- [ ] **Name-length penalty modifier** — flags short-name risk escalation
- [ ] **Longitudinal Mode: velocity presets + snapshot data model** — SURGE is the demo closer
- [ ] **Longitudinal Mode: catch rate chart with 3 threshold bands + evasion tier markers** — Step 5 visualization
- [ ] **Longitudinal Mode: cumulative miss count secondary axis** — makes the chart's cost tangible
- [ ] **Longitudinal Mode: recovery line after recalibration event** — completes the "what Crowe does" story
- [ ] **Waterfall decomposition table with CAUGHT/MISSED rows** — gives Step 5 per-entity detail
- [ ] **Detection lag metric** — translates simulation snapshots into operational days, a client-usable KPI
- [ ] **PDF compliance memo export** — the leave-behind; completes the demo engagement

### Add After Validation (v3.1)

- [ ] **Unicode normalization row badge** — currently planned as a row-level indicator; defer if build time is tight; the pre-processing still runs, just without the visual tag
- [ ] **Per-entity sparkline micro-charts in waterfall table** — nice depth, but detection lag metric covers the core need
- [ ] **Character diff visualization** — useful for understanding transformations; the transformation label column suffices for v3.0

### Future Consideration (v3.2+)

- [ ] **Analyst review workflow** — FP marking with persistent notes, batch disposition, requires session state or localStorage strategy
- [ ] **Batch multi-threshold comparison** — same list at 3 thresholds side by side; valid for deep engagements, not the demo
- [ ] **Real OFAC XML delta file import** — high compliance sensitivity, requires legal review before building
- [ ] **Export simulation as animated GIF** — novel for slide presentations, complex to implement, marginal value vs PDF

---

## Feature Prioritization Matrix

| Feature | Demo Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Multi-algorithm scoring engine | HIGH | HIGH | P1 |
| 5-tier threshold engine | HIGH | MEDIUM | P1 |
| CSV/paste input + validation | HIGH | MEDIUM | P1 |
| Threshold slider (live 200ms re-tier) | HIGH | MEDIUM | P1 |
| "What would OFAC see?" toggle | HIGH | LOW | P1 |
| Cost of Miss calculator | HIGH | LOW | P1 |
| Tier badges + recommended action strings | HIGH | LOW | P1 |
| Match detail panel (winning algorithm display) | HIGH | MEDIUM | P1 |
| Summary dashboard (tier counts, FP/FN rates) | MEDIUM | MEDIUM | P1 |
| FP marking toggle per row | MEDIUM | MEDIUM | P1 |
| Unicode normalization pre-processing | HIGH | MEDIUM | P1 |
| Name-length penalty modifier | MEDIUM | LOW | P1 |
| Longitudinal: snapshot data model + velocity presets | HIGH | MEDIUM | P1 |
| Longitudinal: catch rate chart | HIGH | HIGH | P1 |
| Longitudinal: evasion tier markers | HIGH | MEDIUM | P1 |
| Longitudinal: cumulative miss secondary axis | MEDIUM | MEDIUM | P1 |
| Longitudinal: recovery line | MEDIUM | MEDIUM | P1 |
| Waterfall decomposition table | MEDIUM | MEDIUM | P1 |
| Detection lag metric | MEDIUM | MEDIUM | P1 |
| PDF compliance memo export | HIGH | HIGH | P1 |
| Unicode normalization row badge | LOW | LOW | P2 |
| Per-entity sparkline micro-charts | LOW | HIGH | P3 |
| Character diff visualization | LOW | MEDIUM | P3 |

**Priority key:** P1 = required for v3.0 demo · P2 = add if time allows · P3 = v3.1+

---

## Detailed UX Patterns Per Feature Area

### 1. Results Table at 10,000 Names

Use TanStack Virtualizer (already in the codebase — this is a constraint, not a choice). Do not paginate. Pagination creates interaction friction during a live demo; virtual scroll already performs at this scale.

**Default sort:** Tier descending (EXACT first, CLEAR last). Secondary sort: score descending within tier. Do not collapse into tier groups — collapsible sections add a click-interaction overhead when scanning for EXACT and HIGH results. Flat sorted list with color-coded tier badge in the leftmost column is faster to scan.

**Filter controls above table (the three analysts actually need):**
1. Tier filter (multi-select checkboxes: EXACT / HIGH / MEDIUM / LOW / CLEAR)
2. Algorithm filter (JW / DM / TS / any) — useful for demonstrating which algorithm drove specific matches
3. FP-only toggle (show only analyst-marked false positives)

**Column set (8 columns — remaining 11 schema fields appear in match detail panel):**
1. Risk Tier badge (80px fixed)
2. Input Name (240px)
3. SDN Match (240px)
4. Algorithm badge: JW/DM/TS (80px)
5. Score (numeric, 70px)
6. SDN Program (100px)
7. Recommended Action (truncated, full text on row click, 200px)
8. FP Toggle icon button (50px fixed)

### 2. Threshold Slider UX

Always pair the slider with a numeric input field. The slider provides intuitive sweep across the range; the number field allows typing 0.87 precisely. This pairing is the industry-standard pattern for precision control tools.

**Feedback on slider move:**
- Live badge update on every row (color and label change in place, no re-render flicker)
- Summary dashboard tier counts update in real time
- FP/FN rate counters update in real time
- Delta indicator: "+12 cases added / -3 cases removed" relative to the previous threshold position (show 2 seconds, fade out)
- Prominent below-slider label: "At this threshold: X names require analyst review"

**Re-tiering performance:** 200ms constraint is achievable. All scores are pre-computed at screen-time and stored in a flat `ScoredResult[]` array. Re-tiering is a single O(n) pass assigning tier labels from score lookups — no algorithm re-execution. At 10,000 names this takes <10ms in JavaScript.

**"What would OFAC see?" toggle behavior:** Locks slider to 0.85. Show a lock icon (Iconsax `Lock` Bold) on the slider track. Tooltip: "0.85 is the industry benchmark threshold." Unlocking restores the previously set value.

### 3. Multi-Algorithm Scoring Display

**Winning algorithm badge:** Small labeled badge per row. Color convention: JW = indigo-core (standard), DM = amber (phonetic match — more notable finding), TS = teal (structural match). The badge communicates which mechanism elevated the match, which is the teachable moment in Step 2 of the demo narrative.

**Match detail panel layout:**
```
Input Name:            [full input string]
SDN Match:             [matched name]             [SDN UID]
Match Type:            AKA / Primary Name
AKA Matched:           [if applicable]
SDN Program:           IRAN / CYBER / etc.
Entity Type:           Individual / Business / Vessel / Aircraft

Algorithm Scores:
  Jaro-Winkler:        0.87  [score bar]
  Double Metaphone:    [PHONETIC MATCH pill]  or  [NO MATCH, gray]
  Token Sort Ratio:    0.91  [score bar]   <- WINNING

Winning Algorithm:     Token Sort Ratio
Risk Tier:             HIGH
Threshold Used:        0.85
Transformation:        Space removal + char substitution
Name-Length Penalty:   Applied (≤6 chars) / Not applied
Unicode Normalized:    Yes / No

Recommended Action:
  "Place on hold. Senior analyst review required within 2
   business hours. Do not release funds."

[Mark as False Positive]    [Export This Record]
```

**Double Metaphone handling:** DM is binary — phonetic match or no phonetic match. Display as a green "PHONETIC MATCH" pill when matched, or a gray "NO MATCH" pill when not. Do not show a score bar for DM. For the winning algorithm logic: if DM produces a phonetic match, treat its effective score as 1.0 for tier determination purposes. If DM wins, the tier badge shows DM and the winning algorithm badge shows amber.

### 4. PDF Compliance Memo Format

**Required sections (in order):**
1. **Header:** Crowe LLP logo (top left), document title "OFAC Sensitivity Screening Report", generation date, tool version
2. **Screening Parameters:** Client name, threshold used, "What would OFAC see?" state, total names screened, date/time
3. **Executive Summary:** Tier breakdown table (counts and percentages for all 5 tiers), average match score, FP rate, FN rate
4. **Cost of Exposure:** If Cost of Miss was calculated — transaction value, CLEAR count, formula, total exposure
5. **Compliance Notice:** Three hardcoded liability strings verbatim
6. **Match Records — Immediate Action Required (EXACT + HIGH):** Full record table sorted by score descending. Recommended action string in bold. All non-notes schema fields shown
7. **Match Records — Analyst Review Queue (MEDIUM):** Same format, labeled "Pending analyst review within 1 business day"
8. **Match Records — Logged (LOW + CLEAR):** Name list only, not full record tables. Count + list
9. **Footer on every page:** "Generated by Crowe OFAC Sensitivity Testing Tool · Synthetic data only — not for use in production compliance programs · [date]"

**Branding:** Crowe Indigo (#011E41) header band, Crowe Amber (#F5A800) accents on tier labels. Use Helvetica Neue (not Helvetica Now — PDF embedding requires licensed font binaries; Helvetica Neue is universally available as a system font).

**Library recommendation:** Use `@react-pdf/renderer`. It gives full design control over Crowe branding. `jsPDF` is faster to implement but visually limited and harder to control typographically. The PDF memo is a Crowe deliverable — branding fidelity justifies the slightly higher implementation cost of `@react-pdf/renderer`.

**The footer disclaimer is legally required on every page.** "Not for use in production compliance programs" protects Crowe if the memo is extracted from its demo context and misused.

### 5. Longitudinal Simulation UX

**What makes it persuasive:**
- Default to SURGE preset. Maximum visual impact (catch rate drops 94% → 71%). The consultant should not have to configure the scenario before showing it.
- Animate the chart building snapshot-by-snapshot (20ms per snapshot interval). The "live simulation" feel makes the deterioration feel real rather than static.
- Evasion tier markers should animate in as vertical wipes at the snapshot where each tier activates during the build animation.
- Pre-draw the three threshold band lines before the animation starts. They are reference lines — seeing them from the beginning lets the audience track where the catch rate is relative to each threshold as it descends.

**What makes it confusing:**
- Too many lines competing. Limit: catch rate line (indigo-dark, 2px solid), three threshold bands (light gray, 1px dashed), recovery line (amber, 2px dashed). Cumulative miss bars semi-transparent so they do not compete with the lines.
- Labels at every point. Label each threshold band only at the right edge. Label evasion tier markers above the vertical line only.
- X-axis labeled as "Days" when the unit is actually "SDN Update Events." Label it "SDN Update Events" to prevent misinterpretation. Days at the current preset velocity can appear as a secondary X-axis label below.

**Evasion tier introduction annotations:**
- Vertical dashed line (indigo, 50% opacity) at the snapshot where each tier activates
- Label above line: "Tier 1: Basic Obfuscation" / "Tier 2: Homoglyphs + Reversal" / "Tier 3: Transliteration Drift"
- Click or hover on the marker reveals a tooltip with the bullet list of tactics introduced at that tier (from MILESTONE-CONTEXT.md Tier 1/2/3 definitions)

**Detection lag table placement:** Below the waterfall table, not inline in the chart. Chart is already visually dense. Columns: Entity, Evasion Tier, First Missed Snapshot, First Caught Snapshot, Lag (snapshots), Lag (days at preset rate). Color-code Lag column: green ≤1 day, amber ≤7 days, coral >7 days.

### 6. File Upload Validation and Feedback

**Five-step import flow:**
1. **Drop zone / file picker:** Accept .csv and .xlsx. Show accepted formats, max size (10MB, 10,000 names), and a "Download template CSV" button.
2. **Parse preview:** Show first 5 rows. Auto-detect delimiter. Show detected column headers. If no recognized name column found, proceed to step 3 rather than blocking.
3. **Column mapping:** Auto-match headers: "name", "full_name", "entity", "entity_name" → map to the name column. Show which column was matched and allow manual override. If no name-like column exists after user correction, block with a clear message.
4. **Validation report:** Row count, duplicate count (names that appear more than once), encoding issues (non-UTF-8 characters), rows with empty name field. Separate "errors" (block proceed) from "warnings" (allow with notice).
5. **Confirm and screen:** "Screen 847 names (12 duplicates excluded, 3 rows skipped for empty name)" → Run button.

**Actionable error message patterns (not vague):**
- "Row 14: Empty name field — this row will be skipped" (not "Invalid row")
- "Row 22: Name exceeds 200 characters — truncated to 200 for screening" (not "Too long")
- "3 duplicate names detected: Al-Rashid Trading, Omar Khalil, Shen Wei (first 3 shown). Duplicates will be screened once."
- "File appears to use Windows-1252 encoding. Non-Latin characters may not match correctly. Re-saving as UTF-8 will improve accuracy."

**Blocking errors:**
- "PDF file uploaded — this tool accepts CSV and Excel (.xlsx) only"
- "File exceeds 10MB — please split into smaller batches of 5,000 names or fewer"
- "No rows found after header — check that the file contains data below the header row"

**Paste mode:** Textarea with placeholder "Paste names here — one per line, or comma-separated." Live parse on blur. Show "Detected 47 names" badge immediately. No column mapping needed for paste — names are plain text strings. Duplicate detection still applies.

### 7. Cost of Miss Calculator

**Inputs:**
- Transaction value (currency-formatted free text input)
- Names cleared (auto-populated from CLEAR count in current results; editable for demo flexibility)

**Formula:**
```
Per-slip exposure  = transaction_value × 4.0
Total exposure     = per_slip_exposure × clear_count
```

**The 4.0 multiplier rationale (for consultant use, not displayed to client):** OFAC civil penalty guidelines (31 CFR Appendix A) provide that for a non-self-disclosed egregious violation under IEEPA, the maximum statutory penalty is "the greater of $356,579 or twice the amount of the underlying transaction" for per-violation caps, but consent orders and multi-violation cases can reach 4× or more of underlying transaction value. The 4.0 factor is a conservative worst-case multiplier suitable for client-facing exposure framing. This multiplier is hardcoded — changing it changes the legal framing and is not appropriate for user configuration.

**Display format:**
```
Transaction value entered:    $2,000,000
Names that cleared screening: 14
Exposure per slip-through:    $8,000,000
Total potential exposure:     $112,000,000

"Each name that passed screening undetected represents
 up to $8M in potential OFAC civil penalty exposure."
```

**Compliance framing copy below the calculator (hardcoded, verbatim from MILESTONE-CONTEXT.md):**
- "OFAC violations do not require intent. Strict liability applies."
- "Civil penalty: $368K (non-egregious, self-disclosed) to $1.47M (egregious) per transaction — 2024 OFAC guidelines"
- "Average remediation cost for mid-size bank consent order: $50M–$200M"

Do not allow the user to change the multiplier, add multiple transaction scenarios, or enter custom penalty amounts. The calculator's job is to make consequence vivid for the client audience, not to serve as a regulatory compliance tool.

---

## Competitor Feature Analysis

| Feature | ComplyAdvantage / LSEG (enterprise) | NameScan / dilisense (entry-level) | Crowe Tool (v3.0) |
|---------|--------------------------------------|-------------------------------------|-------------------|
| Risk tiers | 5+ tiers with full case management workflow | Pass/fail with numeric match score | 5 tiers, no case management — demo tool |
| Threshold control | Admin-configured, not analyst-adjustable in real time | Fixed threshold | Real-time slider — unique demo differentiator |
| Multi-algorithm | Yes, black-box (scores not exposed to user) | Single fuzzy match algorithm | Transparent: winning algorithm shown per row — explains the methodology |
| Export | CSV and API only | CSV | PDF compliance memo — quality differentiator for Crowe-branded deliverable |
| Longitudinal / simulation | Not available | Not available | Unique to this tool — no competitor has a time-series simulation mode |
| Input | API or admin batch upload | Web form or file upload | CSV + paste + Excel — full coverage for demo flexibility |
| Cost framing | Not present | Not present | Cost of Miss calculator with OFAC penalty figures — unique demo anchor |
| Compliance framing copy | Buried in documentation | Not present | Embedded in UI near results and in PDF export — reinforces urgency throughout |

---

## Sources

- [OFAC Civil Penalties and Enforcement Information 2024](https://ofac.treasury.gov/civil-penalties-and-enforcement-information/2024-enforcement-information) — penalty formula verification, 4.0 multiplier rationale (HIGH confidence — official government source)
- [OFAC Economic Sanctions Enforcement Guidelines 31 CFR Appendix A](https://www.law.cornell.edu/cfr/text/31/appendix-A_to_part_501) — base penalty calculation structure, per-violation caps (HIGH confidence — primary regulatory source)
- [OFAC Enforcement in 2024: Calculating Civil Penalties — HG.org](https://www.hg.org/legal-articles/ofac-enforcement-in-2024-calculating-civil-penalties-64915) — penalty multiplier context and egregious vs non-egregious framing (MEDIUM confidence — legal commentary)
- [Top 10 AML Sanctions Screening Software 2025 — sanctions.io](https://www.sanctions.io/blog/blog-top-aml-sanctions-software-2025) — feature comparison, threshold customization as table stakes across platforms (MEDIUM confidence — industry survey)
- [AML Watch List Filtering — Fiserv](https://www.fiserv.com/en/solutions/risk-and-compliance/fraud-risk-and-aml-compliance-management/aml-watch-list-filtering.html) — analyst workflow, tier-based filtering patterns, risk-based approach (MEDIUM confidence — enterprise product documentation)
- [Best UI Patterns for File Uploads — CSVBox](https://blog.csvbox.io/file-upload-patterns/) — five-step import flow, duplicate detection, actionable error message patterns (MEDIUM confidence — product blog with UX research citations)
- [Prevent Duplicate Records During Spreadsheet Uploads — CSVBox](https://blog.csvbox.io/prevent-duplicate-records-spreadsheet-uploads/) — duplicate detection UX and validation feedback (MEDIUM confidence)
- [Importance of Simulation in AML Transaction Monitoring — Sanction Scanner](https://www.sanctionscanner.com/blog/importance-of-simulation-in-aml-transaction-monitoring-342) — sandbox and simulation approaches in AML compliance tooling (MEDIUM confidence)
- [How Time-Based Data Transforms AML Compliance — Vysatc](https://vysatc.com/how-time-based-data-turns-noisy-aml-alerts-into-clear-risk-signals/) — time series analysis, timeline-based risk scoring for compliance (MEDIUM confidence)
- [Fuzzy Matching 101 — Data Ladder](https://dataladder.com/fuzzy-matching-101/) — multi-algorithm approach rationale, combining JW and Metaphone for typographic + phonetic coverage (MEDIUM confidence)
- [Slider UI Examples — Eleken](https://www.eleken.co/blog-posts/slider-ui) — slider + numeric input pairing as UX best practice for precision tools (MEDIUM confidence)
- `.planning/MILESTONE-CONTEXT.md` — primary specification source, all hardcoded strings and formulas (HIGH confidence — directly from product owner)
- `.planning/PROJECT.md` — existing constraints, out-of-scope items, technical facts (HIGH confidence)

---

*Feature research for: OFAC Sensitivity Testing Tool v3.0 Screening Engine*
*Researched: 2026-03-06*
