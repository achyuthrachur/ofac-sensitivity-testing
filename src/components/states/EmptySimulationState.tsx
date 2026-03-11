import { Global } from 'iconsax-reactjs';
import { EmptyStatePanel } from './EmptyStatePanel';

export function EmptySimulationState() {
  return (
    <EmptyStatePanel
      eyebrow="Simulation outlook"
      title="Run a scenario to model catch-rate decay."
      description="Select a velocity preset and run the simulation to see how screening performance changes over time and where recalibration may be needed."
      icon={<Global variant="Linear" size={28} color="currentColor" />}
    />
  );
}
