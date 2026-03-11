import { ClipboardTick } from 'iconsax-reactjs';
import { EmptyStatePanel } from './EmptyStatePanel';

export function EmptyScreeningState() {
  return (
    <EmptyStatePanel
      eyebrow="Screening queue"
      title="Load a name list to start batch screening."
      description="Upload a CSV or Excel file, or paste names directly into the screening workspace, to begin matching against the synthetic SDN dataset."
      icon={<ClipboardTick variant="Linear" size={28} color="currentColor" />}
    />
  );
}
