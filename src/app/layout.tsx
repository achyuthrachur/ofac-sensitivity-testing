import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/nav/SiteNav";
import { ViewportGate } from "@/components/nav/ViewportGate";
import { Toaster } from "@/components/ui/sonner";
import { HelpFabWithDrawer } from "@/components/help/HelpFabWithDrawer";

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
        <SiteNav />
        <ViewportGate>
          {children}
        </ViewportGate>
        <Toaster />
        <HelpFabWithDrawer />
      </body>
    </html>
  );
}
