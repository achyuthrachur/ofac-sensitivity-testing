import { Global } from 'iconsax-reactjs';

export function EmptySimulationState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
      <Global variant="Linear" size={40} color="currentColor" className="text-muted-foreground/40" />
      <p className="text-muted-foreground text-lg font-medium">No simulation run yet</p>
      <p className="text-muted-foreground/60 text-sm max-w-xs">
        Select a velocity preset (Baseline, Elevated, or Surge) and click Run Simulation to model catch rate evolution over time.
      </p>
    </div>
  );
}
