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
        {children}
      </body>
    </html>
  );
}
