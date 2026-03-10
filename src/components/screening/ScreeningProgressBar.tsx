import { Progress } from '@/components/ui/progress';

interface ScreeningProgressBarProps {
  progress: number;
  nameCount: number;
  processedCount: number;
}

export function ScreeningProgressBar({ progress, nameCount, processedCount }: ScreeningProgressBarProps) {
  return (
    <div className="px-6 py-10 flex flex-col items-center gap-4">
      <p className="text-white/70 text-sm">
        Screening {processedCount} of {nameCount} names…
      </p>
      <Progress value={progress} className="w-full max-w-md" />
    </div>
  );
}
