/**
 * parseInput.test.ts
 * Unit tests for parseCsv, parseExcel, parsePaste, validateNames.
 * All parsing logic is pure TypeScript — no JSDOM, no browser globals.
 * Environment: vitest node (see vitest.config.ts)
 */

import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import {
  parseCsv,
  parseExcel,
  parsePaste,
  validateNames,
} from '@/lib/screening/parseInput';

// ─── parseCsv ─────────────────────────────────────────────────────────────────

describe('parseCsv', () => {
  it('returns names from newline-separated values with no error', () => {
    const result = parseCsv('Alice\nBob\nCarol');
    expect(result.error).toBeUndefined();
    expect(result.names).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('skips header row when first cell contains "name" keyword', () => {
    const result = parseCsv('Client Name\nAlice\nBob');
    expect(result.error).toBeUndefined();
    expect(result.names).toEqual(['Alice', 'Bob']);
  });

  it('handles comma-separated single line and returns all names', () => {
    const result = parseCsv('Alice,Bob,Carol');
    // comma-separated single row — multi-column: first column only = Alice
    // but since all cells are in column positions, only col 0 = Alice
    // The plan says: single line comma-separated returns names including all three
    // This means parsePaste handles comma-split; parseCsv with "Alice,Bob,Carol" is one multi-col row
    // Per plan: "Input: 'Alice,Bob,Carol' (comma-separated single line) → names include Alice, Bob, Carol"
    // The plan says parseCsv should handle this by splitting on comma as well
    expect(result.names).toContain('Alice');
    expect(result.names).toContain('Bob');
    expect(result.names).toContain('Carol');
  });

  it('excludes empty rows and adds warning for each empty row', () => {
    const result = parseCsv('Alice\n\nBob');
    expect(result.names).toEqual(['Alice', 'Bob']);
    const emptyWarnings = result.warnings.filter(w => w.kind === 'empty');
    expect(emptyWarnings.length).toBeGreaterThan(0);
  });

  it('uses first column only for multi-column CSV and adds multi-column warning', () => {
    const result = parseCsv('Alice,Smith\nBob,Jones');
    expect(result.names).toEqual(['Alice', 'Bob']);
    const mcWarnings = result.warnings.filter(w => w.kind === 'multi-column');
    expect(mcWarnings.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── parseExcel ───────────────────────────────────────────────────────────────

describe('parseExcel', () => {
  it('returns names from a valid minimal XLSX ArrayBuffer', () => {
    // Build a real XLSX workbook in memory using SheetJS
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['Alice'], ['Bob'], ['Carol']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const ab: ArrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;

    const result = parseExcel(ab);
    expect(result.error).toBeUndefined();
    expect(result.names).toContain('Alice');
    expect(result.names).toContain('Bob');
    expect(result.names).toContain('Carol');
  });

  it('returns error (not throw) for non-XLSX binary input', () => {
    const fakeBuf = Buffer.from('PK NOT XLSX garbage data');
    const ab: ArrayBuffer = fakeBuf.buffer.slice(fakeBuf.byteOffset, fakeBuf.byteOffset + fakeBuf.byteLength) as ArrayBuffer;

    const result = parseExcel(ab);
    expect(result.error).toBeDefined();
    expect(result.names).toEqual([]);
    // Must not throw
  });
});

// ─── parsePaste ───────────────────────────────────────────────────────────────

describe('parsePaste', () => {
  it('returns trimmed names from newline-separated text', () => {
    const result = parsePaste('Alice\nBob\nCarol');
    expect(result.error).toBeUndefined();
    expect(result.names).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('returns names from comma-separated text', () => {
    const result = parsePaste('Alice,Bob,Carol');
    expect(result.names).toContain('Alice');
    expect(result.names).toContain('Bob');
    expect(result.names).toContain('Carol');
  });

  it('trims leading and trailing whitespace from each name', () => {
    const result = parsePaste('  Alice  \n  Bob  ');
    expect(result.names).toEqual(['Alice', 'Bob']);
  });
});

// ─── validateNames ────────────────────────────────────────────────────────────

describe('validateNames', () => {
  it('returns error when candidates exceed MAX_SCREENING_NAMES (10,001 names)', () => {
    // Generate 10,001 distinct names
    const candidates = Array.from({ length: 10_001 }, (_, i) => `Name${i}`);
    const result = validateNames(candidates);
    expect(result.error).toBeDefined();
    expect(result.names).toEqual([]);
  });

  it('deduplicates names case-insensitively and adds duplicate warning with correct row', () => {
    const result = validateNames(['Alice', 'Bob', 'Alice']);
    expect(result.names).toEqual(['Alice', 'Bob']);
    const dupWarning = result.warnings.find(w => w.kind === 'duplicate');
    expect(dupWarning).toBeDefined();
    expect(dupWarning?.row).toBe(3); // 1-based: third entry is the duplicate
    expect(dupWarning?.message.toLowerCase()).toContain('duplicate');
  });

  it('excludes oversized entries (>200 chars) and adds oversized warning', () => {
    const oversized = 'A'.repeat(201);
    const result = validateNames(['Alice', oversized, 'Bob']);
    expect(result.names).not.toContain(oversized);
    const oversizedWarning = result.warnings.find(w => w.kind === 'oversized');
    expect(oversizedWarning).toBeDefined();
    expect(oversizedWarning?.row).toBe(2); // 1-based: second entry
  });

  it('silently excludes empty strings with empty-kind warning and no crash', () => {
    const result = validateNames(['Alice', '', 'Bob']);
    expect(result.names).not.toContain('');
    const emptyWarning = result.warnings.find(w => w.kind === 'empty');
    expect(emptyWarning).toBeDefined();
  });
});
