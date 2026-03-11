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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  People, Global, Setting4, Building, Refresh2, ClipboardTick,
  DocumentUpload, Chart, ArrowRight,
} from 'iconsax-reactjs';
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
import Link from 'next/link';

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

const PANEL_HEADERS: Record<string, { title: string; sub: string }> = {
  sensitivity: {
    title: 'Sensitivity Test',
    sub: 'Configure degradation rules and run against the synthetic SDN dataset',
  },
  screening: {
    title: 'Screening Mode',
    sub: 'Upload names and score them against 285 synthetic SDN entries',
  },
  simulation: {
    title: 'Simulation Mode',
    sub: 'Model catch rate decay under three evasion velocity presets',
  },
  docs: {
    title: 'Methodology',
    sub: 'Plain-language guidance for the scoring model and demo workflow',
  },
};

// ─── Guide Panels ──────────────────────────────────────────────────────────────

function ScreeningGuidePanel() {
  return (
    <SpotlightCard
      className="rounded-xl bg-card text-card-foreground shadow-crowe-sm"
      spotlightColor="rgba(245, 168, 0, 0.08)"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardTick variant="Linear" size={18} color="var(--color-crowe-indigo-dark)" />
          Screening Mode
        </CardTitle>
        <CardDescription>
          Upload a CSV or paste a name list. The engine scores each name against 285 synthetic SDN
          entries using three algorithms and assigns a risk tier.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {[
            { icon: DocumentUpload, text: 'Upload a CSV or paste names.' },
            { icon: Setting4, text: 'Adjust the match threshold slider.' },
            { icon: ClipboardTick, text: 'Click Run Screening to score all names.' },
            { icon: ArrowRight, text: 'Export results as CSV or PDF.' },
          ].map((step, i) => {
            const StepIcon = step.icon;
            return (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-crowe-amber/10 flex items-center justify-center text-[10px] font-bold text-crowe-indigo-dark">
                  {i + 1}
                </span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <StepIcon variant="Linear" size={14} color="currentColor" />
                  {step.text}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
      <CardFooter>
        <Link
          href="/guide#screening-mode"
          className="text-xs text-crowe-amber hover:text-crowe-amber-bright transition-colors flex items-center gap-1"
        >
          Full guide <ArrowRight variant="Linear" size={12} color="currentColor" />
        </Link>
      </CardFooter>
    </SpotlightCard>
  );
}

function SimulationGuidePanel() {
  return (
    <SpotlightCard
      className="rounded-xl bg-card text-card-foreground shadow-crowe-sm"
      spotlightColor="rgba(245, 168, 0, 0.08)"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Chart variant="Linear" size={18} color="var(--color-crowe-indigo-dark)" />
          Simulation Mode
        </CardTitle>
        <CardDescription>
          Model how catch rates degrade over time as sanctioned entities adopt increasingly
          sophisticated evasion tactics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {[
            { icon: Chart, text: 'Select a velocity preset (Baseline, Elevated, Surge).' },
            { icon: Refresh2, text: 'Optionally enter a recalibration point.' },
            { icon: ArrowRight, text: 'Click Run Simulation.' },
            { icon: ArrowRight, text: 'Inspect the catch rate chart and snapshot table.' },
          ].map((step, i) => {
            const StepIcon = step.icon;
            return (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-crowe-amber/10 flex items-center justify-center text-[10px] font-bold text-crowe-indigo-dark">
                  {i + 1}
                </span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <StepIcon variant="Linear" size={14} color="currentColor" />
                  {step.text}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
      <CardFooter>
        <Link
          href="/guide#simulation"
          className="text-xs text-crowe-amber hover:text-crowe-amber-bright transition-colors flex items-center gap-1"
        >
          Full guide <ArrowRight variant="Linear" size={12} color="currentColor" />
        </Link>
      </CardFooter>
    </SpotlightCard>
  );
}

function DemoStarterCallout() {
  return (
    <Alert className="border border-crowe-amber/30 bg-crowe-amber/8 text-foreground">
      <ClipboardTick
        variant="Linear"
        size={16}
        color="var(--color-crowe-indigo-dark)"
      />
      <AlertTitle className="text-crowe-indigo-dark">Recommended demo flow</AlertTitle>
      <AlertDescription className="mt-2 text-muted-foreground">
        <ol className="space-y-1.5">
          <li>1. Keep all entity counts at 10.</li>
          <li>2. Leave all four regions enabled.</li>
          <li>3. Keep all degradation rules selected.</li>
          <li>4. Run Sensitivity Test first.</li>
          <li>5. Use the preloaded screening list next.</li>
          <li>6. Finish with the Baseline simulation.</li>
        </ol>
      </AlertDescription>
    </Alert>
  );
}

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

  const panelHeader = PANEL_HEADERS[activeTab] ?? PANEL_HEADERS.sensitivity;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-page flex h-[calc(100vh-48px)]">

      {/* LEFT PANEL — fixed width, independently scrollable */}
      <div ref={toolRoot} className="w-[460px] flex-shrink-0 overflow-y-auto border-r border-border p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-crowe-indigo-dark">{panelHeader.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{panelHeader.sub}</p>
        </div>

        <DemoStarterCallout />

        {/* Sensitivity form — only when sensitivity or docs tab is active */}
        {(activeTab === 'sensitivity' || activeTab === 'docs') && (
          <>
            {/* Card 1 — Entity Counts */}
            <SpotlightCard
              className="form-card rounded-xl bg-card text-card-foreground shadow-crowe-sm"
              spotlightColor="rgba(245, 168, 0, 0.08)"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <People variant="Linear" size={18} color="var(--color-crowe-indigo-dark)" />
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
                  <Global variant="Linear" size={18} color="var(--color-crowe-indigo-dark)" />
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
                  <Setting4 variant="Linear" size={18} color="var(--color-crowe-indigo-dark)" />
                  Degradation Rules
                </CardTitle>
                <CardDescription>Select which name degradation rules to apply</CardDescription>
              </CardHeader>
              <CardContent>
                <fieldset aria-describedby="degradation-rules-help" className="space-y-3">
                  <legend className="sr-only">Degradation rules</legend>
                  <p id="degradation-rules-help" className="text-xs text-muted-foreground">
                    These rules simulate common screening blind spots such as spacing changes,
                    phonetic variants, truncation, and punctuation loss.
                  </p>

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

                  <div className="border-t" />

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
                        <Label htmlFor={`rule-${ruleId}`} className="cursor-pointer text-sm leading-tight">
                          {RULE_LABELS[ruleId as RuleId]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </CardContent>
            </SpotlightCard>

            {/* Card 4 — Client Name */}
            <SpotlightCard
              className="form-card rounded-xl bg-card text-card-foreground shadow-crowe-sm"
              spotlightColor="rgba(245, 168, 0, 0.08)"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building variant="Linear" size={18} color="var(--color-crowe-indigo-dark)" />
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
          </>
        )}

        {activeTab === 'screening' && <ScreeningGuidePanel />}
        {activeTab === 'simulation' && <SimulationGuidePanel />}

      </div>

      {/* RIGHT PANEL — flex-1, independently scrollable */}
      <div className="flex-1 overflow-y-auto">
        <OnboardingBanner />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
          <div className="border-b border-border px-6 pt-4">
            <TabsList>
              <TabsTrigger value="sensitivity">
                <span className="mr-1.5 text-xs opacity-50">1</span>Sensitivity Test
              </TabsTrigger>
              <TabsTrigger value="screening">
                <span className="mr-1.5 text-xs opacity-50">2</span>Screening Mode
              </TabsTrigger>
              <TabsTrigger value="simulation">
                <span className="mr-1.5 text-xs opacity-50">3</span>Simulation
              </TabsTrigger>
              <TabsTrigger value="docs">Methodology</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sensitivity" className="flex-1 overflow-y-auto p-6">
            <SectionCallout tab="sensitivity" />
            {rows.length === 0 ? (
              <EmptyResultsState />
            ) : (
              <>
                <ResultsTable rows={rows} clientName={clientName} />
                {/* Cross-tab CTA */}
                <div className="mt-6 rounded-lg border border-crowe-amber/20 bg-crowe-amber/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Next: Try Screening Mode</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Upload real names and see how the engine scores them against the SDN dataset.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('screening')}
                    className="text-xs font-semibold text-crowe-amber hover:text-crowe-amber-bright flex items-center gap-1 transition-colors"
                  >
                    Go to Screening <ArrowRight size={14} color="currentColor" />
                  </button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="screening" className="flex-1 min-h-0 flex flex-col overflow-hidden p-6 gap-4">
            <SectionCallout tab="screening" />
            {matchResults.length === 0 ? (
              <div className="flex flex-col gap-4 flex-1">
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
              <>
                <ScreeningResultsPane
                  matchResults={matchResults}
                  activeNamesCount={activeNames.length}
                  onChangeNames={() => setMatchResults([])}
                />
                {/* Cross-tab CTA */}
                <div className="mt-2 rounded-lg border border-crowe-amber/20 bg-crowe-amber/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Next: Try Simulation</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Project how catch rates decay over time as evasion tactics evolve.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('simulation')}
                    className="text-xs font-semibold text-crowe-amber hover:text-crowe-amber-bright flex items-center gap-1 transition-colors"
                  >
                    Go to Simulation <ArrowRight size={14} color="currentColor" />
                  </button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="simulation" className="flex-1 min-h-0 overflow-y-auto p-6">
            <SectionCallout tab="simulation" />
            <SimulationPane />
          </TabsContent>

          <TabsContent value="docs" className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-4xl">
              <EngineExplanationPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
