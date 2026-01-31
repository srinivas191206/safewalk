export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  whatsappEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  emergencyContacts: EmergencyContact[];
  createdAt: string;
}

export type EmergencyTrigger = 'accident' | 'voice' | 'manual';

export interface EmergencyEvent {
  id: string;
  userId: string;
  trigger: EmergencyTrigger;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  offlineQueued: boolean;
  message: string;
}

export interface AppPermissions {
  location: boolean;
  microphone: boolean;
  motionSensors: boolean;
  sms: boolean;
  notifications: boolean;
}

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'none';
}
