
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export const useVoiceFeedback = () => {
    const speak = async (text: string) => {
        try {
            console.log('AI Voice triggered:', text);
            await TextToSpeech.speak({
                text,
                lang: 'en-US',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient',
            });
        } catch (error) {
            console.error('TTS Error:', error);
        }
    };

    const stopSpeaking = async () => {
        try {
            await TextToSpeech.stop();
        } catch (error) {
            console.error('TTS Stop Error:', error);
        }
    };

    return { speak, stopSpeaking };
};
