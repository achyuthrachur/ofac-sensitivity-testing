import type { SimulationPresetConfig } from '@/types/simulation';

export const SIMULATION_PRESETS: Record<string, SimulationPresetConfig> = {
  BASELINE: {
    id: 'BASELINE',
    label: 'Baseline',
    description: 'Standard evasion ramp. Tier 1 activates at 30%, Tier 2 at 60%, Tier 3 at 85%. Moderate catch-rate decline.',
    snapshotCount: 30,
    entityCount: 20,
    evasionActivationPct: [0.30, 0.60, 0.85],
    evasionPenalty: [1.00, 0.96, 0.87, 0.75],
  },
  ELEVATED: {
    id: 'ELEVATED',
    label: 'Elevated',
    description: 'Faster evasion ramp with more entities. Tiers activate earlier, deeper score degradation at Tier 3.',
    snapshotCount: 50,
    entityCount: 30,
    evasionActivationPct: [0.20, 0.45, 0.70],
    evasionPenalty: [1.00, 0.94, 0.84, 0.70],
  },
  SURGE: {
    id: 'SURGE',
    label: 'Surge',
    description: 'Maximum evasion intensity. Most snapshots, steepest catch-rate decline, entities reach Tier 3 early.',
    snapshotCount: 70,
    entityCount: 40,
    evasionActivationPct: [0.15, 0.35, 0.55],
    evasionPenalty: [1.00, 0.92, 0.80, 0.65],
  },
};
