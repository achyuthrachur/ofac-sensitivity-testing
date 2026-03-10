'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: 'var(--crowe-indigo-dark, #1e2a4a)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'white',
        },
      }}
    />
  );
}
