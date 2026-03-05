'use client';

import { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ResultRow } from '@/types';
import { DEFAULT_CATCH_THRESHOLD } from '@/lib/constants';
import {
  computeCatchRate,
  buildCsvString,
  buildCsvFilename,
  triggerCsvDownload,
} from '@/lib/resultsUtils';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc';

interface ResultsTableProps {
  rows: ResultRow[];
  clientName: string;
}

// ─── Column widths ────────────────────────────────────────────────────────────

const COL_WIDTHS = [
  { width: '22%', minWidth: '200px' }, // Original Name
  { width: '12%', minWidth: '100px' }, // Entity Type
  { width: '16%', minWidth: '140px' }, // Linguistic Region
  { width: '22%', minWidth: '200px' }, // Degraded Variant
  { width: '18%', minWidth: '160px' }, // Rule Applied
  { width: '10%', minWidth: '80px' },  // Score (index 5)
] as const;

// ─── Column headers ───────────────────────────────────────────────────────────

const COLUMN_LABELS = [
  'Original Name',
  'Entity Type',
  'Linguistic Region',
  'Degraded Variant',
  'Rule Applied',
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function ResultsTable({ rows, clientName }: ResultsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) =>
        sortDir === 'desc'
          ? b.similarityScore - a.similarityScore
          : a.similarityScore - b.similarityScore,
      ),
    [rows, sortDir],
  );

  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 5,
  });

  // Guard: render nothing before first run
  if (rows.length === 0) return null;

  const { caught, total, percent } = computeCatchRate(rows);
  const threshold = Math.round(DEFAULT_CATCH_THRESHOLD * 100);

  const handleDownload = () => {
    triggerCsvDownload(buildCsvString(rows), buildCsvFilename(clientName));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-3 px-4">
      {/* Summary row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {caught} of {total} degraded variants ({percent}%) would be caught at the {threshold}%
          match threshold
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={rows.length === 0}
        >
          Download CSV
        </Button>
      </div>

      {/* Scroll container */}
      <div
        ref={parentRef}
        className="rounded-md border"
        style={{ height: '600px', overflowY: 'auto' }}
      >
        <table
          style={{ tableLayout: 'fixed', width: '100%', borderCollapse: 'collapse' }}
        >
          {/* Column widths — REQUIRED for absolute-positioned rows */}
          <colgroup>
            {COL_WIDTHS.map((w, i) => (
              <col key={i} style={w} />
            ))}
          </colgroup>

          {/* Sticky header */}
          <thead className="sticky top-0 z-10" style={{ background: 'var(--card)' }}>
            <tr>
              {COLUMN_LABELS.map((label) => (
                <th
                  key={label}
                  className="border-b px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {label}
                </th>
              ))}
              {/* Score column — sortable */}
              <th
                className="border-b px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none"
                onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              >
                Score {sortDir === 'desc' ? '↓' : '↑'}
              </th>
            </tr>
          </thead>

          {/* Virtualized body */}
          <tbody
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = sortedRows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`,
                  }}
                  className="border-b last:border-0"
                >
                  <td className="px-3 py-2 text-sm truncate">{row.originalName}</td>
                  <td className="px-3 py-2 text-sm capitalize">{row.entityType}</td>
                  <td className="px-3 py-2 text-sm capitalize">{row.region}</td>
                  <td className="px-3 py-2 text-sm truncate">{row.degradedVariant}</td>
                  <td className="px-3 py-2 text-sm truncate">{row.ruleLabel}</td>
                  <td
                    className={`px-3 py-2 text-sm font-mono ${
                      row.caught ? 'text-crowe-teal' : 'text-crowe-coral'
                    }`}
                  >
                    {Math.round(row.similarityScore * 100)}% {row.caught ? '✓' : '✗'}
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
