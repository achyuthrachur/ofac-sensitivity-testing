import type { ReactNode } from 'react';

interface EmptyStatePanelProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export function EmptyStatePanel({
  eyebrow,
  title,
  description,
  icon,
}: EmptyStatePanelProps) {
  return (
    <div className="executive-panel mx-auto flex max-w-3xl flex-col items-center justify-center rounded-[2rem] border border-white/80 px-8 py-14 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#011E41] text-white shadow-[0_14px_30px_rgba(1,30,65,0.16)]">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b8ea5]">{eyebrow}</p>
      <h3 className="mt-3 text-3xl font-semibold text-crowe-indigo-dark">{title}</h3>
      <p className="mt-4 max-w-xl text-sm leading-7 text-crowe-tint-700">{description}</p>
    </div>
  );
}
