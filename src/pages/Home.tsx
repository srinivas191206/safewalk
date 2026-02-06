import { useState, useCallback, useEffect } from 'react';
import { PanicButton } from '@/components/PanicButton';
import { StatusBar } from '@/components/StatusBar';
import { CountdownModal } from '@/components/CountdownModal';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { EmergencyHelplines } from '@/components/EmergencyHelplines';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useLocation } from '@/hooks/useLocation';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useSensors } from '@/hooks/useSensors';
import SosSms from '@/plugins/SosSmsPlugin';
import type { EmergencyTrigger, EmergencyEvent } from '@/types/emergency';
import { toast } from 'sonner';
import { Users, Radio, Battery, Gauge } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { KeepAwake } from '@capacitor-community/keep-awake';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useCrashDetection } from '@/hooks/useCrashDetection';
import { useVoiceTrigger } from '@/hooks/useVoiceTrigger';

const Home = () => {
  const [guardianActive, setGuardianActive] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<EmergencyTrigger>('manual');
  const [isSending, setIsSending] = useState(false); // Prevent duplicate sends

  const isOnline = useOnlineStatus();
  const { pendingCount, addToQueue } = useOfflineQueue();
  const { latitude, longitude, getGoogleMapsLink, hasLocation } = useLocation();
  const { contacts, hasMinimumContacts } = useEmergencyContacts();

  // New Sensors
  const sensors = useSensors();

  // Keep Screen On and Show Persistent Notification when Guardian Mode is Active
  useEffect(() => {
    const managePresence = async () => {
      if (guardianActive) {
        await KeepAwake.keepAwake();

        // Request notification permission if needed
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }

        // Show persistent notification
        await LocalNotifications.schedule({
          notifications: [
            {
              title: "Safe Walk: ARMED & PROTECTING",
              body: "Guardian Protocols are active. You are being monitored.",
              id: 1001,
              ongoing: true, // Make it persistent on Android
              smallIcon: "ic_stat_shield", // Standard icon name
              autoCancel: false,
            }
          ]
        });
      } else {
        await KeepAwake.allowSleep();
        await LocalNotifications.cancel({
          notifications: [{ id: 1001 }]
        });
      }
    };
    managePresence();
  }, [guardianActive]);

  // Handle App State Changes
  useEffect(() => {
    const setupListener = async () => {
      const handle = await App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive && guardianActive) {
          console.log('Safe Walk: Running in background mode');
        }
      });
      return handle;
    };

    const handlePromise = setupListener();

    return () => {
      handlePromise.then(handle => handle.remove());
    };
  }, [guardianActive]);

  // Handler for all triggers
  const handleTrigger = useCallback((type: EmergencyTrigger) => {
    if (!hasMinimumContacts) {
      toast.error('Add contacts to enable Guardian Mode');
      return;
    }
    setCurrentTrigger(type);
    setShowCountdown(true);

    // Vibration Feedback (Native Haptics)
    const triggerHaptics = async () => {
      if (type === 'accident') {
        // Long vibration for accident (10s approx via loop or long duration support)
        // Note: Capacitor Haptics.vibrate duration support varies. on Android it works.
        await Haptics.vibrate({ duration: 10000 });
      } else {
        // Distinct Pulse for manual
        await Haptics.impact({ style: ImpactStyle.Heavy });
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 300);
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 600);
      }
    };
    triggerHaptics();
  }, [hasMinimumContacts]);

  const handlePanicPress = () => handleTrigger('manual');

  // Native Sensors
  useCrashDetection({
    isActive: guardianActive,
    onCrashDetected: () => handleTrigger('accident')
  });

  useVoiceTrigger({
    isActive: guardianActive,
    onTrigger: () => handleTrigger('voice')
  });

  const handleCountdownCancel = useCallback(() => {
    setShowCountdown(false);
    // Vibration stops automatically after duration

    toast.success('Emergency cancelled. Stay safe!');
  }, []);

  const handleCountdownComplete = useCallback(async () => {
    setShowCountdown(false);
    // Vibration stops automatically after duration

    // Prevent duplicate sends
    if (isSending) {
      console.log('SMS already sending, ignoring duplicate trigger');
      return;
    }
    setIsSending(true);

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || 'anonymous';
    const userName = session?.user?.user_metadata?.full_name || 'A Safety Net User';

    const alertId = crypto.randomUUID();

    // Start Voice Recording
    try {
      const { value: hasPermission } = await VoiceRecorder.hasAudioRecordingPermission();
      if (!hasPermission) {
        await VoiceRecorder.requestAudioRecordingPermission();
      }

      const result = await VoiceRecorder.startRecording();
      if (result.value) {
        // Stop after 60 seconds (1 minute) as requested
        setTimeout(async () => {
          try {
            const recording = await VoiceRecorder.stopRecording();
            const fileName = `emergency_${alertId}.wav`;
            const result = await Filesystem.writeFile({
              path: fileName,
              data: recording.value.recordDataBase64,
              directory: Directory.Data,
            });
            console.log('Voice evidence stored:', result.uri);

            // Update the event in local storage/history if needed
            const history = JSON.parse(localStorage.getItem('guardian_sos_history') || '[]');
            const updatedHistory = history.map((e: any) =>
              e.id === alertId ? { ...e, recordingPath: result.uri } : e
            );
            localStorage.setItem('guardian_sos_history', JSON.stringify(updatedHistory));
          } catch (e) {
            console.error('Failed to save voice evidence:', e);
          }
        }, 60000);
      }
    } catch (e) {
      console.error('Voice recording failed to start:', e);
    }

    const event: EmergencyEvent = {
      id: alertId,
      userId: userId,
      trigger: currentTrigger,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      status: 'pending',
      offlineQueued: !isOnline,
      message: `🆘 [HELP NEEDED] - Safety Net Alert!\n${userName} is in an emergency.\n\n📍 Live Location: ${getGoogleMapsLink() || 'Location unavailable'}\n\n🕒 Time: ${new Date().toLocaleString()}`,
      logEntries: [
        {
          timestamp: new Date().toISOString(),
          latitude,
          longitude,
          event: `SOS Triggered via ${currentTrigger}`
        }
      ]
    };

    // Save to local history immediately
    const existingHistory = JSON.parse(localStorage.getItem('guardian_sos_history') || '[]');
    localStorage.setItem('guardian_sos_history', JSON.stringify([event, ...existingHistory]));

    const initiateAlerts = async () => {
      try {
        if (!contacts || contacts.length === 0) {
          toast.error('No emergency contacts configured.');
          setIsSending(false);
          return;
        }

        console.log('🚨 SOS TRIGGERED - Sending SMS to', contacts.length, 'contacts');
        toast.loading('Sending Emergency SMS...');

        const phoneNumbers = contacts.map(c => c.phone.replace(/\s/g, ''));
        console.log('Phone numbers:', phoneNumbers);

        if (phoneNumbers.length > 0) {
          try {
            if (!SosSms) {
              throw new Error('SOS SMS Plugin not initialized');
            }
            // Send SMS to ALL contacts at once
            await SosSms.sendEmergencySms({ phoneNumbers, message: event.message });

            toast.dismiss();
            toast.success(`🚀 SOS protocol initiated! Sending SMS to ${phoneNumbers.length} contacts...`);
          } catch (err: any) {
            console.error('❌ SOS Dispatch Failed:', err);
            toast.dismiss();
            toast.error(`SOS Error: ${err.message || 'Check SIM permissions or balance'}`);
          }
        }

      } catch (error: any) {
        console.error('Alert System Error:', error);
        toast.dismiss();
        toast.error(`Alert Error: ${error?.message || 'Unknown'}`);
        if (!isOnline) addToQueue(event);
      } finally {
        // Reset sending flag after completion
        setIsSending(false);
      }
    };

    initiateAlerts();

  }, [currentTrigger, latitude, longitude, isOnline, getGoogleMapsLink, addToQueue, contacts]);

  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header - Safe Walk Branding */}
      <header className="px-5 pt-safe pb-4 border-b border-border/10 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="pt-4 flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shadow-glow-red/20">
              <img src="/logo.png" alt="Safe Walk" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground uppercase leading-none">Safe <span className="text-primary italic">Walk</span></h1>
              <p className="text-[9px] text-muted-foreground font-extrabold tracking-[0.2em] uppercase opacity-60">Secure Protocol</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-2 py-1 rounded-lg border transition-all duration-500 ${guardianActive ? 'bg-primary/10 border-primary/20' : 'bg-muted/30 border-border/50'}`}>
              <span className={`text-[9px] font-black uppercase tracking-tight ${guardianActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {guardianActive ? 'Armed' : 'Standby'}
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${guardianActive ? 'bg-primary shadow-glow-red animate-pulse' : 'bg-muted'}`} />
          </div>
        </div>
        <StatusBar
          isOnline={isOnline}
          isListening={guardianActive}
          locationEnabled={hasLocation}
          guardianActive={guardianActive}
        />
      </header>

      {/* Main content - Centered SOS Impact Zone */}
      <main className="flex flex-col items-center justify-center p-6 space-y-10 overflow-y-auto">
        {/* Dynamic Glow Background */}
        <div className={`fixed inset-0 bg-primary/5 transition-opacity duration-700 pointer-events-none ${guardianActive ? 'opacity-100' : 'opacity-0'}`} />

        {/* SOS Action Area */}
        <div className="relative flex flex-col items-center gap-16 w-full max-w-xs z-10 mr-1.5">
          <div className="relative group">
            <div className={`absolute -inset-10 rounded-full bg-primary/10 blur-3xl transition-all duration-1000 ${guardianActive ? 'scale-150 opacity-100 pulse-ring' : 'scale-75 opacity-0'}`} />
            <PanicButton
              onTrigger={handlePanicPress}
              disabled={false}
            />
          </div>

          <div className="w-full space-y-6">
            <button
              onClick={() => setGuardianActive(!guardianActive)}
              className={`w-full px-8 py-5 rounded-[2.5rem] font-black text-lg transition-all duration-500 shadow-premium active:scale-95 border-4 ${guardianActive
                ? 'bg-primary text-primary-foreground border-primary/20 shadow-glow-red'
                : 'bg-card text-foreground border-border hover:bg-muted/50'
                }`}
            >
              {guardianActive ? '🛡️ SYSTEM ARMED' : 'ARM SYSTEM'}
            </button>

            {/* Status Information - Professional Cards */}
            <div className="grid grid-cols-1 gap-4 w-full">
              <div className="glass-card rounded-[2.2rem] p-5 flex items-center gap-4 border border-primary/5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Nodes</p>
                  <p className="text-xl font-black text-foreground">{contacts.length} SECURE</p>
                </div>
              </div>

              {/* Sensor Data Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-[2.2rem] p-4 flex flex-col justify-between border border-primary/5 min-h-[100px]">
                  <div className="flex items-start justify-between">
                    <Battery className={`w-6 h-6 ${sensors.isCharging ? 'text-green-500' : 'text-primary'}`} />
                    <span className="text-[10px] font-black text-muted-foreground uppercase">Power</span>
                  </div>
                  <p className="text-xl font-black text-foreground">
                    {sensors.batteryLevel !== null ? `${sensors.batteryLevel}%` : '--'}
                    {sensors.isCharging && <span className="text-xs ml-1 text-green-500">⚡</span>}
                  </p>
                </div>
                <div className="glass-card rounded-[2.2rem] p-4 flex flex-col justify-between border border-primary/5 min-h-[100px]">
                  <div className="flex items-start justify-between">
                    <Gauge className="w-6 h-6 text-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase">Pressure</span>
                  </div>
                  <p className="text-xl font-black text-foreground">
                    {sensors.pressure ? `${Math.round(sensors.pressure)} hPa` : '--'}
                  </p>
                </div>
              </div>

              {!isOnline && (
                <div className="glass-card rounded-[2.2rem] p-5 flex items-center gap-4 border-destructive/20 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
                    <Radio className="w-8 h-8 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-destructive uppercase tracking-widest">Network Drop</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Buffered Protocols</p>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Helplines Section */}
            <EmergencyHelplines />
          </div>
        </div>
      </main>

      {/* Overlays */}
      <OfflineIndicator pendingCount={pendingCount} />
      <CountdownModal
        isOpen={showCountdown}
        onCancel={handleCountdownCancel}
        onComplete={handleCountdownComplete}
        triggerType={currentTrigger}
      />
    </div>
  );
};

export default Home;
