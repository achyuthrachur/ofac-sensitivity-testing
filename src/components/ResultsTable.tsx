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
import { TickCircle, CloseCircle, DocumentDownload } from 'iconsax-reactjs';
import { EmptyResultsState } from '@/components/states/EmptyResultsState';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc';

interface ResultsTableProps {
  rows: ResultRow[];
  clientName: string;
}

// ─── Column widths ────────────────────────────────────────────────────────────

// Explicit pixel widths are required for correct alignment when tbody rows are
// absolutely positioned (TanStack virtualizer pattern). Percentage widths cause
// the browser to resolve column geometry against a different reference than the
// absolute-positioned rows, producing misaligned header/data columns.
// Total: 260 + 110 + 130 + 300 + 160 + 90 = 1050px (fits comfortably in max-w-screen-xl)
const COL_WIDTHS = [
  { width: '260px', minWidth: '260px' }, // Original Name
  { width: '110px', minWidth: '110px' }, // Entity Type
  { width: '130px', minWidth: '130px' }, // Linguistic Region
  { width: '300px', minWidth: '300px' }, // Degraded Variant
  { width: '160px', minWidth: '160px' }, // Rule Applied
  { width: '90px',  minWidth: '90px'  }, // Score
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

  // Guard: render empty state before first run
  if (rows.length === 0) return <EmptyResultsState />;

  const { caught, total, percent } = computeCatchRate(rows);
  const threshold = Math.round(DEFAULT_CATCH_THRESHOLD * 100);

  const handleDownload = () => {
    triggerCsvDownload(buildCsvString(rows), buildCsvFilename(clientName));
  };

  return (
    <div className="space-y-3">
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
          <DocumentDownload variant="Bold" size={16} color="currentColor" className="size-auto" />
          Download CSV
        </Button>
      </div>

      {/* Scroll container */}
      <div
        ref={parentRef}
        className="rounded-md border"
        style={{ height: '600px', overflowY: 'auto', width: '1050px', overflowX: 'auto' }}
      >
        {/* Fixed 1050px table: explicit width on every th/td is the only reliable
            alignment strategy when tbody rows are position:absolute (virtualizer).
            colgroup does NOT propagate to absolutely-positioned rows. */}
        <table
          style={{ tableLayout: 'fixed', width: '1050px', borderCollapse: 'collapse' }}
        >
          {/* Sticky header — each th gets an explicit pixel width */}
          <thead className="sticky top-0 z-10" style={{ background: 'var(--card)' }}>
            <tr>
              {COLUMN_LABELS.map((label, i) => (
                <th
                  key={label}
                  style={{ width: COL_WIDTHS[i].width }}
                  className="border-b px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {label}
                </th>
              ))}
              {/* Score column — sortable */}
              <th
                style={{ width: COL_WIDTHS[5].width }}
                className="border-b px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none"
                onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              >
                Score {sortDir === 'desc' ? '↓' : '↑'}
              </th>
            </tr>
          </thead>

          {/* Virtualized body — each td gets the matching explicit pixel width */}
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
                    width: '1050px',
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`,
                    display: 'flex',
                  }}
                  className="border-b last:border-0"
                >
                  <td style={{ width: COL_WIDTHS[0].width, flexShrink: 0 }} className="px-3 py-2 text-sm truncate">{row.originalName}</td>
                  <td style={{ width: COL_WIDTHS[1].width, flexShrink: 0 }} className="px-3 py-2 text-sm capitalize">{row.entityType}</td>
                  <td style={{ width: COL_WIDTHS[2].width, flexShrink: 0 }} className="px-3 py-2 text-sm capitalize">{row.region}</td>
                  <td style={{ width: COL_WIDTHS[3].width, flexShrink: 0 }} className="px-3 py-2 text-sm truncate">{row.degradedVariant}</td>
                  <td style={{ width: COL_WIDTHS[4].width, flexShrink: 0 }} className="px-3 py-2 text-sm truncate">{row.ruleLabel}</td>
                  <td
                    style={{ width: COL_WIDTHS[5].width, flexShrink: 0 }}
                    className={`px-3 py-2 text-sm font-mono flex items-center gap-1 ${
                      row.caught ? 'text-crowe-teal' : 'text-crowe-coral'
                    }`}
                  >
                    {Math.round(row.similarityScore * 100)}%
                    {row.caught
                      ? <TickCircle variant="Bold" size={14} color="#05AB8C" />
                      : <CloseCircle variant="Bold" size={14} color="#E5376B" />
                    }
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
