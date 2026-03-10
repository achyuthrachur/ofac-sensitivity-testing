import type { ReactNode } from 'react';

export function ViewportGate({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Narrow viewport — gate message */}
      <div className="block lg:hidden bg-crowe-indigo-dark min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-white font-bold text-2xl mb-8">Crowe</p>
        <h2 className="text-white text-xl font-semibold mb-3">
          This tool is designed for desktop screens
        </h2>
        <p className="text-white/70 text-sm max-w-sm">
          Please open this URL on a device with a screen width of at least 1,024 px to access the
          OFAC Sensitivity Testing Tool.
        </p>
      </div>

      {/* Desktop — render children */}
      <div className="hidden lg:block">{children}</div>
    </>
  );
}
