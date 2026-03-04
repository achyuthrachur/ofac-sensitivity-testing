// src/lib/resultsUtils.ts
// Pure helper functions for CSV generation, filename building, and catch-rate computation.
// All functions are side-effect free except triggerCsvDownload (browser-only).

import type { ResultRow } from '@/types';

// ---------------------------------------------------------------------------
// escapeCsvField
// ---------------------------------------------------------------------------
/**
 * Escapes a single CSV field value per RFC 4180.
 * - Numbers are converted to their string representation.
 * - Fields containing commas, double-quotes, newlines, or carriage returns are
 *   wrapped in double-quotes with any embedded double-quotes doubled.
 * - Plain strings with no special characters are returned unchanged.
 */
export function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[,"\n\r]/.test(str)) {
    // Double any embedded double-quotes, then wrap entire field
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// ---------------------------------------------------------------------------
// buildCsvString
// ---------------------------------------------------------------------------
/** Fixed column header order per plan spec. */
const CSV_HEADERS = [
  'Original Name',
  'Entity Type',
  'Linguistic Region',
  'Degraded Variant',
  'Rule Applied',
  'Similarity Score',
] as const;

/**
 * Builds a complete CSV string from an array of ResultRows.
 * - Always emits the header row.
 * - Similarity score is serialized as an integer (Math.round(score * 100)).
 * - Fields are escaped per RFC 4180.
 * - Rows are joined with '\n' (no trailing newline).
 * - The caller is responsible for ordering/filtering rows; this function does not sort.
 */
export function buildCsvString(rows: ResultRow[]): string {
  const header = CSV_HEADERS.join(',');

  if (rows.length === 0) {
    return header;
  }

  const dataRows = rows.map((row) => {
    const scoreInt = Math.round(row.similarityScore * 100);
    const fields = [
      escapeCsvField(row.originalName),
      escapeCsvField(row.entityType),
      escapeCsvField(row.region),
      escapeCsvField(row.degradedVariant),
      escapeCsvField(row.ruleLabel),
      escapeCsvField(scoreInt),
    ];
    return fields.join(',');
  });

  return [header, ...dataRows].join('\n');
}

// ---------------------------------------------------------------------------
// sanitizeClientName
// ---------------------------------------------------------------------------
/**
 * Sanitizes a client name for use in a filename.
 * Steps (in order):
 *   1. Trim leading/trailing whitespace
 *   2. Replace remaining spaces with hyphens
 *   3. Strip all non-alphanumeric, non-hyphen characters
 *   4. Collapse consecutive hyphens into one
 *   5. Trim leading/trailing hyphens
 *   6. Fall back to 'client' if result is empty
 */
export function sanitizeClientName(clientName: string): string {
  const sanitized = clientName
    .trim()
    .replace(/\s+/g, '-')            // spaces → hyphens (collapses consecutive)
    .replace(/[^a-zA-Z0-9-]/g, '')  // strip non-alphanumeric, non-hyphen
    .replace(/-+/g, '-')            // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');       // trim leading/trailing hyphens

  return sanitized.length > 0 ? sanitized : 'client';
}

// ---------------------------------------------------------------------------
// buildCsvFilename
// ---------------------------------------------------------------------------
/**
 * Builds the download filename for the CSV export.
 * Pattern: `ofac-sensitivity-{sanitizedClientName}-YYYY-MM-DD.csv`
 * The date is derived from the current date at call time using ISO format.
 */
export function buildCsvFilename(clientName: string): string {
  const sanitized = sanitizeClientName(clientName);
  const date = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  return `ofac-sensitivity-${sanitized}-${date}.csv`;
}

// ---------------------------------------------------------------------------
// computeCatchRate
// ---------------------------------------------------------------------------
/**
 * Computes aggregate catch-rate statistics from an array of ResultRows.
 * Uses `row.caught` boolean directly — does NOT re-derive from similarityScore.
 * Percent is rounded to the nearest integer via Math.round.
 */
export function computeCatchRate(rows: ResultRow[]): {
  caught: number;
  total: number;
  percent: number;
} {
  if (rows.length === 0) {
    return { caught: 0, total: 0, percent: 0 };
  }

  const total = rows.length;
  const caught = rows.filter((row) => row.caught).length;
  const percent = Math.round((caught / total) * 100);

  return { caught, total, percent };
}

// ---------------------------------------------------------------------------
// triggerCsvDownload
// ---------------------------------------------------------------------------
/**
 * Triggers a browser file download for the given CSV content.
 * BROWSER-ONLY — do not call from server components or tests.
 *
 * - Prepends UTF-8 BOM ('\uFEFF') so Excel opens the file with correct encoding.
 * - Creates a temporary anchor element, clicks it, then removes it and revokes the URL.
 */
export function triggerCsvDownload(csvContent: string, filename: string): void {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
