import { Globe } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export function EmptySimulationState() {
  return (
    <div className="flex items-center justify-center py-10 px-6">
      <EmptyState
        icons={[Globe]}
        title="No simulation run yet"
        description="Select a velocity preset (Baseline, Elevated, or Surge) and click Run Simulation to model catch rate evolution over time."
      />
    </div>
  );
}
