'use client';

import { motion, Transition, Easing } from 'motion/react';
import { useEffect, useRef, useState, useMemo } from 'react';

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;
  as?: keyof React.JSX.IntrinsicElements;
};

const buildAnimationSteps = (
  from: Record<string, string | number>,
  to: Array<Record<string, string | number>>,
  stepDuration: number,
  easing: Easing | Easing[]
): Transition => {
  const steps = [from, ...to];
  return {
    duration: stepDuration,
    times: steps.map((_, i) => i / (steps.length - 1)),
    ease: easing,
  };
};

const BlurText = ({
  text = '',
  delay = 200,
  className,
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = 'easeOut',
  onAnimationComplete,
  stepDuration = 0.35,
  as,
}: BlurTextProps) => {
  const elements = useMemo(
    () => (animateBy === 'words' ? text.split(' ') : text.split('')),
    [text, animateBy]
  );
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const animatedCount = useRef(0);

  const defaultFrom: Record<string, string | number> = useMemo(
    () => ({
      filter: 'blur(10px)',
      opacity: 0,
      y: direction === 'top' ? -20 : 20,
    }),
    [direction]
  );

  const defaultTo: Array<Record<string, string | number>> = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.5,
        y: direction === 'top' ? 5 : -5,
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction]
  );

  const from = animationFrom ?? defaultFrom;
  const to = animationTo ?? defaultTo;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const Tag = (as ?? 'p') as React.ElementType;

  return (
    <Tag ref={ref} className={`blur-text ${className ?? ''} flex flex-wrap`}>
      {elements.map((el, index) => (
        <motion.span
          key={index}
          initial={from}
          animate={inView ? to[to.length - 1] : from}
          transition={{
            ...buildAnimationSteps(from, to, stepDuration, easing),
            delay: (index * delay) / 1000,
          }}
          onAnimationComplete={() => {
            animatedCount.current += 1;
            if (animatedCount.current === elements.length && onAnimationComplete) {
              onAnimationComplete();
            }
          }}
          style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
        >
          {el === ' ' ? '\u00A0' : el}
          {animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Tag>
  );
};

export default BlurText;
