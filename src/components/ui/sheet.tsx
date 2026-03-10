'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetOverlay({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={['fixed inset-0 z-50 bg-black/40 backdrop-blur-sm', className ?? ''].join(' ')}
      {...props}
    />
  );
}

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'right' | 'left';
}

function SheetContent({ side = 'right', className, children, ...props }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={[
          'fixed z-50 top-0 h-full w-[380px] bg-crowe-indigo-dark border-l border-white/10',
          'flex flex-col overflow-hidden',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'duration-300',
          side === 'right' ? 'right-0' : 'left-0',
          className ?? '',
        ].join(' ')}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['px-6 py-4 border-b border-white/10 flex items-center justify-between', className ?? ''].join(' ')}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <DialogPrimitive.Title
      className={['text-white font-semibold text-base', className ?? ''].join(' ')}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={['flex-1 overflow-y-auto px-6 py-4', className ?? ''].join(' ')}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetBody };
