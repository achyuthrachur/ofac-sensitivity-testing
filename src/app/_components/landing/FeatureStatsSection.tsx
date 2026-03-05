const STATS = [
  { value: 285, suffix: '', label: 'Synthetic SDN Entries', sublabel: 'fully synthetic test dataset' },
  { value: 10, suffix: '', label: 'Degradation Rules', sublabel: 'covering real-world screening failures' },
  { value: 4, suffix: '', label: 'Linguistic Regions', sublabel: 'Arabic, CJK, Cyrillic, Latin' },
  { value: 53, suffix: 'ms', label: 'Avg. Processing Time', sublabel: 'worst-case on full dataset' },
];

export function FeatureStatsSection() {
  return (
    <section className="bg-crowe-indigo-dark py-20 px-6">
      <h2 className="text-3xl font-bold text-white text-center mb-12">By the Numbers</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-xl p-8 text-center bg-white/10">
            <span
              className="stat-number text-5xl font-bold text-crowe-amber block"
              data-value={String(stat.value)}
            >
              {stat.value === 53 ? `~${stat.value}${stat.suffix}` : `${stat.value}${stat.suffix}`}
            </span>
            <p className="text-white font-semibold mt-2 text-sm">{stat.label}</p>
            <p className="text-white/60 text-xs mt-1">{stat.sublabel}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
