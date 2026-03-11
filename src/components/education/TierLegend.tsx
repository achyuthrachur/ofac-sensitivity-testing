const TIERS = [
  { label: 'EXACT',  badge: 'bg-red-900/60 text-red-200 border-red-700/50',         caption: 'Immediate block required' },
  { label: 'HIGH',   badge: 'bg-orange-900/60 text-orange-200 border-orange-700/50', caption: 'Enhanced due diligence' },
  { label: 'MEDIUM', badge: 'bg-yellow-900/60 text-yellow-200 border-yellow-700/50', caption: 'Manual review required' },
  { label: 'LOW',    badge: 'bg-blue-900/60 text-blue-200 border-blue-700/50',       caption: 'Monitor and document' },
  { label: 'CLEAR',  badge: 'bg-green-900/60 text-green-200 border-green-700/50',    caption: 'No action required' },
] as const;

export function TierLegend() {
  return (
    <div className="flex flex-wrap gap-3 py-3 px-4 mb-3 bg-crowe-indigo-dark/20 rounded-lg border border-crowe-indigo-dark/30">
      {TIERS.map(({ label, badge, caption }) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${badge}`}>
            {label}
          </span>
          <span className="text-[10px] text-muted-foreground text-center">{caption}</span>
        </div>
      ))}
    </div>
  );
}
