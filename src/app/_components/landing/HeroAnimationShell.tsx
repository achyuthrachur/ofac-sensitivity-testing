'use client';

import { useEffect, useRef } from 'react';
import { createScope, animate } from 'animejs';

export function HeroAnimationShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    scope.current = createScope({ root: rootRef }).add(() => {
      const ctaButton = rootRef.current!.querySelector<HTMLElement>('.cta-button');
      if (!ctaButton) return;

      let glowAnimation: ReturnType<typeof animate> | null = null;

      ctaButton.addEventListener('mouseenter', () => {
        glowAnimation = animate(ctaButton, {
          boxShadow: [
            '0 4px 16px rgba(245,168,0,0.20)',
            '0 6px 24px rgba(245,168,0,0.50)',
          ],
          duration: 900,
          loop: true,
          alternate: true,
          ease: 'inOutSine',
        });
      });

      ctaButton.addEventListener('mouseleave', () => {
        if (glowAnimation) {
          glowAnimation.pause();
          glowAnimation = null;
        }
        animate(ctaButton, {
          boxShadow: '0 4px 16px rgba(245,168,0,0.00)',
          duration: 300,
          ease: 'outQuad',
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
