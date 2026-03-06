import type { Metadata } from 'next';
import { HeroSection } from './_components/landing/HeroSection';
import { HowItWorksSection } from './_components/landing/HowItWorksSection';
import { FeatureStatsSection } from './_components/landing/FeatureStatsSection';
import { CroweBrandedFooter } from './_components/landing/CroweBrandedFooter';
import { HeroAnimationShell } from './_components/landing/HeroAnimationShell';
import { HowItWorksAnimationShell } from './_components/landing/HowItWorksAnimationShell';
import { FeatureStatsAnimationShell } from './_components/landing/FeatureStatsAnimationShell';

export const metadata: Metadata = {
  title: 'OFAC Sensitivity Testing — Crowe',
  description:
    'Run live OFAC sensitivity testing demonstrations with synthetic data. No file prep. No waiting.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-page">
      <HeroAnimationShell>
        <HeroSection />
      </HeroAnimationShell>
      <HowItWorksAnimationShell>
        <HowItWorksSection />
      </HowItWorksAnimationShell>
      <FeatureStatsAnimationShell>
        <FeatureStatsSection />
      </FeatureStatsAnimationShell>
      <CroweBrandedFooter />
    </main>
  );
}
