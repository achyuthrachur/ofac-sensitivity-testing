import { Global } from 'iconsax-reactjs';

export function EmptySimulationState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
      <Global variant="Linear" size={40} color="currentColor" className="text-white/30" />
      <p className="text-white/60 text-lg font-medium">No simulation run yet</p>
      <p className="text-white/40 text-sm max-w-xs">
        Select a velocity preset (Baseline, Elevated, or Surge) and click Run Simulation to model
        catch rate evolution over time.
      </p>
    </div>
  );
}
