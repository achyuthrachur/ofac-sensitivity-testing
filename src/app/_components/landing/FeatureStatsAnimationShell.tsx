'use client';

import { useEffect, useRef } from 'react';
import { createScope, animate, onScroll, stagger } from 'animejs';

export function FeatureStatsAnimationShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const hasAnimated = useRef(false);
  const frameRefs = useRef<number[]>([]);

  useEffect(() => {
    if (!rootRef.current) return;

    scope.current = createScope({ root: rootRef }).add(() => {
      onScroll({
        target: rootRef.current!,
        enter: 'top bottom',
        onEnterForward: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;

          // Animate the card surface instead of the numeric node so Anime does not interpolate the text.
          animate('.stat-card', {
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
            el.textContent = '0';
            const startTime = performance.now();
            const duration = 1800;

            const tick = (now: number) => {
              const progress = Math.min((now - startTime) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 4);
              el.textContent = String(Math.round(endValue * eased));

              if (progress < 1) {
                frameRefs.current.push(requestAnimationFrame(tick));
              }
            };

            frameRefs.current.push(requestAnimationFrame(tick));
          });
        },
      });
    });

    return () => {
      frameRefs.current.forEach((frame) => cancelAnimationFrame(frame));
      frameRefs.current = [];
      scope.current?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  );
}
