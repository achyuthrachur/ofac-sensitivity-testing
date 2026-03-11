import { Document, Global, Refresh2, Setting4 } from 'iconsax-reactjs';
import { StatTiltCard } from '@/components/ui/stat-tilt-card';

const STATS = [
  {
    value: 285,
    prefix: '',
    suffix: '',
    label: 'Synthetic SDN entries',
    sublabel: 'A controlled watchlist for repeatable client demonstrations.',
  },
  {
    value: 10,
    prefix: '',
    suffix: '',
    label: 'Degradation rules',
    sublabel: 'Formatting, transliteration, phonetic drift, and operator noise.',
  },
  {
    value: 4,
    prefix: '',
    suffix: '',
    label: 'Linguistic regions',
    sublabel: 'Arabic, CJK, Cyrillic, and Latin naming structures.',
  },
  {
    value: 53,
    prefix: '~',
    suffix: 'ms',
    label: 'Average processing time',
    sublabel: 'Fast enough to keep the walkthrough conversational.',
  },
] as const;

const STAT_ICONS = [Document, Setting4, Global, Refresh2] as const;

export function FeatureStatsSection() {
  return (
    <section className="section-frame overflow-hidden bg-[#071a35] px-6 py-20 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,168,0,0.18),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(0,117,201,0.18),transparent_28%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/58">
            Proof surface
          </p>
          <h2 className="text-4xl font-semibold">The metrics that anchor the conversation.</h2>
          <p className="text-base leading-7 text-white/72">
            These are the numbers worth foregrounding in the room: dataset scale, failure-pattern
            coverage, language scope, and response speed.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {STATS.map((stat, index) => {
            const StatIcon = STAT_ICONS[index];

            return (
              <StatTiltCard key={stat.label} className="rounded-[1.75rem]">
                <div className="h-full rounded-[1.75rem] border border-white/8 bg-white/8 p-8 text-left backdrop-blur-sm [transform-style:preserve-3d]">
                  <div className="mb-10 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
                      <StatIcon variant="Bold" size={24} color="var(--color-crowe-amber)" />
                    </div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-white/45">
                      0{index + 1}
                    </p>
                  </div>
                  <span className="stat-number block text-5xl font-semibold text-crowe-amber">
                    {stat.prefix ? <span className="stat-prefix">{stat.prefix}</span> : null}
                    <span className="stat-value" data-value={String(stat.value)}>
                      {stat.value}
                    </span>
                    {stat.suffix ? <span className="stat-suffix">{stat.suffix}</span> : null}
                  </span>
                  <p className="mt-4 text-xl font-semibold text-white">{stat.label}</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-white/68">{stat.sublabel}</p>
                </div>
              </StatTiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
