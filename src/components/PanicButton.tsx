import { useState, useCallback } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface PanicButtonProps {
  onTrigger: () => void;
  disabled?: boolean;
  isTestMode?: boolean;
}

export const PanicButton = ({ onTrigger, disabled, isTestMode }: PanicButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = useCallback(() => {
    if (disabled) return;
    setIsPressed(true);
    onTrigger();
    setTimeout(() => setIsPressed(false), 500);
  }, [disabled, onTrigger]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-primary/10 pulse-ring" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 rounded-full bg-primary/5 pulse-ring" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Main button */}
      <button
        onClick={handlePress}
        disabled={disabled}
        className={`
          panic-button w-48 h-48 flex flex-col items-center justify-center gap-3
          ${isPressed ? 'scale-95' : 'hover:scale-105'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          transition-transform duration-200
        `}
      >
        <Shield className="w-16 h-16 text-primary-foreground" strokeWidth={2.5} />
        <span className="text-xl font-bold text-primary-foreground tracking-wide">
          SOS
        </span>
        {isTestMode && (
          <span className="text-xs text-primary-foreground/80 font-medium">
            TEST MODE
          </span>
        )}
      </button>

      {/* Helper text */}
      <div className="absolute -bottom-8 left-0 right-0 text-center animate-fade-in">
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
          Tap to trigger SOS
        </p>
      </div>
    </div>
  );
};
