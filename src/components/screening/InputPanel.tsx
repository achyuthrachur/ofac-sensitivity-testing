'use client';

// Aesthetic direction: Swiss editorial executive.
import { useRef, useState } from 'react';
import { ClipboardText, DocumentUpload, DocumentText } from 'iconsax-reactjs';
import { parseCsv, parseExcel, parsePaste } from '@/lib/screening/parseInput';
import type { ParseResult } from '@/lib/screening/parseInput';
import { Label } from '@/components/ui/label';

interface InputPanelProps {
  onNamesLoaded: (names: string[]) => void;
  currentCount: number;
}

function WarningList({ warnings }: { warnings: ParseResult['warnings'] }) {
  const [expanded, setExpanded] = useState(false);
  if (warnings.length === 0) return null;

  const visible = expanded ? warnings : warnings.slice(0, 5);
  const hasMore = warnings.length > 5;

  return (
    <div className="rounded-[1.2rem] border border-[#f4d796] bg-[#fff8e8] p-4 text-xs text-[#8b6720]">
      <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#aa7c17]">
        Parser warnings
      </p>
      <div className="space-y-1.5 font-mono">
        {visible.map((warning, index) => (
          <div key={index}>{warning.message}</div>
        ))}
      </div>
      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-xs font-semibold text-[#8b6720] underline transition-colors hover:text-[#6f5118]"
        >
          {expanded ? 'Show less' : `Show ${warnings.length - 5} more warnings`}
        </button>
      ) : null}
    </div>
  );
}

interface DropZoneProps {
  accept: string;
  onFile: (file: File) => void;
  disabled: boolean;
  hint: string;
}

function DropZone({ accept, onFile, disabled, hint }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file && !disabled) onFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onFile(file);
    event.target.value = '';
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      className={[
        'rounded-[1.6rem] border-2 border-dashed p-8 transition-all',
        isDragOver
          ? 'border-crowe-amber bg-[rgba(245,168,0,0.06)]'
          : 'border-[#c6d3e3] bg-[linear-gradient(180deg,#ffffff,#f7f9fc)] hover:border-crowe-indigo-core',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#011E41] text-white">
          <DocumentUpload variant="Linear" size={24} color="currentColor" />
        </div>
        <p className="text-sm font-semibold text-crowe-indigo-dark">{hint}</p>
        <p className="mt-2 text-xs text-muted-foreground">Drag and drop is supported.</p>
      </div>
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

export function InputPanel({ onNamesLoaded, currentCount }: InputPanelProps) {
  const [activeTab, setActiveTab] = useState<'csv' | 'excel' | 'paste'>('csv');
  const [pasteValue, setPasteValue] = useState('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
        parsed = parseCsv(await file.text());
      }

      setResult(parsed);
      if (!parsed.error) onNamesLoaded(parsed.names);
    } finally {
      setIsProcessing(false);
    }
  }

  function handlePasteChange(value: string) {
    setPasteValue(value);
    setResult(parsePaste(value));
  }

  function handlePasteApply() {
    const parsed = parsePaste(pasteValue);
    setResult(parsed);
    if (!parsed.error) onNamesLoaded(parsed.names);
  }

  function switchTab(tab: 'csv' | 'excel' | 'paste') {
    setActiveTab(tab);
    setResult(null);
    if (tab !== 'paste') setPasteValue('');
  }

  const livePasteCount = pasteValue.trim() ? parsePaste(pasteValue).names.length : 0;

  return (
    <div className="executive-panel overflow-hidden rounded-[2rem] border border-white/80">
      <div className="border-b border-[#dde5ef] px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7b8ea5]">
              Screening input
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-crowe-indigo-dark">Client name workspace</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-crowe-tint-700">
              Import a spreadsheet or paste names directly into the queue. Parsing stays client-side
              and flags issues before the scoring run starts.
            </p>
          </div>
          <div className="rounded-full border border-[#d6dde7] bg-white px-4 py-2 text-sm font-semibold text-crowe-indigo-dark shadow-[0_8px_24px_rgba(1,30,65,0.06)]">
            {currentCount.toLocaleString()} {currentCount === 1 ? 'name' : 'names'} loaded
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-3">
          {[
            { id: 'csv', label: 'CSV Upload', icon: DocumentText },
            { id: 'excel', label: 'Excel Upload', icon: DocumentUpload },
            { id: 'paste', label: 'Paste Names', icon: ClipboardText },
          ].map((tab, index) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id as 'csv' | 'excel' | 'paste')}
                className={[
                  'flex w-full items-center gap-3 rounded-[1.3rem] border px-4 py-4 text-left transition-all',
                  active
                    ? 'border-[#011E41] bg-[#011E41] text-white shadow-[0_14px_32px_rgba(1,30,65,0.18)]'
                    : 'border-[#d6dde7] bg-white text-crowe-indigo-dark hover:border-crowe-indigo-core',
                ].join(' ')}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-white/12' : 'bg-[#eef2f7]'}`}>
                  <Icon variant="Linear" size={18} color="currentColor" />
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] opacity-60">
                    0{index + 1}
                  </p>
                  <p className="text-sm font-semibold">{tab.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {activeTab === 'csv' ? (
            <DropZone
              accept=".csv,text/csv"
              onFile={processFile}
              disabled={isProcessing}
              hint="Browse for a .csv file"
            />
          ) : null}

          {activeTab === 'excel' ? (
            <DropZone
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onFile={processFile}
              disabled={isProcessing}
              hint="Browse for a .xlsx file"
            />
          ) : null}

          {activeTab === 'paste' ? (
            <div className="rounded-[1.6rem] border border-[#d6dde7] bg-white p-5 shadow-[0_10px_28px_rgba(1,30,65,0.04)]">
              <div className="mb-3 space-y-1">
                <Label htmlFor="screening-paste-input">Paste names</Label>
                <p id="screening-paste-help" className="text-xs text-muted-foreground">
                  Paste one name per line or a comma-separated list. The parser normalizes entries as
                  you type.
                </p>
              </div>
              <textarea
                id="screening-paste-input"
                value={pasteValue}
                onChange={(event) => handlePasteChange(event.target.value)}
                placeholder="Paste names here - one per line, or comma-separated"
                rows={10}
                aria-describedby="screening-paste-help screening-paste-count"
                className="min-h-[220px] w-full resize-y rounded-[1.25rem] border border-[#d6dde7] bg-[#f8fafc] px-4 py-3 text-sm font-mono placeholder:text-muted-foreground focus:border-crowe-amber focus:outline-none"
              />
              <div className="mt-4 flex items-center justify-between">
                <p id="screening-paste-count" className="text-xs text-muted-foreground">
                  {livePasteCount.toLocaleString()} {livePasteCount === 1 ? 'name' : 'names'} parsed
                </p>
                <button
                  type="button"
                  onClick={handlePasteApply}
                  disabled={pasteValue.trim() === ''}
                  className="rounded-full bg-crowe-amber px-4 py-2 text-sm font-semibold text-crowe-indigo-dark transition-colors hover:bg-crowe-amber-dark disabled:opacity-50"
                >
                  Apply list
                </button>
              </div>
            </div>
          ) : null}

          {isProcessing ? (
            <div className="rounded-[1.2rem] border border-[#d6dde7] bg-white px-4 py-3 text-sm text-muted-foreground">
              Processing file...
            </div>
          ) : null}

          {result ? (
            <div className="space-y-3">
              {result.error ? (
                <div className="rounded-[1.2rem] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {result.error}
                </div>
              ) : null}

              {!result.error && result.names.length > 0 ? (
                <div className="rounded-[1.2rem] border border-[#cae6df] bg-[#effaf6] px-4 py-3 text-sm text-crowe-teal">
                  <span className="font-semibold">
                    {result.names.length.toLocaleString()} {result.names.length === 1 ? 'name' : 'names'}
                  </span>{' '}
                  ready for screening.
                  {result.rawCount !== result.names.length ? (
                    <span className="text-muted-foreground">
                      {' '}({result.rawCount - result.names.length} skipped)
                    </span>
                  ) : null}
                </div>
              ) : null}

              <WarningList warnings={result.warnings} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
