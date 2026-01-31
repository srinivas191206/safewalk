import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const getCurrentLocation = useCallback(async () => {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      setLocation(prev => ({ ...prev, loading: true, error: null }));

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, []);

  // Get location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  const getGoogleMapsLink = useCallback(() => {
    if (location.latitude && location.longitude) {
      return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    }
    return null;
  }, [location.latitude, location.longitude]);

  return {
    ...location,
    getCurrentLocation,
    getGoogleMapsLink,
    hasLocation: location.latitude !== null && location.longitude !== null,
  };
};
