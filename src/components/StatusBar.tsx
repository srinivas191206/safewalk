import { Wifi, WifiOff, Shield, Mic, MapPin } from 'lucide-react';

interface StatusBarProps {
  isOnline: boolean;
  isListening: boolean;
  locationEnabled: boolean;
  guardianActive: boolean;
}

export const StatusBar = ({ 
  isOnline, 
  isListening, 
  locationEnabled,
  guardianActive 
}: StatusBarProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 glass-card rounded-2xl">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${guardianActive ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
        <span className="text-sm font-medium">
          {guardianActive ? 'Guardian Active' : 'Guardian Off'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Network status */}
        <div className={`p-1.5 rounded-lg ${isOnline ? 'bg-accent/20' : 'bg-primary/20'}`}>
          {isOnline ? (
            <Wifi className="w-4 h-4 text-accent" />
          ) : (
            <WifiOff className="w-4 h-4 text-primary" />
          )}
        </div>

        {/* Voice listening */}
        <div className={`p-1.5 rounded-lg ${isListening ? 'bg-accent/20' : 'bg-secondary'}`}>
          <Mic className={`w-4 h-4 ${isListening ? 'text-accent' : 'text-muted-foreground'}`} />
        </div>

        {/* Location */}
        <div className={`p-1.5 rounded-lg ${locationEnabled ? 'bg-accent/20' : 'bg-secondary'}`}>
          <MapPin className={`w-4 h-4 ${locationEnabled ? 'text-accent' : 'text-muted-foreground'}`} />
        </div>
      </div>
    </div>
  );
};
