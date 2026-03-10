'use client';

import Link from 'next/link';
import { CloseCircle } from 'iconsax-reactjs';
import { Drawer, DrawerContent, DrawerClose } from '@/components/ui/drawer';
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
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent
        side="right"
        className="w-[380px] bg-crowe-indigo-dark border-l border-white/10 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <p className="text-white font-semibold text-base">Help &amp; Reference</p>
          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Close help"
              className="text-white/50 hover:text-white transition-colors"
            >
              <CloseCircle size={20} color="currentColor" />
            </button>
          </DrawerClose>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Quick Links */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase text-white/50 tracking-wide mb-3">
              Quick Links
            </p>
            <div className="flex flex-col gap-2">
              {QUICK_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="text-crowe-amber hover:text-crowe-amber-bright text-sm transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Glossary */}
          <div>
            <p className="text-xs font-semibold uppercase text-white/50 tracking-wide mb-3">
              Glossary
            </p>
            {GLOSSARY_ORDER.map((key) => {
              const entry = GLOSSARY[key];
              return (
                <div key={key} className="mb-4">
                  <p className="text-white text-sm font-semibold">{entry.label}</p>
                  <p className="text-white/70 text-xs leading-relaxed mt-0.5">
                    {entry.definition}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </DrawerContent>
    </Drawer>
  );
}
