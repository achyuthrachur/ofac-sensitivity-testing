import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-crowe-indigo-dark min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-3 flex items-center">
        <Link href="/" className="text-white font-bold text-lg tracking-tight">
          Crowe
        </Link>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-white text-4xl font-bold mb-4">404 — Page not found</h1>
        <p className="text-white/60 text-base mb-10 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="px-5 py-2 rounded-md border border-white text-white text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/tool"
            className="px-5 py-2 rounded-md bg-crowe-amber text-crowe-indigo-dark text-sm font-semibold hover:bg-crowe-amber-dark transition-colors"
          >
            Open the Tool
          </Link>
        </div>
      </div>
    </div>
  );
}
