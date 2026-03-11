'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'iconsax-reactjs';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Tool', href: '/tool' },
  { name: 'User Guide', href: '/guide' },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const showToolCta = pathname !== '/tool';

  return (
    <header className="sticky top-0 z-50 hidden border-b border-white/10 bg-crowe-indigo-dark text-white shadow-[0_16px_40px_rgba(1,30,65,0.18)] lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3 xl:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 text-sm font-semibold text-white">
            C
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-white/65">
              Crowe
            </p>
            <p className="truncate font-display text-lg font-semibold text-white">
              OFAC Sensitivity Lab
            </p>
          </div>
        </Link>

        <div className="flex items-center justify-end gap-3">
          <nav
            aria-label="Primary"
            className="flex items-center gap-1 rounded-full border border-white/10 bg-white/6 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                    active
                      ? 'bg-crowe-amber text-crowe-indigo-dark shadow-[0_8px_24px_rgba(1,30,65,0.18)]'
                      : 'text-white/78 hover:bg-white/8 hover:text-white',
                  ].join(' ')}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {showToolCta ? (
            <Link
              href="/tool"
              className="inline-flex items-center gap-2 rounded-full bg-crowe-amber px-4 py-2 text-sm font-semibold text-crowe-indigo-dark transition-transform hover:-translate-y-0.5"
            >
              Launch Tool
              <ArrowRight variant="Linear" size={14} color="currentColor" />
            </Link>
          ) : (
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              View Guide
              <ArrowRight variant="Linear" size={14} color="currentColor" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
