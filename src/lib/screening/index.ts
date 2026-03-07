// src/lib/screening/index.ts
// Server-side screening path — delegates to the pure scorer module.
// Phase 16: replaces Phase 15 stub.

export type { MatchResult, MatchResultStub, RiskTier, ScreeningWorkerApi } from '@/types/screening';
export { RISK_TIER_VALUES, TIER_THRESHOLDS } from '@/types/screening';
export { screenNames } from './scorer';
