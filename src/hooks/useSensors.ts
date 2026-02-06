import { useState, useEffect } from 'react';
import { Device, BatteryInfo } from '@capacitor/device';
import { Network, ConnectionStatus } from '@capacitor/network';
import { BarometerPlugin } from '@kevinmarques/capacitor-barometer';

export interface SensorData {
    batteryLevel: number | null;
    isCharging: boolean;
    networkStatus: ConnectionStatus | null;
    pressure: number | null;
    altitude: number | null; // Approximate, relative
}

export const useSensors = () => {
    const [sensors, setSensors] = useState<SensorData>({
        batteryLevel: null,
        isCharging: false,
        networkStatus: null,
        pressure: null,
        altitude: null,
    });

    useEffect(() => {
        // Battery
        const initBattery = async () => {
            try {
                const info = await Device.getBatteryInfo();
                setSensors(prev => ({
                    ...prev,
                    batteryLevel: info.batteryLevel !== undefined ? Math.round(info.batteryLevel * 100) : null,
                    isCharging: info.isCharging || false
                }));
            } catch (e) {
                console.error('Battery info error', e);
            }
        };

        // Network
        const initNetwork = async () => {
            try {
                const status = await Network.getStatus();
                setSensors(prev => ({ ...prev, networkStatus: status }));
            } catch (e) {
                console.error('Network info error', e);
            }
        };

        // Barometer
        const initBarometer = async () => {
            try {
                await BarometerPlugin.addListener('onPressureChange', (data) => {
                    setSensors(prev => ({ ...prev, pressure: data.pressure }));
                });
            } catch (e) {
                console.log('Barometer likely not supported or permissions missing');
            }
        };

        initBattery();
        initNetwork();
        initBarometer();

        // Listeners
        const networkListener = Network.addListener('networkStatusChange', status => {
            setSensors(prev => ({ ...prev, networkStatus: status }));
        });

        return () => {
            networkListener.then(h => h.remove());
        };
    }, []);

    return sensors;
};
