'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StickyBanner } from '@/components/sticky-banner';

const STORAGE_KEY = 'ofac_tool_onboarding_dismissed';

export function OnboardingBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  return (
    <StickyBanner
      className="bg-crowe-indigo-dark border-b border-white/10"
      onDismiss={handleDismiss}
    >
      <span className="text-white/80 text-sm">
        New to OFAC screening? Learn what each result tier means and how to interpret match scores.{' '}
        <Link
          href="/guide"
          className="text-crowe-amber hover:text-crowe-amber-bright font-medium transition-colors"
        >
          Open User Guide →
        </Link>
      </span>
    </StickyBanner>
  );
}
