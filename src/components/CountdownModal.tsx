import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CountdownModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onComplete: () => void;
  triggerType: 'accident' | 'voice' | 'manual';
}

export const CountdownModal = ({ 
  isOpen, 
  onCancel, 
  onComplete,
  triggerType 
}: CountdownModalProps) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      return;
    }

    if (countdown === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isOpen, countdown, onComplete]);

  if (!isOpen) return null;

  const triggerMessages = {
    accident: 'Accident detected',
    voice: 'Voice trigger detected',
    manual: 'Emergency triggered'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm safe-area-inset">
      <div className="flex flex-col items-center gap-8 p-8">
        {/* Alert icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {triggerMessages[triggerType]}
          </h2>
          <p className="text-muted-foreground">
            Emergency alert will be sent in
          </p>
        </div>

        {/* Countdown */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-secondary"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-primary"
              strokeDasharray="283"
              strokeDashoffset={283 - (countdown / 10) * 283}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-foreground">{countdown}</span>
          </div>
        </div>

        {/* Cancel button */}
        <Button
          onClick={onCancel}
          variant="outline"
          size="lg"
          className="w-full max-w-xs h-14 text-lg font-semibold border-2"
        >
          <X className="w-5 h-5 mr-2" />
          I'm Safe - Cancel
        </Button>

        <p className="text-sm text-muted-foreground text-center max-w-xs">
          If you don't cancel, an emergency alert with your location will be sent to your contacts.
        </p>
      </div>
    </div>
  );
};
