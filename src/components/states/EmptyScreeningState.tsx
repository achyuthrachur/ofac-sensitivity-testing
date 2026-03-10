import { ClipboardTick } from 'iconsax-reactjs';

export function EmptyScreeningState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
      <ClipboardTick variant="Linear" size={40} color="currentColor" className="text-white/30" />
      <p className="text-white/60 text-lg font-medium">No names loaded</p>
      <p className="text-white/40 text-sm max-w-xs">
        Upload a CSV or Excel file, or paste names directly in the input panel, to begin screening
        against the SDN dataset.
      </p>
    </div>
  );
}
