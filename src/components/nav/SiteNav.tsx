'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Tool', href: '/tool' },
  { name: 'User Guide', href: '/guide' },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-crowe-indigo-dark px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-white font-bold text-lg tracking-tight">
        Crowe
      </Link>
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={[
                'relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                active
                  ? 'text-crowe-amber font-semibold'
                  : 'text-white/70 hover:text-white',
              ].join(' ')}
            >
              <span className="relative z-10">{link.name}</span>
              {active && (
                <motion.div
                  layoutId="nav-lamp"
                  className="absolute inset-0 rounded-full bg-white/5 -z-0"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {/* Tubelight bloom effect */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-crowe-amber rounded-t-full">
                    <div className="absolute w-10 h-5 bg-crowe-amber/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-6 h-4 bg-crowe-amber/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-3 h-3 bg-crowe-amber/30 rounded-full blur-sm top-0 left-1.5" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
