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

export function HowItWorksSection() {
  return (
    <section className="bg-page py-20 px-6">
      <h2 className="text-3xl font-bold text-crowe-indigo-dark text-center mb-12">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="bg-white rounded-xl p-8"
            style={{ boxShadow: '0 4px 8px rgba(1,30,65,0.06), 0 1px 3px rgba(1,30,65,0.04)' }}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-crowe-amber text-crowe-indigo-dark font-bold text-lg mb-4">
              {step.number}
            </div>
            <h3 className="text-xl font-bold text-crowe-indigo-dark mb-3">{step.title}</h3>
            <p className="text-crowe-tint-700 text-base leading-relaxed">{step.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
