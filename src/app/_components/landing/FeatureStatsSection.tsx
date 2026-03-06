import { Document, Setting4, Global, Refresh2 } from 'iconsax-reactjs';

const STATS = [
  { value: 285, prefix: '',  suffix: '',   label: 'Synthetic SDN Entries',  sublabel: 'fully synthetic test dataset' },
  { value: 10,  prefix: '',  suffix: '',   label: 'Degradation Rules',      sublabel: 'covering real-world screening failures' },
  { value: 4,   prefix: '',  suffix: '',   label: 'Linguistic Regions',     sublabel: 'Arabic, CJK, Cyrillic, Latin' },
  { value: 53,  prefix: '~', suffix: 'ms', label: 'Avg. Processing Time',   sublabel: 'worst-case on full dataset' },
];

const STAT_ICONS = [Document, Setting4, Global, Refresh2] as const;

export function FeatureStatsSection() {
  return (
    <section className="bg-crowe-indigo-dark py-20 px-6">
      <h2 className="text-3xl font-bold text-white text-center mb-12">By the Numbers</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {STATS.map((stat, index) => {
          const StatIcon = STAT_ICONS[index];
          return (
            <div key={stat.label} className="rounded-xl p-8 text-center bg-white/10">
              <StatIcon variant="Bold" size={32} color="var(--crowe-amber-core)" />
              <span className="stat-number text-5xl font-bold text-crowe-amber block mt-2">
                {stat.prefix && <span className="stat-prefix">{stat.prefix}</span>}
                <span className="stat-value" data-value={String(stat.value)}>
                  {stat.value}
                </span>
                {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
              </span>
              <p className="text-white font-semibold mt-2 text-sm">{stat.label}</p>
              <p className="text-white/60 text-xs mt-1">{stat.sublabel}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
