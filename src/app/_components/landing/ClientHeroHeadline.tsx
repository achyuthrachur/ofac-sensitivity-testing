'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import BlurText from '@/components/ui/blur-text';

export function ClientHeroHeadline() {
  const [headlineDone, setHeadlineDone] = useState(false);

  return (
    <>
      <BlurText
        text="Test your OFAC screening before your client does."
        animateBy="words"
        delay={90}
        direction="top"
        stepDuration={0.35}
        as="h1"
        onAnimationComplete={() => setHeadlineDone(true)}
        className="text-4xl md:text-5xl lg:text-6xl text-white font-bold max-w-3xl leading-tight mx-auto justify-center"
      />
      <motion.p
        className="text-lg text-white/80 mt-6 max-w-xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: headlineDone ? 1 : 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        A live sensitivity-testing tool that degrades real-world name variations against 285 synthetic
        SDN entries. No file prep. No waiting.
      </motion.p>
    </>
  );
}
