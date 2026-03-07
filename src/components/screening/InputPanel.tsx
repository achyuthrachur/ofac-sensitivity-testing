'use client';
// src/components/screening/InputPanel.tsx
// Three-tab file upload + paste UI for the Screening Mode input layer.
//
// Tabs:
//   1. CSV Upload  — .csv file via drag-drop or click-to-browse
//   2. Excel Upload — .xlsx file, parsed client-side via SheetJS (no server round-trip)
//   3. Paste       — textarea, live count on every keystroke
//
// Delegates all parsing/validation to parseInput.ts.
// Calls onNamesLoaded(names) only when result.error is undefined.

import { useState, useRef } from 'react';
import { parseCsv, parseExcel, parsePaste } from '@/lib/screening/parseInput';
import type { ParseResult } from '@/lib/screening/parseInput';

// ─── Props ────────────────────────────────────────────────────────────────────

interface InputPanelProps {
  onNamesLoaded: (names: string[]) => void;
  currentCount: number; // activeNames.length from tool/page.tsx
}

// ─── Warning list sub-component ──────────────────────────────────────────────

function WarningList({ warnings }: { warnings: ParseResult['warnings'] }) {
  const [expanded, setExpanded] = useState(false);
  if (warnings.length === 0) return null;

  const visible = expanded ? warnings : warnings.slice(0, 5);
  const hasMore = warnings.length > 5;

  return (
    <div className="text-xs font-mono text-amber-700 bg-amber-50 rounded p-2 space-y-1">
      {visible.map((w, i) => (
        <div key={i}>{w.message}</div>
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="text-amber-600 underline hover:text-amber-800 transition-colors"
        >
          {expanded ? 'Show less' : `Show ${warnings.length - 5} more warnings`}
        </button>
      )}
    </div>
  );
}

// ─── Drop zone shared by CSV and Excel tabs ───────────────────────────────────

interface DropZoneProps {
  accept: string;
  onFile: (file: File) => void;
  disabled: boolean;
  hint: string;
}

function DropZone({ accept, onFile, disabled, hint }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && !disabled) onFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFile(file);
      // Reset input value so the same file can be re-uploaded
      e.target.value = '';
    }
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={[
        'rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors',
        isDragOver
          ? 'border-crowe-amber bg-crowe-amber/5'
          : 'border-border hover:border-crowe-amber',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <p className="text-sm text-muted-foreground">{hint}</p>
      <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

// ─── InputPanel ───────────────────────────────────────────────────────────────

export function InputPanel({ onNamesLoaded, currentCount }: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<'csv' | 'excel' | 'paste'>('csv');
  const [pasteValue, setPasteValue] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── File processing (shared between CSV and Excel tabs) ──────────────────

  async function processFile(file: File) {
    setIsProcessing(true);
    setResult(null);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let parsed: ParseResult;
      if (ext === 'xlsx') {
        const data = await file.arrayBuffer();
        parsed = parseExcel(data);
      } else {
        // .csv and any other text file
        const text = await file.text();
        parsed = parseCsv(text);
      }
      setResult(parsed);
      if (!parsed.error) onNamesLoaded(parsed.names);
    } finally {
      setIsProcessing(false);
    }
  }

  // ── Paste handlers ────────────────────────────────────────────────────────

  function handlePasteChange(value: string) {
    setPasteValue(value);
    // Live parse for count display — always call parsePaste on every change
    const parsed = parsePaste(value);
    setResult(parsed);
  }

  function handlePasteApply() {
    const parsed = parsePaste(pasteValue);
    setResult(parsed);
    if (!parsed.error) onNamesLoaded(parsed.names);
  }

  // ── Tab switch — clear result when switching tabs ─────────────────────────

  function switchTab(tab: 'csv' | 'excel' | 'paste') {
    setActiveTab(tab);
    setResult(null);
    if (tab !== 'paste') setPasteValue('');
  }

  // ── Live paste count (inline derivation — no extra state) ─────────────────
  const livePasteCount = pasteValue.trim()
    ? parsePaste(pasteValue).names.length
    : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-crowe-sm space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-crowe-indigo-dark">Client Name List</h3>
          <p className="text-sm text-muted-foreground">
            Upload or paste names to screen against the OFAC SDN list.
          </p>
        </div>
        {/* Count badge */}
        <span className={[
          'text-xs font-semibold px-3 py-1 rounded-full',
          currentCount > 0
            ? 'bg-green-100 text-green-700'
            : 'bg-muted text-muted-foreground',
        ].join(' ')}>
          {currentCount.toLocaleString()} {currentCount === 1 ? 'name' : 'names'} loaded
        </span>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {(['csv', 'excel', 'paste'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => switchTab(tab)}
            className={[
              'px-4 py-1.5 rounded-md text-sm font-semibold transition-colors',
              activeTab === tab
                ? 'bg-crowe-amber text-crowe-indigo-dark'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            ].join(' ')}
          >
            {tab === 'csv' ? 'CSV Upload' : tab === 'excel' ? 'Excel Upload' : 'Paste'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'csv' && (
        <div className="space-y-3">
          <DropZone
            accept=".csv,text/csv"
            onFile={processFile}
            disabled={isProcessing}
            hint="Click to browse for a .csv file"
          />
          {isProcessing && (
            <p className="text-sm text-muted-foreground text-center">Processing…</p>
          )}
        </div>
      )}

      {activeTab === 'excel' && (
        <div className="space-y-3">
          <DropZone
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onFile={processFile}
            disabled={isProcessing}
            hint="Click to browse for a .xlsx file"
          />
          {isProcessing && (
            <p className="text-sm text-muted-foreground text-center">Processing…</p>
          )}
        </div>
      )}

      {activeTab === 'paste' && (
        <div className="space-y-3">
          <textarea
            value={pasteValue}
            onChange={(e) => handlePasteChange(e.target.value)}
            placeholder="Paste names here — one per line, or comma-separated"
            rows={8}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono
                       placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-crowe-amber
                       resize-y"
          />
          {/* Live count beneath textarea */}
          <p className="text-xs text-muted-foreground">
            {livePasteCount.toLocaleString()} {livePasteCount === 1 ? 'name' : 'names'} parsed
          </p>
          <button
            type="button"
            onClick={handlePasteApply}
            disabled={pasteValue.trim() === ''}
            className="bg-crowe-amber text-crowe-indigo-dark text-sm font-semibold py-2 px-4 rounded-md
                       hover:bg-crowe-amber-dark disabled:opacity-50 transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Validation output */}
      {result && (
        <div className="space-y-2">
          {/* Blocking error */}
          {result.error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {result.error}
            </div>
          )}

          {/* Success count (only when no blocking error and names were loaded) */}
          {!result.error && result.names.length > 0 && (
            <p className="text-sm text-green-700 font-medium">
              {result.names.length.toLocaleString()} {result.names.length === 1 ? 'name' : 'names'} ready for screening.
              {result.rawCount !== result.names.length && (
                <span className="text-muted-foreground font-normal">
                  {' '}({result.rawCount - result.names.length} skipped)
                </span>
              )}
            </p>
          )}

          {/* Per-row warnings */}
          <WarningList warnings={result.warnings} />
        </div>
      )}
    </div>
  );
}
