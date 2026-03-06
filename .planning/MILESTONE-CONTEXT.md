# Milestone Context: v3.0 — Screening Engine

**Source:** User-provided production-grade requirements (2026-03-06)
**Status:** Ready for new-milestone workflow after v2.0 completes

---

## Milestone Goal

Transform the tool from a degradation demonstration into an actual OFAC screening engine — capable of screening real or synthetic name lists against the SDN dataset, and simulating how catch rates evolve as the SDN list grows and adversaries adopt evasion tactics over time.

## Two New Modes

### Mode 1: Screening Mode

Upload/paste a name list → screen against SDN dataset → tiered risk results with compliance framing.

**Core capabilities:**
- 5-tier threshold scoring (EXACT ≥0.97 / HIGH 0.90–0.96 / MEDIUM 0.80–0.89 / LOW 0.70–0.79 / CLEAR <0.70)
- Multi-algorithm scoring: Jaro-Winkler + Double Metaphone (phonetic) + Token Sort Ratio — display winning algorithm per result
- Name-length penalty: names ≤6 chars escalate effective tier by 1
- Unicode normalization pre-processing (catches Cyrillic/Arabic homoglyph substitution — the biggest real-world evasion)
- Configurable threshold slider — real-time re-tiering within 200ms (client-side recompute)
- "What would OFAC see?" toggle — locks threshold to 0.85 (industry benchmark)
- FP/FN counters: False Positive rate (analyst-marked) + False Negative rate (degraded variants that cleared)
- Cost of Miss calculator: `transaction value × 4.0 = OFAC penalty exposure per slip-through`
- Input: CSV upload, Excel (.xlsx) upload, paste/manual entry (one per line or comma-separated)
- Max 10,000 names per session (10MB file limit)
- Export: PDF compliance memo (Crowe LLP header, threshold used, match records sorted by risk tier)
- Split-pane results: left = input list with color-coded tiers, right = detail card on row click
- Summary dashboard: total screened, tier breakdown badges, avg match score, FP/FN rates

**Per-match result record (all fields required in export):**
input_name, input_row_number, input_metadata, sdn_matched_name, sdn_uid, sdn_aka_matched,
sdn_program, sdn_entity_type, match_score, match_algorithm, match_type, transformation_detected,
risk_tier, recommended_action, false_positive_flag, analyst_notes, screened_at, threshold_used, tool_version

**Recommended action strings (hardcoded):**
- EXACT: "Do not transact. File SAR if transaction was attempted. Escalate to BSA Officer immediately."
- HIGH: "Place on hold. Senior analyst review required within 2 business hours. Do not release funds."
- MEDIUM: "Flag for analyst review within 1 business day. Transaction may proceed with documented clearance."
- LOW: "Log result. Review at next scheduled batch. No transaction hold required."
- CLEAR: "No action required. Record retained per retention policy."

### Mode 2: Longitudinal Simulation Mode

Simulate how catch rates evolve as the SDN list grows over time and adversaries introduce progressively sophisticated evasion tactics.

**Core capabilities:**
- Per-update snapshot model (not calendar time — each snapshot = one SDN list publication event)
- Three velocity presets: BASELINE (15 entries/update, every 3 days), ELEVATED (75 entries/update, every 2 days), SURGE (300 entries/update, daily)
- Three evasion tiers introduced sequentially:
  - Tier 1 (immediate): transliteration switching, char substitution, spacing changes, honorific add/remove
  - Tier 2 (short-term): Unicode homoglyphs, name reversal, nickname substitution
  - Tier 3 (long-term): acronym adoption, transliteration to third language, cumulative drift
- Each of the 10 existing degradation rules labeled with evasion tier + "documented in practice: yes/no"
- Configurable "recalibration event" at snapshot N — shows catch rate recovery when threshold is lowered

**Chart (5 required elements):**
1. Catch rate line over snapshots (primary Y-axis, 0–100%)
2. Three simultaneous threshold bands (0.75, 0.85, 0.95) as overlapping lines
3. Vertical dashed markers where each evasion tier is introduced, labeled
4. Cumulative miss count bar overlay (secondary right Y-axis — absolute count, not rate)
5. Recovery line after recalibration event

**Waterfall decomposition table (per snapshot):**
Entity | Base Name | Transformation | Score | Result (CAUGHT/MISSED) | Evasion Tier
Green rows = CAUGHT. Red rows = MISSED (bold).

**Detection lag metric:**
Per entity: days from SDN add_date to snapshot where 100% of variants are caught.
Target benchmark to show clients: <1-day Tier 1, <7-day Tier 2, Tier 3 → enhanced due diligence flag.

**Per-entity tracking:**
- first_caught_snapshot, first_missed_snapshot
- evasion_tier_variants: { tier1: [...], tier2: [...], tier3: [...] }
- Sparkline micro-chart (nice-to-have): per-entity catch rate history

**Compliance framing in UI copy (exact strings):**
- "OFAC violations do not require intent. Strict liability applies."
- "Civil penalty: $368K (non-egregious, self-disclosed) to $1.47M (egregious) per transaction — 2024 OFAC guidelines"
- "Average remediation cost for mid-size bank consent order: $50M–$200M"

## Must-Haves Summary

### Screening Mode
- Tiered threshold scoring (5 tiers)
- Multi-algorithm scoring (JW + Double Metaphone + Token Sort)
- Full match result schema
- Threshold slider (200ms live update)
- FP/FN dashboard
- PDF export (compliance memo format)
- CSV/Excel/paste input
- Name-length penalty modifier
- Unicode normalization
- Cost of Miss calculator

### Longitudinal Mode
- Per-update snapshot data model
- Catch rate chart with 3 threshold bands
- Evasion tier markers on chart
- Waterfall decomposition table
- Cumulative miss count secondary axis
- Detection lag metric per entity
- Cost of Miss calculator (same widget, shared)
- Three velocity presets
- Recovery line simulation

## Nice-to-Haves (v3.1+)
- Analyst review workflow (FP marking, notes)
- Character diff visualization
- Batch multi-threshold comparison (same list at 3 thresholds)
- Per-entity sparkline micro-charts
- Export simulation as animated GIF
- Real OFAC XML delta file import

## The Five-Step Demo Narrative (the closer)
1. Show client's own anonymized list run through screening
2. Show 2–3 names that WOULD HAVE CLEARED due to Tier 1 evasion
3. Cost of Miss: "$2M × 4.0 = $8M exposure per event"
4. Threshold slider: "At your threshold, 14 slip through. At ours, 2 — but +40 analyst cases/week"
5. Longitudinal SURGE scenario: catch rate drops 94% → 71% within 10 simulated days

---

*Captured: 2026-03-06 | Use with /gsd:new-milestone after v2.0 complete*
