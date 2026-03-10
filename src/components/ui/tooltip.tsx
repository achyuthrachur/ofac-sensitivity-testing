'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={[
          'z-50 max-w-[280px] bg-crowe-indigo-dark border border-white/20 rounded-md',
          'text-white text-xs leading-relaxed p-3',
          'animate-in fade-in-0 zoom-in-95',
          className ?? '',
        ].join(' ')}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-crowe-indigo-dark" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent };
