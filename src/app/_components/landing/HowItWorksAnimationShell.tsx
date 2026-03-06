'use client';

import { useEffect, useRef } from 'react';
import { createScope, animate, onScroll, stagger } from 'animejs';

export function HowItWorksAnimationShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    scope.current = createScope({ root: rootRef }).add(() => {
      // Scroll-triggered stagger reveal (ANIM-01)
      onScroll({
        target: rootRef.current!,
        enter: 'top bottom',
        onEnterForward: () => {
          animate('.how-it-works-card', {
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 700,
            delay: stagger(90),
            ease: 'outQuint',
          });
        },
      });

      // Hover lift on each card (ANIM-04)
      const cards = rootRef.current!.querySelectorAll<HTMLElement>('.how-it-works-card');
      cards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          animate(card, {
            translateY: -5,
            boxShadow: '0 8px 24px rgba(1,30,65,0.10), 0 4px 8px rgba(1,30,65,0.06)',
            duration: 250,
            ease: 'outQuad',
          });
        });
        card.addEventListener('mouseleave', () => {
          animate(card, {
            translateY: 0,
            boxShadow: '0 4px 8px rgba(1,30,65,0.06), 0 1px 3px rgba(1,30,65,0.04)',
            duration: 250,
            ease: 'outQuad',
          });
        });
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
