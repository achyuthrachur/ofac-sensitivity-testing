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
      className="fixed bottom-6 right-6 z-50 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-white/16 bg-[linear-gradient(180deg,#011E41,#0A2B57)] text-white shadow-[0_18px_36px_rgba(1,30,65,0.22)] transition-colors hover:border-crowe-amber hover:text-crowe-amber"
    >
      <InfoCircle variant="Linear" size={20} color="currentColor" />
    </button>
  );
}
