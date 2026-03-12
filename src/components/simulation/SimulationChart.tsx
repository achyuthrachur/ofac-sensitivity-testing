'use client';

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { SimulationSnapshot } from '@/types/simulation';
import { formatReviewCycle, SIMULATION_CADENCE_LABEL } from '@/lib/simulation/display';

interface SimulationChartProps {
  snapshots: SimulationSnapshot[];
  /** Index of snapshot to highlight (from waterfall table selection) */
  selectedSnapshot: number;
  onSnapshotSelect: (index: number) => void;
  /** Optional recalibration snapshot index */
  recalibrationAt: number | null;
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const COLOR_75  = '#05AB8C'; // Crowe Teal
const COLOR_85  = '#0075C9'; // Crowe Blue
const COLOR_95  = '#E5376B'; // Crowe Coral
const COLOR_BAR = '#F5A800'; // Crowe Amber (cumulative miss bars)
const COLOR_RECAL = '#002E62'; // Crowe Indigo Core

// Evasion tier marker colors
const TIER_MARKER_COLORS: Record<1 | 2 | 3, string> = {
  1: '#FFD231',
  2: '#E5376B',
  3: '#B14FC5',
};

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover shadow-md p-2 text-xs space-y-1 min-w-[160px]">
      <p className="font-semibold text-foreground mb-1">{formatReviewCycle((label ?? 1) - 1)}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-3">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-mono font-semibold text-foreground">
            {entry.name === 'Missed' ? entry.value : `${(entry.value * 100).toFixed(1)}%`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── SimulationChart ──────────────────────────────────────────────────────────

export function SimulationChart({
  snapshots,
  selectedSnapshot,
  onSnapshotSelect,
  recalibrationAt,
}: SimulationChartProps) {
  if (snapshots.length === 0) return null;

  // Find evasion tier activation snapshots (where tier changes)
  const tierMarkers: Array<{ index: number; tier: 1 | 2 | 3 }> = [];
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1].evasionTierActive;
    const curr = snapshots[i].evasionTierActive as 0 | 1 | 2 | 3;
    if (curr > prev && curr >= 1) {
      tierMarkers.push({ index: i, tier: curr as 1 | 2 | 3 });
    }
  }

  const data = snapshots.map((s) => ({
    snapshotIndex: s.snapshotIndex,
    reviewCycle: s.snapshotIndex + 1,
    'CR 0.75': s.catchRate75,
    'CR 0.85': s.catchRate85,
    'CR 0.95': s.catchRate95,
    Missed: s.cumulativeMissed,
  }));

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 48, left: 8, bottom: 8 }}
          onClick={(e: unknown) => {
            const evt = e as {
              activeLabel?: number;
              activePayload?: Array<{ payload?: { snapshotIndex?: number } }>;
            } | null;
            const snapshotIndex = evt?.activePayload?.[0]?.payload?.snapshotIndex;
            if (snapshotIndex !== undefined) {
              onSnapshotSelect(snapshotIndex);
              return;
            }
            if (evt?.activeLabel !== undefined) {
              onSnapshotSelect(evt.activeLabel - 1);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

          <XAxis
            dataKey="reviewCycle"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            label={{ value: SIMULATION_CADENCE_LABEL, position: 'insideBottom', offset: -2, fontSize: 10 }}
          />

          {/* Left Y-axis — catch rate (0–1) */}
          <YAxis
            yAxisId="left"
            domain={[0, 1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            width={40}
          />

          {/* Right Y-axis — cumulative missed count */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            width={36}
            label={{ value: 'Missed', angle: 90, position: 'insideRight', offset: 12, fontSize: 10 }}
          />

          <Tooltip content={<ChartTooltip />} />

          <Legend
            iconType="line"
            wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
          />

          {/* Evasion tier markers */}
          {tierMarkers.map(({ index, tier }) => (
            <ReferenceLine
              key={`tier-${tier}`}
              yAxisId="left"
              x={index + 1}
              stroke={TIER_MARKER_COLORS[tier]}
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: `Tier ${tier}`,
                position: 'top',
                fontSize: 9,
                fill: TIER_MARKER_COLORS[tier],
              }}
            />
          ))}

          {/* Selected snapshot marker */}
          <ReferenceLine
            yAxisId="left"
            x={selectedSnapshot + 1}
            stroke="var(--foreground)"
            strokeDasharray="2 2"
            strokeWidth={1}
          />

          {/* Recalibration event marker */}
          {recalibrationAt !== null && (
            <ReferenceLine
              yAxisId="left"
              x={recalibrationAt + 1}
              stroke={COLOR_RECAL}
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{
                value: 'Recalibration',
                position: 'top',
                fontSize: 9,
                fill: COLOR_RECAL,
              }}
            />
          )}

          {/* Cumulative miss bars (right axis) */}
          <Bar
            yAxisId="right"
            dataKey="Missed"
            fill={COLOR_BAR}
            fillOpacity={0.55}
            barSize={6}
          />

          {/* Catch rate lines (left axis) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="CR 0.75"
            stroke={COLOR_75}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="CR 0.85"
            stroke={COLOR_85}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="CR 0.95"
            stroke={COLOR_95}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
