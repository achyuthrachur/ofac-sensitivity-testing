// Aesthetic direction: Swiss editorial executive.
import Link from 'next/link';
import { ArrowRight, Chart, ClipboardTick, Setting4 } from 'iconsax-reactjs';
import { ClientHeroHeadline } from './ClientHeroHeadline';

const SIGNALS = [
  {
    label: 'Stress test',
    copy: 'Degrade synthetic watchlist names across 10 failure patterns and expose coverage gaps fast.',
    Icon: Setting4,
  },
  {
    label: 'Screening mode',
    copy: 'Run client-style name lists through the scoring engine and review tiered analyst output.',
    Icon: ClipboardTick,
  },
  {
    label: 'Simulation',
    copy: 'Model catch-rate erosion under sustained evasion pressure with three velocity presets.',
    Icon: Chart,
  },
] as const;

const PROOF_POINTS = ['285 synthetic SDN entries', '10 degradation rules', 'Three decision surfaces'];

export function HeroSection() {
  return (
    <section className="section-frame overflow-hidden bg-[#011E41] px-6 py-20 text-white lg:px-10 lg:py-24">
      <div className="executive-grid absolute inset-0 opacity-[0.08]" />
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(245,168,0,0.28),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-7xl items-end gap-12 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <div className="pb-4">
          <ClientHeroHeadline />
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/tool"
              className="cta-button inline-flex items-center justify-center gap-2 rounded-full bg-crowe-amber px-7 py-4 text-sm font-semibold text-crowe-indigo-dark transition-all duration-200 hover:-translate-y-0.5 hover:bg-crowe-amber-dark"
            >
              Configure your test
              <ArrowRight variant="Bold" size={18} color="currentColor" />
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/6 px-7 py-4 text-sm font-semibold text-white/84 transition-colors hover:border-white/30 hover:text-white"
            >
              Read the methodology
              <ArrowRight variant="Linear" size={16} color="currentColor" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
            {PROOF_POINTS.map((point) => (
              <span
                key={point}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="executive-panel relative rounded-[2rem] border border-white/12 p-6 text-[#011E41]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6b7f97]">
                Demo arc
              </p>
              <h2 className="mt-2 text-2xl font-semibold">One client conversation, three proof points.</h2>
            </div>
            <div className="rounded-full bg-[#011E41] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
              Live
            </div>
          </div>
          <div className="space-y-4">
            {SIGNALS.map((signal, index) => {
              const SignalIcon = signal.Icon;
              return (
                <div
                  key={signal.label}
                  className="rounded-[1.4rem] border border-[#dbe3ec] bg-white/90 p-5 shadow-[0_10px_28px_rgba(1,30,65,0.06)]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#011E41] text-white">
                      <SignalIcon variant="Linear" size={20} color="currentColor" />
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#7f91a7]">
                        0{index + 1}
                      </p>
                      <p className="text-lg font-semibold capitalize">{signal.label}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-[#506579]">{signal.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
