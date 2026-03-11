import type { Metadata } from 'next';
import { GuideSidebar } from './_components/GuideSidebar';
import { OfacContextSection } from './_components/sections/OfacContextSection';
import { SensitivityTestSection } from './_components/sections/SensitivityTestSection';
import { ScreeningModeSection } from './_components/sections/ScreeningModeSection';
import { ScoringEngineSection } from './_components/sections/ScoringEngineSection';

export const metadata: Metadata = {
  title: 'User Guide — OFAC Sensitivity Testing | Crowe',
  description:
    'Complete guide to the OFAC Sensitivity Testing tool — Sensitivity Test, Screening Mode, and Scoring Engine.',
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto flex max-w-7xl gap-10 px-6 py-12">
        <aside className="w-56 flex-shrink-0">
          <GuideSidebar />
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-4xl space-y-20">
            <OfacContextSection />
            <SensitivityTestSection />
            <ScreeningModeSection />
            <ScoringEngineSection />
          </div>
        </main>
      </div>
    </div>
  );
}
