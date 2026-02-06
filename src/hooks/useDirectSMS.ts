import { useCallback } from 'react';
import { toast } from 'sonner';
import SosSms from '@/plugins/SosSmsPlugin';

export const useDirectSMS = () => {
    const sendSMS = useCallback(async (phoneNumber: string | string[], message: string) => {
        const phoneNumbers = Array.isArray(phoneNumber) ? phoneNumber : [phoneNumber];

        try {
            console.log('🚨 Sending SMS via SosSms plugin to', phoneNumbers.length, 'contacts');
            await SosSms.sendEmergencySms({
                phoneNumbers: phoneNumbers.map(n => n.replace(/\s/g, '')),
                message
            });
            toast.success('Emergency SMS Batch Sent!');
        } catch (err: any) {
            console.error('❌ SMS plugin error:', err);
            toast.error(`SMS Error: ${err.message || 'Plugin failure'}`);
            throw err;
        }
    }, []);

    return { sendSMS };
};
