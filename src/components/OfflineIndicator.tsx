import { WifiOff, Clock, Send } from 'lucide-react';

interface OfflineIndicatorProps {
  pendingCount: number;
}

export const OfflineIndicator = ({ pendingCount }: OfflineIndicatorProps) => {
  if (pendingCount === 0) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40">
      <div className="bg-warning/20 border border-warning/40 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-warning/30 flex items-center justify-center flex-shrink-0">
          <WifiOff className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            No network connection
          </p>
          <p className="text-xs text-muted-foreground">
            {pendingCount} alert{pendingCount > 1 ? 's' : ''} queued. Will send automatically when online.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-warning animate-pulse" />
        </div>
      </div>
    </div>
  );
};
