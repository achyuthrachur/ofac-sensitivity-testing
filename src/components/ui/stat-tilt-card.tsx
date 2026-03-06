'use client';

import type { SpringOptions } from 'motion/react';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface StatTiltCardProps {
  children: React.ReactNode;
  className?: string;
  rotateAmplitude?: number;
}

const springValues: SpringOptions = { damping: 30, stiffness: 100, mass: 2 };

export function StatTiltCard({
  children,
  className = '',
  rotateAmplitude = 7,
}: StatTiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      ref={ref}
      className={`[perspective:800px] ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="w-full h-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
      >
        {children}
      </motion.div>
    </div>
  );
}
