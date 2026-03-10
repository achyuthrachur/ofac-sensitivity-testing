'use client';

import { useState, useMemo } from 'react';
import { Lock, DocumentDownload, Document } from 'iconsax-reactjs';
import { Slider } from '@/components/ui/slider';
import type { MatchResult, RiskTier } from '@/types/screening';
import { TIER_COLORS } from '@/types/screening';
import { assignTierDynamic, OFAC_BENCHMARK_THRESHOLD } from '@/lib/screening/tierUtils';
import { escalateTier } from '@/lib/screening/scorer';
import { ScreeningNameList } from '@/components/screening/ScreeningNameList';
import { MatchDetailCard } from '@/components/screening/MatchDetailCard';
import { ScreeningDashboard } from '@/components/screening/ScreeningDashboard';
import { CostOfMissCalculator } from '@/components/shared/CostOfMissCalculator';
import { exportCsv, exportPdf } from '@/lib/exportUtils';
import { TierLegend } from '@/components/education/TierLegend';
import { toast } from 'sonner';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ScreeningResultsPaneProps {
  matchResults: MatchResult[];         // raw scored results from worker
  activeNamesCount: number;            // for the collapsed header display
  onChangeNames: () => void;           // called when user clicks "Change" (clears matchResults in parent)
}

// ─── Tier order for summary bar ───────────────────────────────────────────────

const TIER_ORDER: RiskTier[] = ['EXACT', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'];

// ─── ScreeningResultsPane ─────────────────────────────────────────────────────

export function ScreeningResultsPane({
  matchResults,
  activeNamesCount,
  onChangeNames,
}: ScreeningResultsPaneProps) {
  const [threshold, setThreshold] = useState(0.80);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Re-tier all results when threshold changes — O(n) pure map, no worker call
  const displayResults = useMemo((): MatchResult[] => {
    return matchResults.map((r) => {
      const riskTier = assignTierDynamic(r.compositeScore, threshold);
      const effectiveTier = r.nameLengthPenaltyApplied ? escalateTier(riskTier) : riskTier;
      return { ...r, riskTier, effectiveTier };
    });
  }, [matchResults, threshold]);

  // Tier count summary — recalculates whenever displayResults changes
  const tierCounts = useMemo(() => {
    const counts: Record<RiskTier, number> = { EXACT: 0, HIGH: 0, MEDIUM: 0, LOW: 0, CLEAR: 0 };
    for (const r of displayResults) counts[r.effectiveTier]++;
    return counts;
  }, [displayResults]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleThresholdChange = ([val]: number[]) => {
    if (!isLocked) setThreshold(val / 100);
  };

  const handleOFACLock = () => {
    setIsLocked(true);
    setThreshold(OFAC_BENCHMARK_THRESHOLD);
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleExportCsv = () => {
    exportCsv(displayResults);
    toast.success('Exported results.csv');
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportPdf(displayResults);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">

      {/* 1. Collapsed header bar */}
      <div className="flex items-center justify-between px-4 py-2 rounded-lg border bg-card mb-3 flex-shrink-0">
        <span className="text-sm text-muted-foreground">
          {activeNamesCount.toLocaleString()} names loaded
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1 text-xs text-crowe-indigo-core hover:text-crowe-indigo-dark transition-colors"
            title="Download CSV"
          >
            <DocumentDownload size={14} color="currentColor" />
            CSV
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1 text-xs text-crowe-indigo-core hover:text-crowe-indigo-dark transition-colors disabled:opacity-50"
            title="Export PDF compliance memo"
          >
            <Document size={14} color="currentColor" />
            {isExportingPdf ? 'Generating…' : 'PDF'}
          </button>
          <button
            type="button"
            onClick={onChangeNames}
            className="text-xs underline text-crowe-indigo-core hover:text-crowe-indigo-dark transition-colors"
          >
            Change
          </button>
        </div>
      </div>

      {/* 2. Sticky threshold header bar */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-4 flex-wrap flex-shrink-0">

        {/* Threshold label + slider */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground whitespace-nowrap">
            Threshold
          </span>
          <Slider
            min={50}
            max={99}
            step={1}
            value={[Math.round(threshold * 100)]}
            onValueChange={handleThresholdChange}
            disabled={isLocked}
            className="w-36"
          />
          <span className="text-xs font-mono text-muted-foreground w-6">
            {(threshold * 100).toFixed(0)}
          </span>
        </div>

        {/* Tier count summary */}
        <div className="flex items-center gap-3 flex-1">
          {TIER_ORDER.map((tier) => (
            <div key={tier} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: TIER_COLORS[tier] }}
              />
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{tierCounts[tier]}</span>
                {' '}{tier}
              </span>
            </div>
          ))}
        </div>

        {/* OFAC lock button area */}
        <div className="flex items-center gap-2">
          {!isLocked ? (
            <button
              type="button"
              onClick={handleOFACLock}
              className="text-xs border border-border rounded-md px-2 py-1 hover:bg-muted transition-colors"
            >
              What would OFAC see?
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Lock size={14} color="var(--muted-foreground)" variant="Bold" />
              <span className="text-xs text-muted-foreground">
                Locked at OFAC benchmark (0.85)
              </span>
              <button
                type="button"
                onClick={handleUnlock}
                className="text-xs underline text-crowe-indigo-core hover:text-crowe-indigo-dark transition-colors"
              >
                Unlock threshold
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Dashboard — aggregate metrics, updates with threshold */}
      <ScreeningDashboard displayResults={displayResults} threshold={threshold} />

      {/* 4. Split pane */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left pane — 40% */}
        <div className="w-[40%] flex-shrink-0 border-r overflow-hidden h-full flex flex-col">
          <div className="px-3 pt-3">
            <TierLegend />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
          <ScreeningNameList
            results={displayResults}
            selectedIndex={selectedIndex}
            onRowSelect={setSelectedIndex}
          />
          </div>
        </div>

        {/* Right pane — 60% */}
        <div className="flex-1 overflow-y-auto h-full flex flex-col gap-4 p-4">
          <MatchDetailCard
            result={selectedIndex !== null ? displayResults[selectedIndex] : null}
          />
          <CostOfMissCalculator />
        </div>

      </div>

    </div>
  );
}
