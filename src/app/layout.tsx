import type { Metadata } from "next";
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
          <span className="text-white/80 text-sm">OFAC Sensitivity Testing</span>
        </header>

        {children}

        {/* Minimal Crowe indigo footer */}
        <footer className="bg-crowe-indigo-dark px-6 py-4 text-center">
          <p className="text-white/70 text-xs">
            &copy; 2026 Crowe LLP. For demonstration purposes only.
          </p>
        </footer>
      </body>
    </html>
  );
}
