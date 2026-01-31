import { useState, useCallback, useEffect } from 'react';
import { PanicButton } from '@/components/PanicButton';
import { StatusBar } from '@/components/StatusBar';
import { CountdownModal } from '@/components/CountdownModal';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { QuickActions } from '@/components/QuickActions';
import { NavBar } from '@/components/NavBar';
import MapComponent from '@/components/MapComponent';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useLocation } from '@/hooks/useLocation';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import type { EmergencyTrigger, EmergencyEvent } from '@/types/emergency';
import { toast } from 'sonner';
import { Users, Radio } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { KeepAwake } from '@capacitor-community/keep-awake';
import { useCrashDetection } from '@/hooks/useCrashDetection';
import { useVoiceTrigger } from '@/hooks/useVoiceTrigger';

const Home = () => {
  const [guardianActive, setGuardianActive] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<EmergencyTrigger>('manual');

  const isOnline = useOnlineStatus();
  const { pendingCount, addToQueue } = useOfflineQueue();
  const { latitude, longitude, getGoogleMapsLink, hasLocation } = useLocation();
  const { contacts, hasMinimumContacts } = useEmergencyContacts();

  // Keep Screen On when Guardian Mode is Active
  useEffect(() => {
    const manageWakeLock = async () => {
      if (guardianActive) {
        await KeepAwake.keepAwake();
      } else {
        await KeepAwake.allowSleep();
      }
    };
    manageWakeLock();
  }, [guardianActive]);

  // Handler for all triggers
  const handleTrigger = useCallback((type: EmergencyTrigger) => {
    if (!hasMinimumContacts) {
      toast.error('Add contacts to enable Guardian Mode');
      return;
    }
    setCurrentTrigger(type);
    setShowCountdown(true);
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
    toast.success('Emergency cancelled. Stay safe!');
  }, []);

  const handleCountdownComplete = useCallback(async () => {
    setShowCountdown(false);

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || 'anonymous';
    const userName = session?.user?.user_metadata?.full_name || 'A Safety Net User';

    const alertId = crypto.randomUUID();

    const event: EmergencyEvent = {
      id: alertId,
      userId: userId,
      trigger: currentTrigger,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      status: 'pending',
      offlineQueued: !isOnline,
      message: `🆘 [HELP NEEDED] - Safety Net Alert!\n${userName} is in an emergency.\n\n📍 Live Location: ${getGoogleMapsLink() || 'Location unavailable'}\n\n🕒 Time: ${new Date().toLocaleString()}\n\n[Sent via Safety Net Connect]`,
    };

    if (isOnline) {
      // Call Backend API
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/send-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contacts: contacts,
            location: { latitude, longitude },
            message: event.message
          }),
        });

        if (response.ok) {
          toast.success('Emergency alert sent via SMS!');
          console.log('Backend response success');
        } else {
          // If server fails (e.g. no credits), still show "Sent" but warn debug
          const errorData = await response.json();
          console.error('Backend failed:', errorData);
          toast.error(`Alert failed: ${errorData.error || 'Server error'}`);
        }
      } catch (error) {
        console.error('Network error calling backend:', error);
        toast.error('Network error. Check connection.');
      }
    } else {
      addToQueue(event);
      toast.warning('No network. Alert queued and will be sent automatically when online.');
    }
  }, [currentTrigger, latitude, longitude, isOnline, getGoogleMapsLink, addToQueue, contacts]);

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-24">
      {/* Header */}
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Guardian Mode</h1>
            <p className="text-sm text-muted-foreground">Your safety companion</p>
          </div>
        </div>
        <StatusBar
          isOnline={isOnline}
          isListening={guardianActive}
          locationEnabled={hasLocation}
          guardianActive={guardianActive}
        />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col px-4 py-8">
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-12">
          <PanicButton
            onTrigger={handlePanicPress}
            disabled={false} // Always allow manual panic
          />

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => setGuardianActive(!guardianActive)}
              className={`px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${guardianActive
                ? 'bg-primary text-primary-foreground shadow-glow-red scale-105 ring-4 ring-primary/20'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
            >
              {guardianActive ? '🛡️ Guardian Mode ACTIVE' : 'Turn On Guardian Mode'}
            </button>
          </div>
        </div>

        {/* Live Map */}
        <div className="w-full max-w-md mt-6 h-56 rounded-3xl overflow-hidden shadow-card border border-border/50">
          <MapComponent className="h-full w-full" />
        </div>

        {/* Sync Status - Premium Card */}
        <div className="w-full max-w-md mt-8 space-y-3 pb-4">
          <div className="glass-card rounded-[2rem] p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-foreground">
                  Contacts Synced
                </p>
                <p className="text-sm text-muted-foreground">
                  {contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''} ready
                </p>
              </div>
              <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                <span className="text-xs font-bold text-accent">SECURE</span>
              </div>
            </div>
          </div>

          {!isOnline && (
            <div className="glass-card rounded-[2rem] p-5 border-warning/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-foreground">Offline Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Alerts will be sent when online
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Offline indicator */}
      <OfflineIndicator pendingCount={pendingCount} />

      {/* Countdown modal */}
      <CountdownModal
        isOpen={showCountdown}
        onCancel={handleCountdownCancel}
        onComplete={handleCountdownComplete}
        triggerType={currentTrigger}
      />

      {/* Navigation */}
      <NavBar />
    </div>
  );
};

export default Home;
