/**
 * parseInput.ts
 * Pure parsing and validation module for the OFAC screening input layer.
 * No React, no browser globals — fully testable in vitest node environment.
 *
 * Exports: parseCsv, parseExcel, parsePaste, validateNames
 * Types:   ValidationWarning, ParseResult
 */

import * as XLSX from 'xlsx';
import { MAX_SCREENING_NAMES } from '@/types/screening';

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface ValidationWarning {
  row: number;       // 1-based index from candidates array
  message: string;   // Human-readable description
  kind: 'empty' | 'duplicate' | 'oversized' | 'multi-column';
}

export interface ParseResult {
  names: string[];
  warnings: ValidationWarning[];
  rawCount: number;   // row count before dedup/filter
  error?: string;     // blocking error — if set, names is []
}

// ─── Header Detection ────────────────────────────────────────────────────────

const HEADER_KEYWORDS = ['name', 'client', 'entity', 'company', 'full name'];

function looksLikeHeader(cell: string): boolean {
  const lower = cell.toLowerCase().trim();
  return HEADER_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── XLSX Magic Byte Validation ───────────────────────────────────────────────

/**
 * XLSX files are ZIP archives and always start with the PK magic bytes (0x50, 0x4B, 0x03, 0x04).
 * SheetJS silently falls back to CSV parsing for arbitrary buffers rather than throwing,
 * so we validate the magic bytes ourselves before attempting to parse.
 */
function isValidXlsxBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const view = new Uint8Array(buffer, 0, 4);
  // ZIP local file header magic: PK\x03\x04
  return view[0] === 0x50 && view[1] === 0x4B && view[2] === 0x03 && view[3] === 0x04;
}

// ─── Shared Row Extraction Helper ────────────────────────────────────────────

/**
 * Given a 2D array of string cells (rows), extract name candidates.
 *
 * Special case: a single row with multiple non-empty cells (e.g., a single
 * comma-separated line "Alice,Bob,Carol") is treated as a flat list of names
 * rather than a multi-column table. This matches the unambiguous "list on one
 * line" use case.
 *
 * For multi-row input with multiple columns, uses first column only and adds
 * a multi-column warning.
 *
 * Returns { candidates, warnings } where candidates are trimmed strings
 * (empty strings preserved for downstream validateNames to handle).
 */
function extractNamesFromRows(rows: string[][]): { candidates: string[]; warnings: ValidationWarning[] } {
  const warnings: ValidationWarning[] = [];

  if (rows.length === 0) {
    return { candidates: [], warnings };
  }

  // Single-row with multiple non-empty cells: treat as flat name list
  const nonEmptyRows = rows.filter(row => row.some(c => c.trim() !== ''));
  if (nonEmptyRows.length === 1 && nonEmptyRows[0].filter(c => c.trim() !== '').length > 1) {
    const candidates = nonEmptyRows[0].map(c => c.trim()).filter(c => c !== '');
    return { candidates, warnings };
  }

  // Multi-row: detect multi-column — any row has more than 1 non-empty cell
  const isMultiColumn = rows.some(row => row.filter(c => c.trim() !== '').length > 1);
  if (isMultiColumn) {
    warnings.push({
      row: 1,
      kind: 'multi-column',
      message: 'Multiple columns detected — only the first column will be used for screening.',
    });
  }

  // Detect and skip header row
  let startRow = 0;
  if (rows.length > 0 && rows[0].length > 0 && looksLikeHeader(rows[0][0])) {
    startRow = 1;
  }

  const candidates: string[] = [];
  for (let i = startRow; i < rows.length; i++) {
    const cell = rows[i].length > 0 ? (rows[i][0] ?? '').trim() : '';
    candidates.push(cell);
  }

  return { candidates, warnings };
}

// ─── parseCsv ────────────────────────────────────────────────────────────────

/**
 * Parse a CSV text string.
 * Splits on newlines first, then commas per row.
 * Header row detection via keyword heuristic.
 * Multi-column: uses first column only (unless single-row all-comma case).
 * Delegates to validateNames for dedup, oversized, empty filtering.
 */
export function parseCsv(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const rows: string[][] = lines.map(line => line.split(',').map(c => c.trim()));

  const { candidates, warnings: extractWarnings } = extractNamesFromRows(rows);

  const rawCount = candidates.length;
  const validated = validateNames(candidates);

  return {
    names: validated.names,
    warnings: [...extractWarnings, ...validated.warnings],
    rawCount,
    error: validated.error,
  };
}

// ─── parseExcel ──────────────────────────────────────────────────────────────

/**
 * Parse an Excel XLSX ArrayBuffer.
 * Validates ZIP magic bytes before attempting XLSX.read — SheetJS silently
 * falls back to CSV parsing for arbitrary inputs rather than throwing.
 * On any parse failure, returns error result (no throw).
 * Uses first sheet, first column only.
 */
export function parseExcel(buffer: ArrayBuffer): ParseResult {
  // Validate magic bytes before attempting parse
  if (!isValidXlsxBuffer(buffer)) {
    return {
      names: [],
      warnings: [],
      rawCount: 0,
      error: 'File could not be parsed as an Excel workbook. Please upload a valid .xlsx file.',
    };
  }

  let wb: XLSX.WorkBook;

  try {
    wb = XLSX.read(buffer);
  } catch {
    return {
      names: [],
      warnings: [],
      rawCount: 0,
      error: 'File could not be parsed as an Excel workbook. Please upload a valid .xlsx file.',
    };
  }

  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return {
      names: [],
      warnings: [],
      rawCount: 0,
      error: 'File could not be parsed as an Excel workbook. Please upload a valid .xlsx file.',
    };
  }

  const sheet = wb.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });

  // Normalize: ensure every row is string[]
  const rows: string[][] = rawRows.map(row =>
    Array.isArray(row) ? row.map(c => String(c ?? '')) : []
  );

  const { candidates, warnings: extractWarnings } = extractNamesFromRows(rows);
  const rawCount = candidates.length;
  const validated = validateNames(candidates);

  return {
    names: validated.names,
    warnings: [...extractWarnings, ...validated.warnings],
    rawCount,
    error: validated.error,
  };
}

// ─── parsePaste ──────────────────────────────────────────────────────────────

/**
 * Parse pasted text (textarea input).
 * Splits on newlines OR commas — whichever separates the input.
 * Trims each token, passes to validateNames.
 */
export function parsePaste(raw: string): ParseResult {
  const tokens = raw.split(/[\n,]/).map(t => t.trim());
  const rawCount = tokens.length;

  const validated = validateNames(tokens);

  return {
    names: validated.names,
    warnings: validated.warnings,
    rawCount,
    error: validated.error,
  };
}

// ─── validateNames ───────────────────────────────────────────────────────────

/**
 * Validate and deduplicate a candidate name list.
 *
 * Rules (applied in order per entry):
 *  1. Empty string → warning kind:'empty', exclude
 *  2. Length > 200 chars → warning kind:'oversized', exclude
 *  3. Already seen (case-insensitive) → warning kind:'duplicate', exclude
 *
 * Blocking check AFTER dedup: if unique names count > MAX_SCREENING_NAMES,
 * return error with names: [] (prevents false triggers from lists with many empties).
 *
 * Row numbers are 1-based from the candidates array index.
 */
export function validateNames(
  candidates: string[]
): Omit<ParseResult, 'rawCount'> {
  const warnings: ValidationWarning[] = [];
  const names: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < candidates.length; i++) {
    const row = i + 1; // 1-based
    const raw = candidates[i];

    // Empty check
    if (raw === '' || raw.trim() === '') {
      warnings.push({
        row,
        kind: 'empty',
        message: `Row ${row}: Empty entry skipped.`,
      });
      continue;
    }

    const trimmed = raw.trim();

    // Oversized check
    if (trimmed.length > 200) {
      warnings.push({
        row,
        kind: 'oversized',
        message: `Row ${row}: Entry exceeds 200 characters and was excluded.`,
      });
      continue;
    }

    // Duplicate check (case-insensitive)
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      warnings.push({
        row,
        kind: 'duplicate',
        message: `Row ${row}: Duplicate entry "${trimmed}" skipped.`,
      });
      continue;
    }

    seen.add(key);
    names.push(trimmed);
  }

  // Blocking check AFTER dedup
  if (names.length > MAX_SCREENING_NAMES) {
    return {
      names: [],
      warnings: [],
      error: `Input exceeds the maximum of ${MAX_SCREENING_NAMES.toLocaleString()} names. Please reduce your list and try again.`,
    };
  }

  return { names, warnings };
}
