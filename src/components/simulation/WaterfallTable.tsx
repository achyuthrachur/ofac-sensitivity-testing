'use client';

import type { SimulationEntityRow } from '@/types/simulation';
import { formatReviewCycle } from '@/lib/simulation/display';

interface WaterfallTableProps {
  rows: SimulationEntityRow[];
  snapshotIndex: number;
}

export function WaterfallTable({ rows, snapshotIndex }: WaterfallTableProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b px-3 py-2">
        <p className="text-xs font-semibold text-foreground">
          {formatReviewCycle(snapshotIndex)} - Entity Breakdown
        </p>
        <p className="text-xs text-muted-foreground">
          {rows.filter((r) => r.result === 'CAUGHT').length} caught /{' '}
          {rows.filter((r) => r.result === 'MISSED').length} missed
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              <th className="w-[140px] px-3 py-2 text-left font-semibold text-muted-foreground">Entity</th>
              <th className="w-[160px] px-3 py-2 text-left font-semibold text-muted-foreground">Transformation</th>
              <th className="w-[56px] px-3 py-2 text-right font-semibold text-muted-foreground">Score</th>
              <th className="w-[64px] px-3 py-2 text-center font-semibold text-muted-foreground">Result</th>
              <th className="w-[56px] px-3 py-2 text-center font-semibold text-muted-foreground">Tier</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isMissed = row.result === 'MISSED';
              return (
                <tr
                  key={row.entityId}
                  className={isMissed ? 'bg-crowe-coral/8' : 'bg-crowe-teal/8'}
                >
                  <td className="max-w-[140px] truncate px-3 py-1.5 font-medium text-foreground">
                    {row.baseName}
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {row.transformation}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono">
                    {(row.score * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <span
                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        isMissed
                          ? 'bg-crowe-coral/12 text-crowe-coral'
                          : 'bg-crowe-teal/12 text-crowe-teal'
                      }`}
                    >
                      {row.result}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-center text-muted-foreground">
                    {row.evasionTier}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
