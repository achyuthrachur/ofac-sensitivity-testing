'use client';

import { useState } from 'react';
import { HelpFab } from './HelpFab';
import { HelpDrawer } from './HelpDrawer';

export function HelpFabWithDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <HelpFab onClick={() => setOpen(true)} />
      <HelpDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
