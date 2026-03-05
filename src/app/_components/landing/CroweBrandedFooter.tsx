import Link from 'next/link';
import { ExportSquare } from 'iconsax-reactjs';

export function CroweBrandedFooter() {
  return (
    <footer className="bg-crowe-indigo-dark py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column */}
        <div>
          <p className="text-white font-bold text-xl">Crowe</p>
          <p className="text-white/70 text-sm mt-1">OFAC Sensitivity Testing Tool</p>
        </div>

        {/* Center column */}
        <div className="flex flex-col gap-3">
          <Link
            href="/tool"
            className="text-white/70 hover:text-crowe-amber transition-colors text-sm"
          >
            Run a Test
          </Link>
          <a
            href="https://www.crowe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-crowe-amber transition-colors text-sm inline-flex items-center gap-1"
          >
            Crowe.com
            <ExportSquare variant="Linear" size={14} color="currentColor" />
          </a>
        </div>

        {/* Right column */}
        <div>
          <p className="text-white/60 text-sm">
            For demonstration purposes only. Not for compliance use.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 mt-8 pt-6 text-center">
        <p className="text-white/50 text-xs">© 2026 Crowe LLP. All rights reserved.</p>
      </div>
    </footer>
  );
}
