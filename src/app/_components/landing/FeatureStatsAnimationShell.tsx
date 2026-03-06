'use client';

import { useEffect, useRef } from 'react';
import { createScope, animate, onScroll, stagger } from 'animejs';

export function FeatureStatsAnimationShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    scope.current = createScope({ root: rootRef }).add(() => {
      onScroll({
        target: rootRef.current!,
        enter: 'top bottom',
        onEnterForward: () => {
          // Stagger entrance of stat cards (ANIM-01)
          animate('.stat-number', {
            opacity: [0, 1],
            translateY: [40, 0],
            duration: 600,
            delay: stagger(100),
            ease: 'outQuint',
          });

          // Count-up on numeric value spans (ANIM-03)
          const statValues = rootRef.current!.querySelectorAll<HTMLElement>('.stat-value');
          statValues.forEach((el) => {
            const endValue = parseInt(el.dataset.value ?? '0', 10);
            animate(el, {
              innerHTML: [0, endValue],
              round: 1,
              duration: 1800,
              ease: 'outExpo',
            });
          });
        },
      });
    });

    return () => scope.current?.revert();
  }, []);

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  );
}
