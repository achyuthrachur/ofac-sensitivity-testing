// src/types/index.ts
// Single source of truth for all shared type contracts.
// Every module in this project imports from '@/types' — never redefine these elsewhere.

// const object pattern — union derived, not hardcoded
export const REGION_VALUES = {
  arabic: 'arabic',
  cjk: 'cjk',
  cyrillic: 'cyrillic',
  latin: 'latin',
} as const;

export type Region = (typeof REGION_VALUES)[keyof typeof REGION_VALUES];
// Result: 'arabic' | 'cjk' | 'cyrillic' | 'latin'

export const ENTITY_TYPE_VALUES = {
  individual: 'individual',
  business: 'business',
  vessel: 'vessel',
  aircraft: 'aircraft',
} as const;

export type EntityType = (typeof ENTITY_TYPE_VALUES)[keyof typeof ENTITY_TYPE_VALUES];
// Result: 'individual' | 'business' | 'vessel' | 'aircraft'

export interface SdnEntry {
  id: string;
  name: string;
  entityType: EntityType;
  region: Region;
  country?: string; // optional — display only
}

export interface ResultRow {
  id: string; // stable React key
  originalName: string;
  entityType: SdnEntry['entityType']; // reference, not redefinition
  region: SdnEntry['region']; // reference, not redefinition
  degradedVariant: string;
  ruleId: string; // machine identifier
  ruleLabel: string; // human-readable (e.g. "Space Removal")
  similarityScore: number; // Jaro-Winkler 0–1; populated Phase 4
  caught: boolean; // score > DEFAULT_CATCH_THRESHOLD; populated Phase 4
}

export interface RunParams {
  entityCounts: {
    individual: number; // 0–500
    business: number;
    vessel: number;
    aircraft: number;
  };
  regions: Region[]; // which linguistic regions to sample from
  ruleIds: string[]; // which degradation rules to apply
  clientName: string; // used in CSV filename
}

/** Discriminated union returned by the runTest server action. */
export type ActionResult =
  | { ok: true; rows: ResultRow[] }
  | { ok: false; error: string };
