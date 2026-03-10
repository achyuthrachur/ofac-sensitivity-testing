'use client';

import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { GLOSSARY, type GlossaryKey } from './GlossaryTerms';

interface TermTooltipProps {
  term: GlossaryKey;
  children?: React.ReactNode;
}

export function TermTooltip({ term, children }: TermTooltipProps) {
  const entry = GLOSSARY[term];
  const label = children ?? entry.label;

  return (
    <TooltipProvider delayDuration={200}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <span
            className="border-b border-dotted border-white/50 cursor-help inline"
            tabIndex={0}
          >
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent>{entry.definition}</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
