import type { Metadata } from 'next';
import { HeroSection } from './_components/landing/HeroSection';
import { HowItWorksSection } from './_components/landing/HowItWorksSection';
import { FeatureStatsSection } from './_components/landing/FeatureStatsSection';
import { CroweBrandedFooter } from './_components/landing/CroweBrandedFooter';

export const metadata: Metadata = {
  title: 'OFAC Sensitivity Testing — Crowe',
  description:
    'Run live OFAC sensitivity testing demonstrations with synthetic data. No file prep required.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-page">
      <HeroSection />
      <HowItWorksSection />
      <FeatureStatsSection />
      <CroweBrandedFooter />
    </main>
  );
}
