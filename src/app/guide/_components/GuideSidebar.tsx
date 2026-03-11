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
    <div className="executive-panel sticky top-28 rounded-[1.8rem] border border-white/80 px-4 py-5">
      <p className="px-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#7b8ea5]">
        On this page
      </p>
      <p className="px-2 pt-2 text-sm leading-6 text-crowe-tint-700">
        Read in order. The active section follows scroll position.
      </p>
      <nav className="mt-5 space-y-2">
        {SECTIONS.map(({ id, label }, index) => {
          const active = activeId === id;

          return (
            <Link
              key={id}
              href={`#${id}`}
              aria-current={active ? 'true' : undefined}
              className={[
                'flex items-center gap-3 rounded-[1.2rem] border px-3 py-3 transition-all',
                active
                  ? 'border-[#011E41] bg-[#011E41] text-white shadow-[0_14px_32px_rgba(1,30,65,0.16)]'
                  : 'border-transparent bg-white/72 text-crowe-tint-700 hover:border-[#d9e1eb] hover:text-crowe-indigo-dark',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[0.68rem] font-semibold uppercase tracking-[0.12em]',
                  active ? 'bg-white/12 text-white' : 'bg-[#eef2f7] text-crowe-indigo-dark',
                ].join(' ')}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm font-medium leading-5">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
