import { ClipboardCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export function EmptyScreeningState() {
  return (
    <div className="flex items-center justify-center py-10 px-6">
      <EmptyState
        icons={[ClipboardCheck]}
        title="No names loaded"
        description="Upload a CSV or Excel file, or paste names directly in the input panel, to begin screening against the SDN dataset."
      />
    </div>
  );
}
