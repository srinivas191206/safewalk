
import { useEffect, useState, useCallback } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { toast } from 'sonner';

interface VoiceTriggerOptions {
    onTrigger: () => void;
    isActive: boolean;
}

export const useVoiceTrigger = ({ onTrigger, isActive }: VoiceTriggerOptions) => {
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        let listening = false;

        const startRecognition = async () => {
            try {
                // Check permissions
                const status = await SpeechRecognition.checkPermissions();
                // Use type assertion as keys vary by platform/version
                const permission = (status as any).speechRecognition || (status as any).public;

                if (permission !== 'granted') {
                    await SpeechRecognition.requestPermissions();
                }

                // Start listening
                // Note: On Android/iOS this might be limited in duration or require "partialResults"
                // Continuous listening in background is hard on standard plugins, usually requires a foreground service
                // For MVP, we aim for foreground/screen-on usage mainly.

                await SpeechRecognition.start({
                    language: "en-US",
                    maxResults: 2,
                    prompt: "Say 'Help' or 'Emergency'",
                    partialResults: true,
                    popup: false,
                });

                listening = true;
                setIsListening(true);

                SpeechRecognition.addListener('partialResults', (data: any) => {
                    const matches = data.matches || [];
                    checkKeywords(matches);
                });

            } catch (e) {
                console.error('Speech recognition error:', e);
                // toast.error('Voice control unavailable');
            }
        };

        const checkKeywords = (matches: string[]) => {
            const keywords = ['help', 'emergency', 'save me', 'danger', 'help me', 'i am in danger', 'sos'];
            const lowerMatches = matches.map(m => m.toLowerCase());

            const found = keywords.some(keyword =>
                lowerMatches.some(match => match.includes(keyword))
            );

            if (found) {
                console.log('Voice Keyword Detected!');
                stopRecognition();
                onTrigger();
            }
        };

        const stopRecognition = async () => {
            try {
                if (listening) {
                    await SpeechRecognition.stop();
                    listening = false;
                    setIsListening(false);
                }
            } catch (e) {
                console.error('Stop speech error', e);
            }
        };

        if (isActive) {
            startRecognition();
        } else {
            stopRecognition();
        }

        return () => {
            stopRecognition();
            SpeechRecognition.removeAllListeners();
        };
    }, [isActive, onTrigger]);

    return { isListening };
};
