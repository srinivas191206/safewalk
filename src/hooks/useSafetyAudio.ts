
import { useState, useCallback } from 'react';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { toast } from 'sonner';

export const useSafetyAudio = () => {
    const [isRecording, setIsRecording] = useState(false);

    const startEmergencyRecording = useCallback(async () => {
        try {
            const permission = await VoiceRecorder.requestAudioRecordingPermission();
            if (!permission.value) {
                console.error('Audio recording permission denied');
                return;
            }

            const { value: canRecord } = await VoiceRecorder.canDeviceVoiceRecord();
            if (!canRecord) {
                console.error('Device cannot record voice');
                return;
            }

            await VoiceRecorder.startRecording();
            setIsRecording(true);
            console.log('Emergency recording started...');

            // Automatically stop after 10 seconds
            setTimeout(async () => {
                await stopEmergencyRecording();
            }, 10000);

        } catch (error) {
            console.error('Error starting recording:', error);
            setIsRecording(false);
        }
    }, []);

    const stopEmergencyRecording = useCallback(async () => {
        try {
            const { value: recordingData } = await VoiceRecorder.stopRecording();
            setIsRecording(false);
            console.log('Emergency recording stopped.');

            // In a full implementation, we would upload recordingData.recordDataBase64 to Supabase Storage
            // For MVP, we'll log its existence
            if (recordingData) {
                console.log('Audio recorded successfully (Base64 length):', recordingData.recordDataBase64.length);
                toast.success('Evidence audio captured successfully');
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            setIsRecording(false);
        }
    }, []);

    return {
        isRecording,
        startEmergencyRecording,
        stopEmergencyRecording
    };
};
