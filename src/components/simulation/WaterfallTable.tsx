'use client';

import type { SimulationEntityRow } from '@/types/simulation';

interface WaterfallTableProps {
  rows: SimulationEntityRow[];
  snapshotIndex: number;
}

export function WaterfallTable({ rows, snapshotIndex }: WaterfallTableProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b flex-shrink-0">
        <p className="text-xs font-semibold text-foreground">
          Snapshot {snapshotIndex} — Entity Breakdown
        </p>
        <p className="text-xs text-muted-foreground">
          {rows.filter((r) => r.result === 'CAUGHT').length} caught /{' '}
          {rows.filter((r) => r.result === 'MISSED').length} missed
        </p>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-muted z-10">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-muted-foreground w-[140px]">Entity</th>
              <th className="text-left px-3 py-2 font-semibold text-muted-foreground w-[160px]">Transformation</th>
              <th className="text-right px-3 py-2 font-semibold text-muted-foreground w-[56px]">Score</th>
              <th className="text-center px-3 py-2 font-semibold text-muted-foreground w-[64px]">Result</th>
              <th className="text-center px-3 py-2 font-semibold text-muted-foreground w-[56px]">Tier</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isMissed = row.result === 'MISSED';
              return (
                <tr
                  key={row.entityId}
                  className={
                    isMissed
                      ? 'bg-red-50 dark:bg-red-950/30'
                      : 'bg-green-50/50 dark:bg-green-950/20'
                  }
                >
                  <td className="px-3 py-1.5 font-medium text-foreground truncate max-w-[140px]">
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
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isMissed
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
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
