import { Setting4, Refresh, DocumentDownload } from 'iconsax-reactjs';

const STEPS = [
  {
    number: 1,
    title: 'Configure',
    copy: 'Set entity count, linguistic regions, and degradation rules. Each rule simulates a real-world data-entry error — typos, transliterations, dropped characters — that screening systems encounter in practice.',
  },
  {
    number: 2,
    title: 'Run',
    copy: 'The engine applies your selected rules to 285 synthetic SDN entries and scores each name pair using Jaro-Winkler similarity. Results are returned in under 60ms.',
  },
  {
    number: 3,
    title: 'Export',
    copy: 'Download a CSV of all results showing original name, degraded variant, similarity score, and match/no-match status. The catch rate tells you what percentage of degraded names your screening threshold would have flagged.',
  },
];

const STEP_ICONS = [Setting4, Refresh, DocumentDownload] as const;

export function HowItWorksSection() {
  return (
    <section className="bg-page py-20 px-6">
      <h2 className="text-3xl font-bold text-crowe-indigo-dark text-center mb-12">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {STEPS.map((step, index) => {
          const StepIcon = STEP_ICONS[index];
          return (
            <div
              key={step.number}
              className="how-it-works-card bg-white rounded-xl p-8"
              style={{ boxShadow: '0 4px 8px rgba(1,30,65,0.06), 0 1px 3px rgba(1,30,65,0.04)' }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-crowe-amber/10 mb-4">
                <StepIcon variant="TwoTone" size={28} color="var(--crowe-indigo-dark)" />
              </div>
              <h3 className="text-xl font-bold text-crowe-indigo-dark mb-3">{step.title}</h3>
              <p className="text-crowe-tint-700 text-base leading-relaxed">{step.copy}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
