'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { MatchResult, RiskTier } from '@/types/screening';
import { TIER_COLORS } from '@/types/screening';

// ─── TierBadge (internal — not exported) ─────────────────────────────────────

interface TierBadgeProps {
  tier: RiskTier;
}

function TierBadge({ tier }: TierBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white flex-shrink-0"
      style={{ backgroundColor: TIER_COLORS[tier] }}
    >
      {tier}
    </span>
  );
}

// ─── ScreeningNameList ────────────────────────────────────────────────────────

interface ScreeningNameListProps {
  results: MatchResult[];
  selectedIndex: number | null;
  onRowSelect: (index: number) => void;
}

export function ScreeningNameList({
  results,
  selectedIndex,
  onRowSelect,
}: ScreeningNameListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // TanStack Virtual intentionally opts out of React Compiler memoization safety here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      style={{ position: 'relative', height: '100%', overflowY: 'auto' }}
    >
      {/* Spacer — totalSize sets the scrollable height */}
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const result = results[virtualRow.index];
          const isSelected = virtualRow.index === selectedIndex;

          return (
            <div
              key={virtualRow.key}
              onClick={() => onRowSelect(virtualRow.index)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={
                [
                  'flex items-center justify-between px-3 cursor-pointer border-b border-border/40',
                  isSelected
                    ? 'bg-[#011E41]/[0.08]'
                    : 'hover:bg-muted/50',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {/* Left: input name */}
              <span className="text-sm truncate min-w-0 flex-1 pr-2">
                {result.inputName}
              </span>

              {/* Right: tier badge using effectiveTier */}
              <TierBadge tier={result.effectiveTier} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
