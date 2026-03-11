'use client';

import { useMemo } from 'react';
import type { MatchResult, RiskTier } from '@/types/screening';
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
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {[
        {
          label: 'Total reviewed',
          value: stats.total.toLocaleString(),
          tone: 'text-crowe-indigo-dark',
        },
        {
          label: 'Average score',
          value: (stats.avgScore * 100).toFixed(1),
          tone: 'text-crowe-indigo-dark',
        },
        {
          label: 'Tier spread',
          value: TIER_ORDER.map((tier) => `${stats.tierCounts[tier]} ${tier}`).join(' | '),
          tone: 'text-crowe-indigo-dark',
          compact: true,
        },
        {
          label: 'FP rate',
          value: formatPercent(stats.fpRate),
          tone: stats.fpRate > 0.05 ? 'text-crowe-amber' : 'text-crowe-indigo-dark',
        },
        {
          label: 'FN rate',
          value: formatPercent(stats.fnRate),
          tone: stats.fnRate > 0.02 ? 'text-destructive' : 'text-crowe-indigo-dark',
        },
      ].map((item) => (
        <div
          key={item.label}
          className="executive-panel rounded-[1.5rem] border border-white/80 px-4 py-4"
        >
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7b8ea5]">
            {item.label}
          </p>
          <p className={`mt-3 ${item.compact ? 'text-sm leading-6' : 'text-3xl'} font-semibold ${item.tone}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
