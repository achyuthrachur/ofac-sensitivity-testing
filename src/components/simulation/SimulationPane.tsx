'use client';

import { useState, useMemo } from 'react';
import { Refresh2 } from 'iconsax-reactjs';
import type { SimulationPresetId } from '@/types/simulation';
import { SIMULATION_PRESETS } from '@/lib/simulation/presets';
import { runSimulation } from '@/lib/simulation/engine';
import { SimulationChart } from './SimulationChart';
import { WaterfallTable } from './WaterfallTable';
import { CostOfMissCalculator } from '@/components/shared/CostOfMissCalculator';

const PRESET_IDS: SimulationPresetId[] = ['BASELINE', 'ELEVATED', 'SURGE'];

export function SimulationPane() {
  const [selectedPreset, setSelectedPreset] = useState<SimulationPresetId>('BASELINE');
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [recalibrationInput, setRecalibrationInput] = useState('');
  const [recalibrationAt, setRecalibrationAt] = useState<number | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState(0);

  // Run is synchronous — wrap in setTimeout(0) to let UI update (spinner) before blocking
  const result = useMemo(() => {
    if (!hasRun) return null;
    return runSimulation(selectedPreset);
  }, [hasRun, selectedPreset]);

  const handleRun = () => {
    setIsRunning(true);
    setHasRun(false);
    setTimeout(() => {
      setHasRun(true);
      setSelectedSnapshot(0);
      setRecalibrationAt(null);
      setRecalibrationInput('');
      setIsRunning(false);
    }, 0);
  };

  const handleRecalibration = () => {
    const val = parseInt(recalibrationInput, 10);
    if (!result || isNaN(val) || val < 0 || val >= result.snapshots.length) return;
    setRecalibrationAt(val);
  };

  const currentSnapshot = result?.snapshots[selectedSnapshot] ?? null;
  const config = SIMULATION_PRESETS[selectedPreset];

  return (
    <div className="flex flex-col h-full gap-4">

      {/* ── Controls row ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 flex-wrap flex-shrink-0">

        {/* Preset selector */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase text-muted-foreground">Velocity Preset</span>
          <div className="flex gap-2">
            {PRESET_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => { setSelectedPreset(id); setHasRun(false); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                  selectedPreset === id
                    ? 'bg-crowe-indigo-dark text-white border-crowe-indigo-dark'
                    : 'bg-card text-foreground border-border hover:bg-muted'
                }`}
              >
                {SIMULATION_PRESETS[id].label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground max-w-sm">{config.description}</p>
        </div>

        {/* Run button */}
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="bg-crowe-amber text-crowe-indigo-dark text-sm font-semibold py-2 px-6 rounded-md
                       hover:bg-crowe-amber-dark disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Refresh2 size={16} color="currentColor" className="size-auto animate-spin" />
                Running…
              </>
            ) : (
              'Run Simulation'
            )}
          </button>
        </div>

        {/* Recalibration event input — only when result is available */}
        {result && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Recalibration Event</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={result.snapshots.length - 1}
                placeholder={`0–${result.snapshots.length - 1}`}
                value={recalibrationInput}
                onChange={(e) => setRecalibrationInput(e.target.value)}
                className="w-24 px-2 py-1.5 text-xs rounded-md border bg-background focus:outline-none
                           focus:ring-2 focus:ring-crowe-indigo-core/40"
              />
              <button
                type="button"
                onClick={handleRecalibration}
                className="text-xs px-2 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
              >
                Set
              </button>
              {recalibrationAt !== null && (
                <button
                  type="button"
                  onClick={() => { setRecalibrationAt(null); setRecalibrationInput(''); }}
                  className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Empty state ───────────────────────────────────────────────────────── */}
      {!result && !isRunning && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-sm">Select a velocity preset and run the simulation.</p>
            <p className="text-xs mt-1 max-w-sm">
              The simulation shows how OFAC catch rates evolve as sanctioned entities escalate evasion tactics.
            </p>
          </div>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────────── */}
      {result && (
        <div className="flex flex-col flex-1 min-h-0 gap-3">

          {/* Chart */}
          <div className="border rounded-lg bg-card p-3 flex-shrink-0">
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Catch Rate Evolution — {SIMULATION_PRESETS[result.preset].label} ({result.snapshots.length} snapshots)
            </p>
            <SimulationChart
              snapshots={result.snapshots}
              selectedSnapshot={selectedSnapshot}
              onSnapshotSelect={setSelectedSnapshot}
              recalibrationAt={recalibrationAt}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Click any point on the chart to inspect that snapshot in the table below.
            </p>
          </div>

          {/* Bottom split — waterfall table + Cost of Miss */}
          <div className="flex flex-1 min-h-0 gap-3">

            {/* Waterfall table */}
            <div className="flex-1 border rounded-lg bg-card overflow-hidden">
              {currentSnapshot ? (
                <WaterfallTable
                  rows={currentSnapshot.entityRows}
                  snapshotIndex={currentSnapshot.snapshotIndex}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground p-4">
                  Click a snapshot on the chart to see entity-level detail.
                </div>
              )}
            </div>

            {/* Cost of Miss + detection lag summary */}
            <div className="w-72 flex flex-col gap-3 flex-shrink-0">
              <CostOfMissCalculator />

              {/* Detection lag summary */}
              <div className="border rounded-lg bg-card p-4 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Detection Lag Summary
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {result.entities.map((entity) => (
                    <div key={entity.id} className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="text-foreground truncate flex-1">{entity.baseName}</span>
                      <span className={`font-mono flex-shrink-0 ${entity.detectionLag === null ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                        {entity.detectionLag === null
                          ? 'Not detected'
                          : `+${entity.detectionLag}s`}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground pt-1 border-t">
                  Entities showing "Not detected" should be flagged for enhanced due diligence.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
