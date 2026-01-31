
import { useEffect, useState, useCallback } from 'react';
import { Motion } from '@capacitor/motion';
import { toast } from 'sonner';

interface CrashDetectionOptions {
    onCrashDetected: () => void;
    isActive: boolean;
    threshold?: number; // G-force threshold, default 3.0
}

export const useCrashDetection = ({ onCrashDetected, isActive, threshold = 3.5 }: CrashDetectionOptions) => {
    const [isListening, setIsListening] = useState(false);

    // Simple logic: If magnitude of acceleration > threshold, trigger crash
    // In a real app, this would use more complex heuristics (speed drop + impact)

    useEffect(() => {
        let listener: any;

        const startListening = async () => {
            // Request permission if needed (iOS)
            // Capacitor Motion handles permissions automatically on call mostly

            try {
                listener = await Motion.addListener('accel', event => {
                    const { x, y, z } = event.accelerationIncludingGravity;

                    // Calculate magnitude of acceleration vector
                    const magnitude = Math.sqrt(x * x + y * y + z * z) / 9.81; // Convert to Gs (approx)

                    if (magnitude > threshold) {
                        // Debounce or verify? 
                        // For MVP demo, immediate trigger
                        console.log('Crash detected! Magnitude:', magnitude);
                        onCrashDetected();
                    }
                });
                setIsListening(true);
            } catch (e) {
                console.error('Motion sensor error:', e);
                // Only toast on error if active attempted
                if (isActive) toast.error('Motion sensors unavailable');
            }
        };

        if (isActive) {
            startListening();
        } else {
            if (listener) {
                listener.remove();
            }
            setIsListening(false);
        }

        return () => {
            if (listener) {
                listener.remove();
            }
        };
    }, [isActive, onCrashDetected, threshold]);

    return { isListening };
};
