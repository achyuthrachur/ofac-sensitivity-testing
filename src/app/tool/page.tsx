'use client';

import { useState, useTransition } from 'react';
import { runTest } from '@/app/actions/runTest';
import type { ActionResult, ResultRow, Region } from '@/types';
import { REGION_VALUES } from '@/types';
import { CANONICAL_RULE_ORDER, RULE_LABELS } from '@/lib/rules';
import type { RuleId } from '@/lib/rules';
import { MAX_ENTITY_COUNT } from '@/lib/constants';
import {
  parseEntityCount,
  toggleRegion,
  toggleRule,
  deriveSelectAllState,
  buildRunParams,
} from '@/lib/formUtils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { ResultsTable } from '@/components/ResultsTable';
import { EngineExplanationPanel } from '@/components/EngineExplanationPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// ─── Module-level constants ────────────────────────────────────────────────────

const REGION_LABELS: Record<string, string> = {
  [REGION_VALUES.arabic]: 'Arabic',
  [REGION_VALUES.cjk]: 'Chinese',
  [REGION_VALUES.cyrillic]: 'Russian/Cyrillic',
  [REGION_VALUES.latin]: 'Latin/European',
};

const ENTITY_LABELS = ['individual', 'business', 'vessel', 'aircraft'] as const;

const ENTITY_DISPLAY: Record<string, string> = {
  individual: 'Individual',
  business: 'Business',
  vessel: 'Vessel',
  aircraft: 'Aircraft',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [entityCounts, setEntityCounts] = useState({
    individual: 10,
    business: 10,
    vessel: 10,
    aircraft: 10,
  });
  const [regions, setRegions] = useState<Region[]>([
    REGION_VALUES.arabic,
    REGION_VALUES.cjk,
    REGION_VALUES.cyrillic,
    REGION_VALUES.latin,
  ]);
  const [ruleIds, setRuleIds] = useState<string[]>([...CANONICAL_RULE_ORDER]);
  const [clientName, setClientName] = useState('');
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const rows: ResultRow[] = result?.ok ? result.rows : [];

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    startTransition(async () => {
      const actionResult = await runTest(
        buildRunParams(entityCounts, regions, ruleIds, clientName),
      );
      setResult(actionResult);
    });
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    setRuleIds(checked === true ? [...CANONICAL_RULE_ORDER] : []);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-page flex h-[calc(100vh-48px)]">

      {/* LEFT PANEL — fixed width, independently scrollable */}
      <div className="w-[420px] flex-shrink-0 overflow-y-auto border-r border-border p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-crowe-indigo-dark">OFAC Sensitivity Testing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Synthetic name degradation demo — Crowe AML Practice
          </p>
        </div>

        {/* Card 1 — Entity Counts */}
        <Card>
          <CardHeader>
            <CardTitle>Entity Counts</CardTitle>
            <CardDescription>
              Number of names to sample per entity type (0–{MAX_ENTITY_COUNT} each)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {ENTITY_LABELS.map((entity) => (
                <div key={entity}>
                  <Label htmlFor={`count-${entity}`}>{ENTITY_DISPLAY[entity]}</Label>
                  <Input
                    id={`count-${entity}`}
                    type="number"
                    min={0}
                    max={MAX_ENTITY_COUNT}
                    value={entityCounts[entity]}
                    disabled={isPending}
                    onChange={(e) =>
                      setEntityCounts((prev) => ({
                        ...prev,
                        [entity]: parseEntityCount(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 2 — Linguistic Regions */}
        <Card>
          <CardHeader>
            <CardTitle>Linguistic Regions</CardTitle>
            <CardDescription>Include names from these regions in the sample</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(REGION_VALUES).map((r) => (
                <div key={r} className="flex items-center gap-2">
                  <Checkbox
                    id={`region-${r}`}
                    checked={regions.includes(r)}
                    disabled={isPending}
                    onCheckedChange={(checked) => {
                      if (checked !== 'indeterminate') {
                        setRegions(toggleRegion(regions, r as Region));
                      }
                    }}
                  />
                  <Label htmlFor={`region-${r}`}>{REGION_LABELS[r]}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 3 — Degradation Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Degradation Rules</CardTitle>
            <CardDescription>Select which name degradation rules to apply</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Select All row */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="rule-select-all"
                checked={deriveSelectAllState(ruleIds)}
                disabled={isPending}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="rule-select-all" className="font-medium">
                Select All
              </Label>
            </div>

            {/* Separator */}
            <div className="border-t my-3" />

            {/* Individual rule checkboxes */}
            <div className="grid grid-cols-2 gap-3">
              {CANONICAL_RULE_ORDER.map((ruleId) => (
                <div key={ruleId} className="flex items-center gap-2">
                  <Checkbox
                    id={`rule-${ruleId}`}
                    checked={ruleIds.includes(ruleId)}
                    disabled={isPending}
                    onCheckedChange={(checked) => {
                      if (checked !== 'indeterminate') {
                        setRuleIds(toggleRule(ruleIds, ruleId));
                      }
                    }}
                  />
                  <Label htmlFor={`rule-${ruleId}`}>{RULE_LABELS[ruleId as RuleId]}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 4 — Client Name */}
        <Card>
          <CardHeader>
            <CardTitle>Client Name</CardTitle>
            <CardDescription>Used to label the output CSV file</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="client-name">Organization name</Label>
            <Input
              id="client-name"
              type="text"
              placeholder="e.g. Acme Financial Corp"
              value={clientName}
              disabled={isPending}
              onChange={(e) => setClientName(e.target.value)}
            />

            {/* Error banner — only when last result was a failure */}
            {result?.ok === false && (
              <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {result.error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full bg-crowe-amber text-crowe-indigo-dark font-semibold hover:bg-crowe-amber-dark hover:shadow-[0_4px_16px_rgba(245,168,0,0.30)] transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                'Run Test'
              )}
            </Button>
          </CardFooter>
        </Card>

      </div>

      {/* RIGHT PANEL — flex-1, independently scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        {rows.length === 0 ? (
          <EngineExplanationPanel />
        ) : (
          <Tabs defaultValue="results">
            <TabsList className="mb-4">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="explanation">Engine Docs</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
              <ResultsTable rows={rows} clientName={clientName} />
            </TabsContent>
            <TabsContent value="explanation">
              <EngineExplanationPanel />
            </TabsContent>
          </Tabs>
        )}
      </div>

    </div>
  );
}
