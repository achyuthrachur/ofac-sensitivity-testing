import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: 'OFAC Sensitivity Testing — Crowe',
  description: 'Synthetic OFAC name degradation testing for AML screening demonstrations.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Slim Crowe indigo header */}
        <header className="bg-crowe-indigo-dark px-6 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-lg tracking-tight">Crowe</span>
          <nav className="flex items-center gap-6">
            <Link
              href="/guide"
              className="text-white/80 text-sm hover:text-white transition-colors"
            >
              User Guide
            </Link>
            <span className="text-white/80 text-sm">OFAC Sensitivity Testing</span>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
