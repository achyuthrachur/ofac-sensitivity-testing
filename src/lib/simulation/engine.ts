/**
 * engine.ts — Phase 21 Simulation Engine.
 * Deterministic: same preset always produces the same output.
 * Synchronous: completes in < 200ms.
 */

import type {
  SimulationPresetId,
  SimulationResult,
  SimulationSnapshot,
  SimulationEntity,
  SimulationEntityRow,
} from '@/types/simulation';
import { EVASION_TIER_LABELS } from '@/types/simulation';
import { SIMULATION_PRESETS } from './presets';

// ─── Thresholds used for catch rate lines ─────────────────────────────────────

const THRESHOLD_75 = 0.75;
const THRESHOLD_85 = 0.85;
const THRESHOLD_95 = 0.95;

// ─── Deterministic entity generator ──────────────────────────────────────────

/**
 * Synthetic entity base scores drawn from a fixed distribution.
 * Scores span 0.68–1.00 to ensure meaningful spread across threshold bands.
 * The pattern repeats cyclically for entity counts > BASE_POOL.length.
 */
const BASE_SCORE_POOL = [
  0.99, 0.97, 0.95, 0.93, 0.91, 0.89, 0.87, 0.85,
  0.83, 0.81, 0.79, 0.77, 0.75, 0.73, 0.71, 0.69,
  0.96, 0.94, 0.90, 0.88, 0.86, 0.84, 0.82, 0.80,
  0.78, 0.76, 0.74, 0.72, 0.70, 0.68, 0.98, 0.92,
  0.85, 0.83, 0.81, 0.79, 0.77, 0.75, 0.73, 0.71,
];

const ENTITY_NAMES = [
  'TORRES MEDINA', 'AL-RASHIDI CORP', 'CHEN LOGISTICS', 'PETROV TRADING',
  'HASSAN IMPORT', 'NOVAK VENTURES', 'IBRAHIM HOLDINGS', 'KWON PACIFIC',
  'SANTOS FINANCE', 'MUELLER ASSETS', 'ZHANG CAPITAL', 'VOLKOV PARTNERS',
  'OMAR EXCHANGE', 'KOWALSKI TRADE', 'DIALLO GROUP', 'OKONKWO LTD',
  'MORALES TRANSIT', 'BACH MARITIME', 'KARIMOV TRUST', 'YILMAZ CARGO',
  'RAMOS EXPORTS', 'SMIRNOV COAL', 'NDIAYE BANK', 'TAKAHASHI FUND',
  'GARCIA STEEL', 'LEBEDEV OIL', 'DUARTE RAIL', 'POPESCU METALS',
  'ABEBE MINING', 'KATO SHIPPING', 'REYES ENERGY', 'ORLOV PIPELINE',
  'MENSAH AGRI', 'WATANABE TECH', 'LIMA PORTS', 'KUZNETSOV CHEM',
  'ACHEAMPONG CO', 'NAKAMURA GRAIN', 'PATEL TRUST', 'SOKOLOV ARMS',
];

function generateEntities(count: number): SimulationEntity[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `entity-${i}`,
    baseName: ENTITY_NAMES[i % ENTITY_NAMES.length],
    baseScore: BASE_SCORE_POOL[i % BASE_SCORE_POOL.length],
    addedAtSnapshot: 0, // all entities present from snapshot 0
  }));
}

// ─── Active evasion tier at a given snapshot ─────────────────────────────────

function getActiveTier(
  snapshotIndex: number,
  snapshotCount: number,
  activationPct: [number, number, number]
): 0 | 1 | 2 | 3 {
  const pct = snapshotIndex / snapshotCount;
  if (pct >= activationPct[2]) return 3;
  if (pct >= activationPct[1]) return 2;
  if (pct >= activationPct[0]) return 1;
  return 0;
}

// ─── Effective score at a given evasion tier ──────────────────────────────────

function effectiveScore(
  baseScore: number,
  tier: 0 | 1 | 2 | 3,
  penalty: [number, number, number, number]
): number {
  return Math.min(1.0, Math.max(0.0, baseScore * penalty[tier]));
}

// ─── Main engine ──────────────────────────────────────────────────────────────

export function runSimulation(presetId: SimulationPresetId): SimulationResult {
  const config = SIMULATION_PRESETS[presetId];
  const entities = generateEntities(config.entityCount);

  // Track cumulative misses at 0.85 threshold across snapshots
  let cumulativeMissed = 0;

  const snapshots: SimulationSnapshot[] = Array.from(
    { length: config.snapshotCount },
    (_, snapshotIndex) => {
      const tier = getActiveTier(
        snapshotIndex,
        config.snapshotCount,
        config.evasionActivationPct
      );

      let caught75 = 0;
      let caught85 = 0;
      let caught95 = 0;
      let missedThisSnapshot = 0;

      const entityRows: SimulationEntityRow[] = entities.map((entity) => {
        const score = effectiveScore(entity.baseScore, tier, config.evasionPenalty);
        const caught = score >= THRESHOLD_85;

        if (score >= THRESHOLD_75) caught75++;
        if (score >= THRESHOLD_85) caught85++;
        if (score >= THRESHOLD_95) caught95++;
        if (!caught) missedThisSnapshot++;

        return {
          entityId: entity.id,
          baseName: entity.baseName,
          transformation: EVASION_TIER_LABELS[tier],
          score,
          result: caught ? 'CAUGHT' : 'MISSED',
          evasionTier: tier,
        };
      });

      // Cumulative missed = max across snapshots (can only grow or hold)
      cumulativeMissed = Math.max(cumulativeMissed, missedThisSnapshot);

      const total = entities.length;

      return {
        snapshotIndex,
        catchRate75: total > 0 ? caught75 / total : 0,
        catchRate85: total > 0 ? caught85 / total : 0,
        catchRate95: total > 0 ? caught95 / total : 0,
        cumulativeMissed,
        evasionTierActive: tier,
        entityRows,
      };
    }
  );

  // Detection lag: for each entity, find first snapshot where score ≥ 0.85
  const entitiesWithLag = entities.map((entity) => {
    let detectionLag: number | null = null;
    for (const snapshot of snapshots) {
      const tier = snapshot.evasionTierActive;
      const score = effectiveScore(entity.baseScore, tier, config.evasionPenalty);
      if (score >= THRESHOLD_85) {
        detectionLag = snapshot.snapshotIndex - entity.addedAtSnapshot;
        break;
      }
    }
    return { ...entity, detectionLag };
  });

  return { preset: presetId, snapshots, entities: entitiesWithLag };
}
