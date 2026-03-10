'use client';

import { SearchNormal1, Warning2 } from 'iconsax-reactjs';
import { Card, CardContent } from '@/components/ui/card';
import type { MatchResult, RiskTier } from '@/types/screening';
import { RECOMMENDED_ACTIONS, TIER_COLORS } from '@/types/screening';

// ─── TierBadge (internal — not exported) ─────────────────────────────────────

interface TierBadgeProps {
  tier: RiskTier;
}

function TierBadge({ tier }: TierBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: TIER_COLORS[tier] }}
    >
      {tier}
    </span>
  );
}

// ─── LabelValue (internal helper) ─────────────────────────────────────────────

interface LabelValueProps {
  label: string;
  value: string;
}

function LabelValue({ label, value }: LabelValueProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// ─── MatchDetailCard ──────────────────────────────────────────────────────────

interface MatchDetailCardProps {
  result: MatchResult | null;
}

export function MatchDetailCard({ result }: MatchDetailCardProps) {
  return (
    <Card className="h-full overflow-y-auto rounded-xl border bg-card text-card-foreground shadow-sm">
      <CardContent className="p-4 h-full">
        {result === null ? (
          /* ── Placeholder ── */
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <SearchNormal1 size={32} color="currentColor" variant="TwoTone" />
            <p className="text-sm text-center">
              Select a name from the list to view match details
            </p>
          </div>
        ) : (
          /* ── Detail View ── */
          <div className="flex flex-col gap-4">

            {/* 1. Recommended action callout */}
            <div
              className="rounded-lg p-4 border-l-4"
              style={{
                backgroundColor: `${TIER_COLORS[result.effectiveTier]}26`, // ~15% opacity (hex 26 = 38/255 ≈ 15%)
                borderLeftColor: TIER_COLORS[result.effectiveTier],
              }}
            >
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                Recommended Action
              </p>
              <p className="text-sm font-semibold">
                {RECOMMENDED_ACTIONS[result.effectiveTier]}
              </p>
            </div>

            {/* 2. Tier display */}
            <div className="flex flex-col gap-1">
              {result.nameLengthPenaltyApplied && result.effectiveTier !== result.riskTier ? (
                <div className="flex items-start gap-2">
                  <Warning2
                    size={16}
                    color="#F5A800"
                    variant="Bold"
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span className="text-xs text-muted-foreground">
                    Raw:{' '}
                    <span className="font-semibold text-foreground">{result.riskTier}</span>
                    {' / '}Effective:{' '}
                    <span className="font-semibold text-foreground">{result.effectiveTier}</span>
                    {' '}(name-length penalty applied)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Effective Tier</span>
                  <TierBadge tier={result.effectiveTier} />
                </div>
              )}
            </div>

            {/* 3. Data fields — six required fields (SCREEN-12) */}
            <div className="flex flex-col gap-3">
              <LabelValue label="Input Name" value={result.inputName} />
              <LabelValue label="Matched SDN Name" value={result.matchedSdnName} />
              <LabelValue
                label="Match Score"
                value={`${(result.compositeScore * 100).toFixed(1)}%`}
              />
              <LabelValue label="Algorithm" value={result.matchAlgorithm} />
              <LabelValue label="SDN Entity Type" value={result.entityType} />
              <LabelValue label="Region" value={result.region} />
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
