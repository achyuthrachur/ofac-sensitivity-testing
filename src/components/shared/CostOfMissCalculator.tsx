'use client';

import { useState } from 'react';
import { COST_OF_MISS_MULTIPLIER } from '@/types/screening';
import { Label } from '@/components/ui/label';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function parseTransactionValue(raw: string): number {
  // Strip $, commas, spaces
  const cleaned = raw.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export function CostOfMissCalculator() {
  const [rawInput, setRawInput] = useState('');

  const transactionValue = parseTransactionValue(rawInput);
  const penaltyExposure = transactionValue * COST_OF_MISS_MULTIPLIER;

  return (
    <div className="border rounded-lg bg-card p-4 flex flex-col gap-3">

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
          Cost of Miss Calculator
        </p>
        <p className="text-xs text-muted-foreground">
          OFAC civil penalty exposure = transaction value × {COST_OF_MISS_MULTIPLIER.toFixed(1)}×
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Label htmlFor="cost-of-miss-value" className="mb-1 block text-xs text-muted-foreground">
            Transaction value
          </Label>
          <p id="cost-of-miss-help" className="mb-2 text-xs text-muted-foreground">
            Enter an estimated transaction amount to see the modeled penalty exposure.
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">$</span>
            <input
              id="cost-of-miss-value"
              type="text"
              inputMode="numeric"
              placeholder="Transaction value"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              aria-describedby="cost-of-miss-help"
              className="w-full pl-7 pr-3 py-2 text-sm rounded-md border bg-background
                         focus:outline-none focus:ring-2 focus:ring-crowe-indigo-core/40
                         placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <span className="text-muted-foreground text-sm">→</span>

        <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2">
          {transactionValue > 0 ? (
            <div>
              <p className="text-xs text-muted-foreground">Max penalty exposure</p>
              <p className="text-sm font-semibold text-destructive">{formatCurrency(penaltyExposure)}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter a value</p>
          )}
        </div>
      </div>

    </div>
  );
}
