import { Setting4, ClipboardTick, Chart } from 'iconsax-reactjs';

const TOOLS = [
  {
    number: 1,
    title: 'Sensitivity Test',
    copy: 'Run a synthetic stress test on your screening engine. Apply 10 real-world name-degradation rules to 285 SDN entries and see your catch rate.',
    Icon: Setting4,
  },
  {
    number: 2,
    title: 'Screening Mode',
    copy: 'Upload your actual name list (synthetic demo data provided). The engine scores each name across three algorithms and assigns a risk tier.',
    Icon: ClipboardTick,
  },
  {
    number: 3,
    title: 'Simulation',
    copy: 'Project how catch rates decay over time as sanctioned entities evolve their evasion tactics. Three velocity presets: Baseline, Elevated, Surge.',
    Icon: Chart,
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-page py-20 px-6">
      <h2 className="text-3xl font-bold text-crowe-indigo-dark text-center mb-4">
        Three Tools, One Workflow
      </h2>
      <p className="text-center text-crowe-tint-700 mb-12 max-w-xl mx-auto">
        Each tool builds on the last — stress test your engine, screen real names, then project performance over time.
      </p>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0 relative">
          {TOOLS.map((tool, index) => (
            <div key={tool.number} className="relative flex flex-col items-start">
              {/* Connector arrow between cards */}
              {index < TOOLS.length - 1 && (
                <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 items-center justify-center w-8 h-8 rounded-full bg-crowe-amber/10 border border-crowe-amber/20">
                  <span className="text-crowe-amber text-sm font-bold">→</span>
                </div>
              )}
              <div
                className="how-it-works-card bg-white rounded-xl p-8 w-full h-full mx-2"
                style={{ boxShadow: '0 4px 8px rgba(1,30,65,0.06), 0 1px 3px rgba(1,30,65,0.04)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-crowe-amber/10">
                    <tool.Icon variant="TwoTone" size={28} color="var(--crowe-indigo-dark)" />
                  </div>
                  <span className="text-xs font-bold text-crowe-amber/70 uppercase tracking-widest">
                    Step {tool.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-crowe-indigo-dark mb-3">{tool.title}</h3>
                <p className="text-crowe-tint-700 text-base leading-relaxed">{tool.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
