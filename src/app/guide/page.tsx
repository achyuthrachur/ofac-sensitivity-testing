import type { Metadata } from 'next';
import { GuideSidebar } from './_components/GuideSidebar';
import { OfacContextSection } from './_components/sections/OfacContextSection';
import { SensitivityTestSection } from './_components/sections/SensitivityTestSection';
import { ScreeningModeSection } from './_components/sections/ScreeningModeSection';
import { ScoringEngineSection } from './_components/sections/ScoringEngineSection';

const GUIDE_MODULES = [
  { id: '01', label: 'Compliance context', Component: OfacContextSection },
  { id: '02', label: 'Sensitivity workflow', Component: SensitivityTestSection },
  { id: '03', label: 'Screening workflow', Component: ScreeningModeSection },
  { id: '04', label: 'Scoring methodology', Component: ScoringEngineSection },
] as const;

export const metadata: Metadata = {
  title: 'User Guide — OFAC Sensitivity Testing | Crowe',
  description:
    'Complete guide to the OFAC Sensitivity Testing tool — Sensitivity Test, Screening Mode, and Scoring Engine.',
};

export default function GuidePage() {
  return (
    <main className="min-h-screen px-6 pb-16 pt-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="section-frame overflow-hidden rounded-[2.5rem] bg-[#011E41] px-8 py-10 text-white lg:px-10 lg:py-12">
          <div className="executive-grid absolute inset-0 opacity-[0.08]" />
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(245,168,0,0.22),transparent_56%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_320px]">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/62">
                User guide
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] text-white lg:text-6xl">
                Explain the workflow like an executive briefing, not a product tour.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-white/74">
                This guide is structured in the same order as the live demo: establish the control
                context, show sensitivity testing, move into batch screening, then explain how the
                scoring engine arrives at each match tier.
              </p>
            </div>
            <div className="executive-panel rounded-[1.9rem] border border-white/12 p-6 text-crowe-indigo-dark">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#6e8298]">
                Reading order
              </p>
              <div className="mt-4 space-y-3">
                {GUIDE_MODULES.map((module) => (
                  <div
                    key={module.id}
                    className="rounded-[1.3rem] border border-[#d7dfe9] bg-white/88 px-4 py-4 shadow-[0_10px_24px_rgba(1,30,65,0.05)]"
                  >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7d8fa4]">
                      {module.id}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{module.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-28 xl:h-fit">
          <GuideSidebar />
          </aside>
          <div className="min-w-0 space-y-6">
            {GUIDE_MODULES.map(({ id, label, Component }) => (
              <article
                key={id}
                className="executive-panel overflow-hidden rounded-[2rem] border border-white/80"
              >
                <div className="flex items-center justify-between border-b border-[#dde5ef] px-8 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7b8ea5]">
                      Module {id}
                    </p>
                    <p className="mt-1 text-sm font-medium text-crowe-tint-700">{label}</p>
                  </div>
                  <div className="rounded-full bg-[#011E41] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white">
                    Guide
                  </div>
                </div>
                <div className="px-8 py-8">
                  <Component />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
