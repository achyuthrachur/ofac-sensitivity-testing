'use client';

import Link from 'next/link';
import { ArrowRight2, CloseCircle } from 'iconsax-reactjs';
import { Drawer, DrawerClose, DrawerContent } from '@/components/ui/drawer';
import { GLOSSARY } from '@/components/education/GlossaryTerms';

const QUICK_LINKS = [
  { label: 'What is OFAC screening?', href: '/guide#ofac-context' },
  { label: 'Running a Sensitivity Test', href: '/guide#sensitivity-test' },
  { label: 'Using Screening Mode', href: '/guide#screening-mode' },
  { label: 'Understanding match scores', href: '/guide#scoring-engine' },
] as const;

const GLOSSARY_ORDER = [
  'ofac',
  'sdn',
  'threshold',
  'risk-tier',
  'composite-score',
  'jaro-winkler',
  'double-metaphone',
  'token-sort-ratio',
  'false-positive',
  'false-negative',
  'cost-of-miss',
] as const;

interface HelpDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function HelpDrawer({ open, onClose }: HelpDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent
        side="right"
        className="flex w-[420px] max-w-[calc(100vw-24px)] flex-col border-l border-[#12335f] bg-[linear-gradient(180deg,#03172f,#082447)] text-white"
      >
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/52">
                Help and reference
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Keep the room moving.</h2>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Use the quick links for narrative flow and the glossary for precise screening terms.
              </p>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                aria-label="Close help"
                className="text-white/50 transition-colors hover:text-white"
              >
                <CloseCircle size={22} color="currentColor" />
              </button>
            </DrawerClose>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <section className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
              Quick links
            </p>
            <div className="mt-4 space-y-3">
              {QUICK_LINKS.map(({ label, href }, index) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/6 px-4 py-4 text-sm font-medium text-white/86 transition-colors hover:border-white/20 hover:bg-white/10"
                >
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/40">
                      0{index + 1}
                    </p>
                    <p className="mt-1">{label}</p>
                  </div>
                  <ArrowRight2 size={16} color="currentColor" />
                </Link>
              ))}
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
              Glossary
            </p>
            <div className="mt-4 space-y-3">
              {GLOSSARY_ORDER.map((key) => {
                const entry = GLOSSARY[key];

                return (
                  <article
                    key={key}
                    className="rounded-[1.25rem] border border-white/10 bg-white/6 px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-white">{entry.label}</p>
                    <p className="mt-2 text-xs leading-6 text-white/68">{entry.definition}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
