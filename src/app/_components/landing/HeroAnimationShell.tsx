'use client';

import { useEffect, useRef } from 'react';
import { createScope, animate } from 'animejs';

const baseGlow       = '0 0 20px rgba(245,168,0,0.35), 0 4px 16px rgba(245,168,0,0.25)';
const amplifiedGlow1 = '0 0 20px rgba(245,168,0,0.35), 0 4px 16px rgba(245,168,0,0.25)';
const amplifiedGlow2 = '0 0 32px rgba(245,168,0,0.65), 0 6px 28px rgba(245,168,0,0.45)';

export function HeroAnimationShell({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    scope.current = createScope({ root: rootRef }).add(() => {
      const ctaButton = rootRef.current!.querySelector<HTMLElement>('.cta-button');
      if (!ctaButton) return;

      // Always-on base glow — set immediately on mount (no transition)
      animate(ctaButton, { boxShadow: baseGlow, duration: 0 });

      let glowAnimation: ReturnType<typeof animate> | null = null;

      ctaButton.addEventListener('mouseenter', () => {
        glowAnimation = animate(ctaButton, {
          boxShadow: [amplifiedGlow1, amplifiedGlow2],
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
        // Restore to base (not to transparent zero)
        animate(ctaButton, {
          boxShadow: baseGlow,
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
