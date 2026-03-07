'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const SECTIONS = [
  { id: 'ofac-context', label: 'OFAC Compliance Context' },
  { id: 'sensitivity-test', label: 'Sensitivity Test' },
  { id: 'screening-mode', label: 'Screening Mode' },
  { id: 'scoring-engine', label: 'Scoring Engine' },
];

export function GuideSidebar() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(id);
            }
          });
        },
        { rootMargin: '-20% 0px -70% 0px' },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <div className="sticky top-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 px-2">
        On This Page
      </p>
      <nav className="space-y-1">
        {SECTIONS.map(({ id, label }) => (
          <Link
            key={id}
            href={`#${id}`}
            className={`block text-sm py-1.5 px-2 rounded transition-colors ${
              activeId === id
                ? 'bg-crowe-indigo-dark text-white font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
