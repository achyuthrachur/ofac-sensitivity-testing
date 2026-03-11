const TIERS = [
  {
    label: 'EXACT',
    badge: 'bg-red-50 text-red-700 border-red-200',
    caption: 'Immediate block required',
  },
  {
    label: 'HIGH',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    caption: 'Enhanced due diligence',
  },
  {
    label: 'MEDIUM',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    caption: 'Manual review required',
  },
  {
    label: 'LOW',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    caption: 'Monitor and document',
  },
  {
    label: 'CLEAR',
    badge: 'bg-green-50 text-green-700 border-green-200',
    caption: 'No action required',
  },
] as const;

export function TierLegend() {
  return (
    <div className="flex flex-wrap gap-3 py-3 px-4 mb-3 bg-muted/50 rounded-lg border border-border">
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
