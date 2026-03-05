import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Run Test — OFAC Sensitivity Testing | Crowe',
  description: 'Configure and run synthetic OFAC name degradation tests against 285 synthetic SDN entries.',
};

export default function ToolLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* Slim tool footer — owned here since root layout.tsx footer was removed */}
      <footer className="bg-crowe-indigo-dark px-6 py-4 text-center">
        <p className="text-white/70 text-xs">
          &copy; 2026 Crowe LLP. For demonstration purposes only.{' '}
          <Link href="/" className="text-crowe-amber hover:text-crowe-amber-bright underline">
            Back to overview
          </Link>
        </p>
      </footer>
    </>
  );
}
