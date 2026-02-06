import { registerPlugin } from '@capacitor/core';

export interface SosSmsPlugin {
    sendEmergencySms(options: { phoneNumbers: string[]; message: string }): Promise<void>;
    checkPermissions(): Promise<any>;
    requestPermissions(): Promise<any>;
}

const SosSms = registerPlugin<SosSmsPlugin>('SosSms');

export default SosSms;
