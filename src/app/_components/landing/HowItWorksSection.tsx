import { Chart, ClipboardTick, Setting4 } from 'iconsax-reactjs';

const TOOLS = [
  {
    number: '01',
    title: 'Sensitivity Test',
    copy: 'Stress the controls first. Deliberately degrade synthetic SDN entries to expose the exact patterns your current logic misses.',
    outcome: 'Clarify the baseline catch-rate story before the client asks.',
    Icon: Setting4,
  },
  {
    number: '02',
    title: 'Screening Mode',
    copy: 'Move from synthetic degradation into an analyst-style queue with thresholds, tier summaries, and list-detail review.',
    outcome: 'Translate the baseline into operational alert handling.',
    Icon: ClipboardTick,
  },
  {
    number: '03',
    title: 'Simulation',
    copy: 'Project how performance degrades as evasion tactics accelerate, then show where recalibration becomes necessary.',
    outcome: 'Turn a technical demo into a control governance discussion.',
    Icon: Chart,
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="section-frame px-6 py-20 lg:px-10">
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#6a7f97]">
            Workflow story
          </p>
          <h2 className="text-4xl font-semibold text-crowe-indigo-dark">
            Three tools, one executive narrative.
          </h2>
          <p className="text-base leading-7 text-crowe-tint-700">
            Each module builds on the last: diagnose control sensitivity, demonstrate screening
            operations, then explain what happens as adversaries adapt faster than tuning cycles.
          </p>
          <div className="rounded-[1.5rem] border border-[#dbe3ec] bg-white/72 p-5 text-sm leading-6 text-[#506579] executive-panel">
            A strong demo should move from proof of detection to proof of operational judgment.
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-[1.45rem] top-12 hidden h-[calc(100%-6rem)] w-px bg-[linear-gradient(180deg,rgba(1,30,65,0.14),rgba(245,168,0,0.25),rgba(1,30,65,0.14))] lg:block" />
          <div className="space-y-6">
            {TOOLS.map((tool, index) => (
              <article
                key={tool.number}
                className="how-it-works-card executive-panel relative overflow-hidden rounded-[1.75rem] border border-white/70 p-8"
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(245,168,0,0.16),transparent_72%)]" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#011E41] text-white shadow-[0_10px_24px_rgba(1,30,65,0.18)]">
                      <tool.Icon variant="Linear" size={20} color="currentColor" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7f91a7]">
                        Step {tool.number}
                      </p>
                      <h3 className="text-2xl font-semibold text-crowe-indigo-dark">{tool.title}</h3>
                      <p className="max-w-2xl text-sm leading-7 text-crowe-tint-700">{tool.copy}</p>
                    </div>
                  </div>
                  <div className="max-w-xs rounded-[1.35rem] border border-[#dbe3ec] bg-[#f6f8fb] p-4 text-sm leading-6 text-[#486175]">
                    <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#7f91a7]">
                      Outcome
                    </p>
                    {tool.outcome}
                  </div>
                </div>
                {index < TOOLS.length - 1 ? (
                  <div className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-crowe-amber">
                    Continue the workflow
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
