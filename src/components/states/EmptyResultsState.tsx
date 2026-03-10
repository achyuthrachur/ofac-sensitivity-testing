import { Setting4 } from 'iconsax-reactjs';

export function EmptyResultsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
      <Setting4 variant="Linear" size={40} color="currentColor" className="text-white/30" />
      <p className="text-white/60 text-lg font-medium">No results yet</p>
      <p className="text-white/40 text-sm max-w-xs">
        Configure entity types, regions, and degradation rules in the panel on the left, then click
        Run Test to see results here.
      </p>
    </div>
  );
}
