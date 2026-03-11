'use client';

// Aesthetic direction: Swiss editorial executive.
import { useMemo, useState } from 'react';
import { Refresh2 } from 'iconsax-reactjs';
import type { SimulationPresetId } from '@/types/simulation';
import { SIMULATION_PRESETS } from '@/lib/simulation/presets';
import { runSimulation } from '@/lib/simulation/engine';
import { SimulationChart } from './SimulationChart';
import { WaterfallTable } from './WaterfallTable';
import { CostOfMissCalculator } from '@/components/shared/CostOfMissCalculator';
import { EmptySimulationState } from '@/components/states/EmptySimulationState';
import { Label } from '@/components/ui/label';

const PRESET_IDS: SimulationPresetId[] = ['BASELINE', 'ELEVATED', 'SURGE'];

export function SimulationPane() {
  const [selectedPreset, setSelectedPreset] = useState<SimulationPresetId>('BASELINE');
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [recalibrationInput, setRecalibrationInput] = useState('');
  const [recalibrationAt, setRecalibrationAt] = useState<number | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState(0);

  const result = useMemo(() => {
    if (!hasRun) return null;
    return runSimulation(selectedPreset);
  }, [hasRun, selectedPreset]);

  const config = SIMULATION_PRESETS[selectedPreset];
  const currentSnapshot = result?.snapshots[selectedSnapshot] ?? null;

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
    const value = parseInt(recalibrationInput, 10);
    if (!result || Number.isNaN(value) || value < 0 || value >= result.snapshots.length) return;
    setRecalibrationAt(value);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="executive-panel rounded-[1.8rem] border border-white/80 px-5 py-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7b8ea5]">
              Simulation controls
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-crowe-indigo-dark">Catch-rate decay model</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-crowe-tint-700">
              Select the evasion velocity profile, run the simulation, and isolate the snapshot where
              recalibration becomes necessary.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-crowe-amber px-5 py-3 text-sm font-semibold text-crowe-indigo-dark transition-colors hover:bg-crowe-amber-dark disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Refresh2 size={16} color="currentColor" className="size-auto animate-spin" />
                Running...
              </>
            ) : (
              'Run Simulation'
            )}
          </button>
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-3 md:grid-cols-3">
            {PRESET_IDS.map((id, index) => {
              const active = selectedPreset === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(id);
                    setHasRun(false);
                  }}
                  className={[
                    'rounded-[1.35rem] border p-4 text-left transition-all',
                    active
                      ? 'border-[#011E41] bg-[#011E41] text-white shadow-[0_16px_36px_rgba(1,30,65,0.18)]'
                      : 'border-[#d6dde7] bg-white text-crowe-indigo-dark hover:border-crowe-indigo-core',
                  ].join(' ')}
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] opacity-60">
                    0{index + 1}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{SIMULATION_PRESETS[id].label}</p>
                  <p className={`mt-2 text-sm leading-6 ${active ? 'text-white/74' : 'text-crowe-tint-700'}`}>
                    {SIMULATION_PRESETS[id].description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-[1.35rem] border border-[#d6dde7] bg-white p-4">
            <Label htmlFor="simulation-recalibration" className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b8ea5]">
              Recalibration event
            </Label>
            <p id="simulation-recalibration-help" className="mt-2 text-xs leading-5 text-muted-foreground">
              Mark the snapshot where the model would be tuned again to restore catch-rate performance.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <input
                id="simulation-recalibration"
                type="number"
                min={0}
                max={result ? result.snapshots.length - 1 : 0}
                placeholder={result ? `0-${result.snapshots.length - 1}` : 'Run first'}
                value={recalibrationInput}
                onChange={(event) => setRecalibrationInput(event.target.value)}
                aria-describedby="simulation-recalibration-help"
                className="w-28 rounded-full border border-[#d6dde7] bg-[#f8fafc] px-3 py-2 text-sm focus:border-crowe-amber focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRecalibration}
                disabled={!result}
                className="rounded-full border border-[#d6dde7] bg-white px-4 py-2 text-sm font-semibold text-crowe-indigo-dark transition-colors hover:border-crowe-indigo-core disabled:opacity-50"
              >
                Set
              </button>
              {recalibrationAt !== null ? (
                <button
                  type="button"
                  onClick={() => {
                    setRecalibrationAt(null);
                    setRecalibrationInput('');
                  }}
                  className="text-sm font-semibold text-crowe-amber transition-colors hover:text-crowe-amber-bright"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-crowe-tint-700">{config.description}</p>
          </div>
        </div>
      </div>

      {!result && !isRunning ? <EmptySimulationState /> : null}

      {result ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="executive-panel rounded-[1.8rem] border border-white/80 p-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7b8ea5]">
              Catch-rate evolution
            </p>
            <p className="mt-2 text-sm text-crowe-tint-700">
              {SIMULATION_PRESETS[result.preset].label} preset across {result.snapshots.length} snapshots.
              Click any point on the chart to inspect the associated entity-level details.
            </p>
            <div className="mt-5">
              <SimulationChart
                snapshots={result.snapshots}
                selectedSnapshot={selectedSnapshot}
                onSnapshotSelect={setSelectedSnapshot}
                recalibrationAt={recalibrationAt}
              />
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="executive-panel min-h-0 rounded-[1.8rem] border border-white/80 p-4">
              {currentSnapshot ? (
                <WaterfallTable
                  rows={currentSnapshot.entityRows}
                  snapshotIndex={currentSnapshot.snapshotIndex}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Click a snapshot on the chart to see entity-level detail.
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col gap-4">
              <div className="executive-panel rounded-[1.8rem] border border-white/80 p-4">
                <CostOfMissCalculator />
              </div>
              <div className="executive-panel min-h-0 rounded-[1.8rem] border border-white/80 p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7b8ea5]">
                  Detection lag summary
                </p>
                <div className="mt-4 space-y-2 overflow-y-auto">
                  {result.entities.map((entity) => (
                    <div key={entity.id} className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate text-foreground">{entity.baseName}</span>
                      <span className={`font-mono ${entity.detectionLag === null ? 'font-semibold text-destructive' : 'text-muted-foreground'}`}>
                        {entity.detectionLag === null ? 'Not detected' : `+${entity.detectionLag}s`}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 border-t border-[#dde5ef] pt-3 text-xs leading-5 text-muted-foreground">
                  Entities showing &quot;Not detected&quot; should be flagged for enhanced due diligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
