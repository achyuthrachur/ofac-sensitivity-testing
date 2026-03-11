import { SlidersHorizontal } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export function EmptyResultsState() {
  return (
    <div className="flex items-center justify-center py-10 px-6">
      <EmptyState
        icons={[SlidersHorizontal]}
        title="No results yet"
        description="Configure entity types, regions, and degradation rules in the panel on the left, then click Run Test to see results here."
      />
    </div>
  );
}
