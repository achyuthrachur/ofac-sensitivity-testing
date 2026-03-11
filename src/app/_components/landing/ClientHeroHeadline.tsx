'use client';

// Aesthetic direction: Swiss editorial executive.
import { useState } from 'react';
import { motion } from 'motion/react';
import BlurText from '@/components/ui/blur-text';

export function ClientHeroHeadline() {
  const [headlineDone, setHeadlineDone] = useState(false);

  return (
    <>
      <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
        <span className="h-2 w-2 rounded-full bg-crowe-amber" />
        Executive demo environment
      </div>
      <BlurText
        text="Test your OFAC screening before your client does."
        animateBy="words"
        delay={90}
        direction="top"
        stepDuration={0.35}
        as="h1"
        onAnimationComplete={() => setHeadlineDone(true)}
        className="max-w-4xl justify-start text-left text-5xl font-semibold leading-[0.95] text-white md:text-6xl lg:text-7xl"
      />
      <motion.p
        className="mt-8 max-w-2xl text-base leading-7 text-white/76 md:text-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: headlineDone ? 1 : 0, y: headlineDone ? 0 : 12 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        A live sensitivity-testing workspace that pressure-tests real-world name variation
        against 285 synthetic SDN entries, screening workflows, and catch-rate decay scenarios.
      </motion.p>
    </>
  );
}
