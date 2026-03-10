import { InfoCircle } from 'iconsax-reactjs';

interface HelpFabProps {
  onClick: () => void;
}

export function HelpFab({ onClick }: HelpFabProps) {
  return (
    <button
      type="button"
      aria-label="Open help"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full
                 bg-crowe-indigo-dark border border-white/20
                 hover:border-crowe-amber hover:text-crowe-amber
                 text-white transition-colors
                 flex items-center justify-center"
    >
      <InfoCircle variant="Linear" size={20} color="currentColor" />
    </button>
  );
}
