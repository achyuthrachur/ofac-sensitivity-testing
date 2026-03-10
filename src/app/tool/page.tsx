'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import SpotlightCard from '@/components/ui/spotlight-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { People, Global, Setting4, Building, Refresh2, ClipboardTick } from 'iconsax-reactjs';
import { ResultsTable } from '@/components/ResultsTable';
import { EngineExplanationPanel } from '@/components/EngineExplanationPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createScope, animate, stagger } from 'animejs';
import { CLIENT_NAMES } from '@/data/clientNames';
import { InputPanel } from '@/components/screening/InputPanel';
import * as Comlink from 'comlink';
import type { ScreeningWorkerApi, MatchResult } from '@/types/screening';
import sdnData from '@data/sdn.json';
import { ScreeningResultsPane } from '@/components/screening/ScreeningResultsPane';
import { SimulationPane } from '@/components/simulation/SimulationPane';
import { OnboardingBanner } from '@/components/education/OnboardingBanner';
import { SectionCallout } from '@/components/education/SectionCallout';
import { EmptyResultsState } from '@/components/states/EmptyResultsState';
import { EmptyScreeningState } from '@/components/states/EmptyScreeningState';
import { ScreeningProgressBar } from '@/components/screening/ScreeningProgressBar';
import { toast } from 'sonner';

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
  const [activeNames, setActiveNames] = useState<string[]>(CLIENT_NAMES);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [activeTab, setActiveTab] = useState('sensitivity');
  const [isScreening, setIsScreening] = useState(false);
  const [workerAvailable, setWorkerAvailable] = useState(false);

  const toolRoot = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const apiRef = useRef<Comlink.Remote<ScreeningWorkerApi> | null>(null);

  useEffect(() => {
    scope.current = createScope({ root: toolRoot }).add(() => {
      animate('.form-card', {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 700,
        delay: stagger(80),
        ease: 'outQuint',
      });
    });
    return () => scope.current?.revert();
  }, []);

  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../../lib/workers/screening.worker.ts', import.meta.url),
        { type: 'module' }
      );
      apiRef.current = Comlink.wrap<ScreeningWorkerApi>(workerRef.current);
      setWorkerAvailable(true);
    } catch {
      setWorkerAvailable(false);
    }
    return () => {
      try {
        if (apiRef.current) apiRef.current[Comlink.releaseProxy]();
        workerRef.current?.terminate();
      } catch { /* cleanup errors are non-critical */ }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (activeTab === 'sensitivity' && !isPending) {
          e.preventDefault();
          handleSubmit();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isPending]);

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

  const handleRunScreening = async () => {
    if (!apiRef.current) return;
    setIsScreening(true);
    const startTime = Date.now();
    try {
      const results = await apiRef.current.screenNames(
        activeNames,
        sdnData as unknown[]
      );
      setMatchResults(results);
      const elapsed = (Date.now() - startTime) / 1000;
      toast.success(`Screening complete — ${results.length} names processed in ${elapsed.toFixed(1)}s`);
    } finally {
      setIsScreening(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-page flex h-[calc(100vh-48px)]">

      {/* LEFT PANEL — fixed width, independently scrollable */}
      <div ref={toolRoot} className="w-[420px] flex-shrink-0 overflow-y-auto border-r border-border p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-crowe-indigo-dark">OFAC Sensitivity Testing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Synthetic name degradation demo — Crowe AML Practice
          </p>
        </div>

        {/* Card 1 — Entity Counts */}
        <SpotlightCard
          className="form-card rounded-xl bg-card text-card-foreground shadow-crowe-sm"
          spotlightColor="rgba(245, 168, 0, 0.08)"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <People variant="Linear" size={18} color="var(--crowe-indigo-dark)" />
              Entity Counts
            </CardTitle>
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
        </SpotlightCard>

        {/* Card 2 — Linguistic Regions */}
        <SpotlightCard
          className="form-card rounded-xl bg-card text-card-foreground shadow-crowe-sm"
          spotlightColor="rgba(245, 168, 0, 0.08)"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Global variant="Linear" size={18} color="var(--crowe-indigo-dark)" />
              Linguistic Regions
            </CardTitle>
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
        </SpotlightCard>

        {/* Card 3 — Degradation Rules */}
        <SpotlightCard
          className="form-card rounded-xl bg-card text-card-foreground shadow-crowe-sm"
          spotlightColor="rgba(245, 168, 0, 0.08)"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Setting4 variant="Linear" size={18} color="var(--crowe-indigo-dark)" />
              Degradation Rules
            </CardTitle>
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
                  <Label htmlFor={`rule-${ruleId}`} className="flex items-center gap-1 cursor-pointer">
                    <ClipboardTick variant="Linear" size={16} color="currentColor" />
                    {RULE_LABELS[ruleId as RuleId]}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </SpotlightCard>

        {/* Card 4 — Client Name */}
        <SpotlightCard
          className="form-card rounded-xl bg-card text-card-foreground shadow-crowe-sm"
          spotlightColor="rgba(245, 168, 0, 0.08)"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building variant="Linear" size={18} color="var(--crowe-indigo-dark)" />
              Client Name
            </CardTitle>
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
                  <Refresh2 size={16} color="currentColor" className="size-auto animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  Run Test
                  <span className="ml-2 text-xs text-white/40 hidden lg:inline">⌘↵</span>
                </>
              )}
            </Button>
          </CardFooter>
        </SpotlightCard>

      </div>

      {/* RIGHT PANEL — flex-1, independently scrollable */}
      <div className="flex-1 overflow-y-auto">
        <OnboardingBanner />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
          <div className="border-b border-border px-6 pt-4">
            <TabsList>
              <TabsTrigger value="sensitivity">Sensitivity Test</TabsTrigger>
              <TabsTrigger value="screening">Screening Mode</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sensitivity" className="flex-1 overflow-y-auto p-6">
            <SectionCallout tab="sensitivity" />
            {rows.length === 0 ? (
              <EmptyResultsState />
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
          </TabsContent>

          <TabsContent value="simulation" className="flex-1 min-h-0 overflow-y-auto p-6">
            <SectionCallout tab="simulation" />
            <SimulationPane />
          </TabsContent>

          <TabsContent value="screening" className="flex-1 min-h-0 flex flex-col overflow-hidden p-6 gap-4">
            <SectionCallout tab="screening" />
            {matchResults.length === 0 ? (
              <div className="flex flex-col gap-6 flex-1">
                <InputPanel
                  onNamesLoaded={(names) => {
                    setActiveNames(names);
                    if (names.length > 0) {
                      toast.success(`Name list loaded — ${names.length} names ready to screen`);
                    }
                  }}
                  currentCount={activeNames.length}
                />
                {isScreening ? (
                  <ScreeningProgressBar progress={0} nameCount={activeNames.length} processedCount={0} />
                ) : activeNames.length === 0 ? (
                  <EmptyScreeningState />
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleRunScreening}
                      disabled={!workerAvailable || isScreening}
                      className="bg-crowe-amber text-crowe-indigo-dark text-sm font-semibold py-2 px-6 rounded-md
                                 hover:bg-crowe-amber-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                                 flex items-center gap-2"
                    >
                      Run Screening
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <ScreeningResultsPane
                matchResults={matchResults}
                activeNamesCount={activeNames.length}
                onChangeNames={() => setMatchResults([])}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
