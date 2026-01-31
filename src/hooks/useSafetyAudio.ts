import { useState, useCallback } from 'react';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const useSafetyAudio = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [currentAlertId, setCurrentAlertId] = useState<string | null>(null);

    const startEmergencyRecording = useCallback(async (alertId: string) => {
        try {
            setCurrentAlertId(alertId);
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
            console.log('Emergency recording started for alert:', alertId);

            // Automatically stop after 10 seconds
            setTimeout(async () => {
                await stopEmergencyRecording(alertId);
            }, 10000);

        } catch (error) {
            console.error('Error starting recording:', error);
            setIsRecording(false);
        }
    }, []);

    const stopEmergencyRecording = useCallback(async (alertId?: string) => {
        const targetAlertId = alertId || currentAlertId;
        if (!targetAlertId) return;

        try {
            const { value: recordingData } = await VoiceRecorder.stopRecording();
            setIsRecording(false);
            console.log('Emergency recording stopped.');

            if (recordingData) {
                // Convert Base64 to Blob
                const byteCharacters = atob(recordingData.recordDataBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'audio/wav' });

                // Upload to Supabase Storage
                const fileName = `${targetAlertId}.wav`;
                const { data, error: uploadError } = await supabase.storage
                    .from('safety-audio')
                    .upload(fileName, blob, {
                        contentType: 'audio/wav',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Upload Error:', uploadError);
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('safety-audio')
                        .getPublicUrl(fileName);

                    // Update Alert record with Audio URL
                    await supabase
                        .from('alerts')
                        .update({ audio_url: publicUrl })
                        .eq('id', targetAlertId);

                    console.log('Audio evidence saved:', publicUrl);
                    toast.success('Audio evidence captured and saved');
                }
            }
        } catch (error) {
            console.error('Error stopping/saving recording:', error);
            setIsRecording(false);
        }
    }, [currentAlertId]);

    return {
        isRecording,
        startEmergencyRecording,
        stopEmergencyRecording
    };
};
