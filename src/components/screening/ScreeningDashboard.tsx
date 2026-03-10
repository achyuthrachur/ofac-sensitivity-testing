'use client';

import { useMemo } from 'react';
import type { MatchResult, RiskTier } from '@/types/screening';
import { TIER_COLORS } from '@/types/screening';
import { OFAC_BENCHMARK_THRESHOLD as _OFAC, assignTierDynamic } from '@/lib/screening/tierUtils';
import { escalateTier } from '@/lib/screening/scorer';

// Re-export the benchmark from tierUtils — use it to compute FP/FN
const OFAC_THRESHOLD = _OFAC; // 0.85

interface ScreeningDashboardProps {
  displayResults: MatchResult[];   // already re-tiered at current threshold
  threshold: number;               // current threshold (0–1)
}

function formatPercent(n: number) {
  return (n * 100).toFixed(1) + '%';
}

const TIER_ORDER: RiskTier[] = ['EXACT', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'];

export function ScreeningDashboard({ displayResults, threshold }: ScreeningDashboardProps) {
  const stats = useMemo(() => {
    const total = displayResults.length;
    if (total === 0) return null;

    // Per-tier counts at current threshold
    const tierCounts: Record<RiskTier, number> = { EXACT: 0, HIGH: 0, MEDIUM: 0, LOW: 0, CLEAR: 0 };
    for (const r of displayResults) tierCounts[r.effectiveTier]++;

    // Average composite score
    const avgScore = displayResults.reduce((sum, r) => sum + r.compositeScore, 0) / total;

    // FP/FN — compare current threshold vs OFAC benchmark (0.85)
    // FP: flagged at current threshold but would be CLEAR at OFAC benchmark (over-alerting)
    // FN: CLEAR at current threshold but would be flagged at OFAC benchmark (missed hits)
    let fpCount = 0;
    let fnCount = 0;

    for (const r of displayResults) {
      const ofacTier = r.nameLengthPenaltyApplied
        ? escalateTier(assignTierDynamic(r.compositeScore, OFAC_THRESHOLD))
        : assignTierDynamic(r.compositeScore, OFAC_THRESHOLD);
      const currentTier = r.effectiveTier;

      const currentFlagged = currentTier !== 'CLEAR';
      const ofacFlagged = ofacTier !== 'CLEAR';

      if (currentFlagged && !ofacFlagged) fpCount++;   // over-flagged
      if (!currentFlagged && ofacFlagged) fnCount++;   // missed hit
    }

    const fpRate = fpCount / total;
    const fnRate = fnCount / total;

    return { total, tierCounts, avgScore, fpRate, fnRate, fpCount, fnCount };
  }, [displayResults, threshold]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!stats) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 bg-muted/40 border-b text-xs flex-shrink-0">

      {/* Total */}
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold text-foreground">{stats.total.toLocaleString()}</span>
      </div>

      <div className="h-3 w-px bg-border" />

      {/* Tier breakdown */}
      {TIER_ORDER.map((tier) => (
        <div key={tier} className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_COLORS[tier] }} />
          <span className="font-semibold text-foreground">{stats.tierCounts[tier]}</span>
          <span className="text-muted-foreground">{tier}</span>
        </div>
      ))}

      <div className="h-3 w-px bg-border" />

      {/* Avg score */}
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">Avg score</span>
        <span className="font-semibold text-foreground">{(stats.avgScore * 100).toFixed(1)}</span>
      </div>

      <div className="h-3 w-px bg-border" />

      {/* FP rate */}
      <div className="flex items-center gap-1.5" title={`${stats.fpCount} names flagged now but clear at OFAC benchmark (0.85)`}>
        <span className="text-muted-foreground">FP rate</span>
        <span className="font-semibold" style={{ color: stats.fpRate > 0.05 ? '#EA580C' : undefined }}>
          {formatPercent(stats.fpRate)}
        </span>
      </div>

      {/* FN rate */}
      <div className="flex items-center gap-1.5" title={`${stats.fnCount} names clear now but flagged at OFAC benchmark (0.85)`}>
        <span className="text-muted-foreground">FN rate</span>
        <span className="font-semibold" style={{ color: stats.fnRate > 0.02 ? '#DC2626' : undefined }}>
          {formatPercent(stats.fnRate)}
        </span>
      </div>

    </div>
  );
}
