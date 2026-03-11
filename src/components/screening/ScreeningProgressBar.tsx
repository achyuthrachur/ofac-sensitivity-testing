import { Progress } from '@/components/ui/progress';

interface ScreeningProgressBarProps {
  progress: number;
  nameCount: number;
  processedCount: number;
}

export function ScreeningProgressBar({ progress, nameCount, processedCount }: ScreeningProgressBarProps) {
  const isIndeterminate = progress === 0 && processedCount === 0;
  return (
    <div className="px-6 py-10 flex flex-col items-center gap-4">
      <p className="text-muted-foreground text-sm">
        {isIndeterminate
          ? `Screening ${nameCount.toLocaleString()} names…`
          : `Screening ${processedCount} of ${nameCount} names…`}
      </p>
      {isIndeterminate ? (
        <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-crowe-amber rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
        </div>
      ) : (
        <Progress value={progress} className="w-full max-w-md" />
      )}
    </div>
  );
}
