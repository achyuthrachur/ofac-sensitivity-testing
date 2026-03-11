const TIERS = [
  { label: 'EXACT',  badge: 'bg-crowe-coral/15 text-crowe-coral border-crowe-coral/35',           caption: 'Immediate block required' },
  { label: 'HIGH',   badge: 'bg-crowe-amber-bright/20 text-crowe-indigo-dark border-crowe-amber/35', caption: 'Enhanced due diligence' },
  { label: 'MEDIUM', badge: 'bg-crowe-amber/15 text-crowe-indigo-dark border-crowe-amber/35',     caption: 'Manual review required' },
  { label: 'LOW',    badge: 'bg-crowe-indigo-bright/12 text-crowe-indigo-core border-crowe-indigo-bright/30', caption: 'Monitor and document' },
  { label: 'CLEAR',  badge: 'bg-crowe-teal/15 text-crowe-teal border-crowe-teal/35',               caption: 'No action required' },
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
