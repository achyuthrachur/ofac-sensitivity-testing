'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { StickyBanner } from '@/components/sticky-banner';

const STORAGE_KEY = 'ofac_tool_onboarding_dismissed';

function subscribe() {
  return () => {};
}

function getBannerSnapshot() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== 'true';
}

export function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(false);
  const show = useSyncExternalStore(subscribe, getBannerSnapshot, () => false) && !dismissed;

  if (!show) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  return (
    <StickyBanner
      className="border-b border-[#12335f] bg-[linear-gradient(90deg,#011E41,#0A2B57)] px-6"
      onDismiss={handleDismiss}
    >
      <div className="flex w-full max-w-6xl items-center gap-4 pr-10">
        <div className="rounded-full bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-white/72">
          Start here
        </div>
        <span className="text-sm text-white/80">
          New to OFAC screening? Learn how tiering, match scores, and threshold changes affect the
          analyst view before you present results.
        </span>
        <Link
          href="/guide"
          className="ml-auto whitespace-nowrap text-sm font-semibold text-crowe-amber transition-colors hover:text-crowe-amber-bright"
        >
          Open User Guide -&gt;
        </Link>
      </div>
    </StickyBanner>
  );
}
