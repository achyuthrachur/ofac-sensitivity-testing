'use client';

// Aesthetic direction: Swiss editorial executive.
import { useMemo, useState } from 'react';
import { Document, DocumentDownload, Lock } from 'iconsax-reactjs';
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

interface ScreeningResultsPaneProps {
  matchResults: MatchResult[];
  activeNamesCount: number;
  onChangeNames: () => void;
}

const TIER_ORDER: RiskTier[] = ['EXACT', 'HIGH', 'MEDIUM', 'LOW', 'CLEAR'];

export function ScreeningResultsPane({
  matchResults,
  activeNamesCount,
  onChangeNames,
}: ScreeningResultsPaneProps) {
  const [threshold, setThreshold] = useState(0.8);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const displayResults = useMemo((): MatchResult[] => {
    return matchResults.map((result) => {
      const riskTier = assignTierDynamic(result.compositeScore, threshold);
      const effectiveTier = result.nameLengthPenaltyApplied ? escalateTier(riskTier) : riskTier;
      return { ...result, riskTier, effectiveTier };
    });
  }, [matchResults, threshold]);

  const tierCounts = useMemo(() => {
    const counts: Record<RiskTier, number> = { EXACT: 0, HIGH: 0, MEDIUM: 0, LOW: 0, CLEAR: 0 };
    for (const result of displayResults) counts[result.effectiveTier]++;
    return counts;
  }, [displayResults]);

  const handleThresholdChange = ([value]: number[]) => {
    if (!isLocked) setThreshold(value / 100);
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

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="executive-panel rounded-[1.8rem] border border-white/80 px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7b8ea5]">
              Screening results
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-crowe-indigo-dark">Analyst review shell</h3>
            <p className="mt-2 text-sm leading-6 text-crowe-tint-700">
              Review the queue, adjust the threshold, and export the analyst-ready output without
              leaving the workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-[#d6dde7] bg-white px-4 py-2 text-sm font-semibold text-crowe-indigo-dark">
              {activeNamesCount.toLocaleString()} names loaded
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-full border border-[#d6dde7] bg-white px-4 py-2 text-sm font-semibold text-crowe-indigo-dark transition-colors hover:border-crowe-indigo-core"
            >
              <DocumentDownload size={16} color="currentColor" />
              CSV
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 rounded-full border border-[#d6dde7] bg-white px-4 py-2 text-sm font-semibold text-crowe-indigo-dark transition-colors hover:border-crowe-indigo-core disabled:opacity-50"
            >
              <Document size={16} color="currentColor" />
              {isExportingPdf ? 'Generating...' : 'PDF'}
            </button>
            <button
              type="button"
              onClick={onChangeNames}
              className="inline-flex items-center rounded-full bg-crowe-amber px-4 py-2 text-sm font-semibold text-crowe-indigo-dark transition-colors hover:bg-crowe-amber-dark"
            >
              Change names
            </button>
          </div>
        </div>
      </div>

      <div className="executive-panel rounded-[1.8rem] border border-white/80 px-5 py-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b8ea5]">
                  Threshold controls
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Slider
                    id="screening-threshold"
                    min={50}
                    max={99}
                    step={1}
                    value={[Math.round(threshold * 100)]}
                    onValueChange={handleThresholdChange}
                    disabled={isLocked}
                    aria-label="Screening threshold"
                    aria-describedby="screening-threshold-help"
                    className="w-full max-w-xs"
                  />
                  <span className="w-12 text-right text-sm font-semibold text-crowe-indigo-dark">
                    {(threshold * 100).toFixed(0)}
                  </span>
                </div>
                <p id="screening-threshold-help" className="mt-2 max-w-2xl text-xs text-muted-foreground">
                  Lower thresholds surface more possible matches. Higher thresholds reduce alert
                  volume but can hide weaker hits.
                </p>
              </div>

              {!isLocked ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsLocked(true);
                    setThreshold(OFAC_BENCHMARK_THRESHOLD);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d6dde7] bg-white px-4 py-2 text-sm font-semibold text-crowe-indigo-dark transition-colors hover:border-crowe-indigo-core"
                >
                  <Lock size={16} color="currentColor" variant="Linear" />
                  What would OFAC see?
                </button>
              ) : (
                <div className="rounded-[1.2rem] border border-[#d6dde7] bg-white px-4 py-3 text-sm text-crowe-indigo-dark">
                  Locked at OFAC benchmark (0.85).{' '}
                  <button
                    type="button"
                    onClick={() => setIsLocked(false)}
                    className="font-semibold text-crowe-amber transition-colors hover:text-crowe-amber-bright"
                  >
                    Unlock
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {TIER_ORDER.map((tier) => (
                <div
                  key={tier}
                  className="rounded-full border border-[#d6dde7] bg-white px-4 py-2 text-sm text-crowe-indigo-dark"
                >
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: TIER_COLORS[tier] }}
                  />
                  <span className="font-semibold">{tierCounts[tier]}</span> {tier}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-[#d6dde7] bg-white p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7b8ea5]">
              Queue legend
            </p>
            <div className="mt-3">
              <TierLegend />
            </div>
          </div>
        </div>
      </div>

      <ScreeningDashboard displayResults={displayResults} threshold={threshold} />

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(320px,0.46fr)_minmax(0,1fr)]">
        <div className="executive-panel flex min-h-0 flex-col rounded-[1.8rem] border border-white/80">
          <div className="border-b border-[#dde5ef] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b8ea5]">
              Result queue
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden px-2 pb-2 pt-3">
            <ScreeningNameList
              results={displayResults}
              selectedIndex={selectedIndex}
              onRowSelect={setSelectedIndex}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <div className="executive-panel min-h-[340px] rounded-[1.8rem] border border-white/80 p-4">
            <MatchDetailCard result={selectedIndex !== null ? displayResults[selectedIndex] : null} />
          </div>
          <div className="executive-panel rounded-[1.8rem] border border-white/80 p-4">
            <CostOfMissCalculator />
          </div>
        </div>
      </div>
    </div>
  );
}
