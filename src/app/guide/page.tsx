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
      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-10">
        <aside className="w-56 flex-shrink-0">
          <GuideSidebar />
        </aside>
        <main className="flex-1 min-w-0 space-y-20">
          <OfacContextSection />
          <SensitivityTestSection />
          <ScreeningModeSection />
          <ScoringEngineSection />
        </main>
      </div>
    </div>
  );
}
