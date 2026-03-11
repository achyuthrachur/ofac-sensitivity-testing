import { Setting4 } from 'iconsax-reactjs';
import { EmptyStatePanel } from './EmptyStatePanel';

export function EmptyResultsState() {
  return (
    <EmptyStatePanel
      eyebrow="Sensitivity output"
      title="Run a test to populate the results surface."
      description="Configure entity types, regions, and degradation rules in the panel on the left, then run the sensitivity test to review degraded names, scores, and catch-rate performance."
      icon={<Setting4 variant="Linear" size={28} color="currentColor" />}
    />
  );
}
