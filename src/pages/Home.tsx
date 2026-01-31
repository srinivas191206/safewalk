import { useState, useCallback } from 'react';
import { PanicButton } from '@/components/PanicButton';
import { StatusBar } from '@/components/StatusBar';
import { CountdownModal } from '@/components/CountdownModal';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { QuickActions } from '@/components/QuickActions';
import { NavBar } from '@/components/NavBar';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useLocation } from '@/hooks/useLocation';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import type { EmergencyTrigger, EmergencyEvent } from '@/types/emergency';
import { toast } from 'sonner';
import { Users, Radio } from 'lucide-react';

const Home = () => {
  const [guardianActive, setGuardianActive] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<EmergencyTrigger>('manual');

  const isOnline = useOnlineStatus();
  const { pendingCount, addToQueue } = useOfflineQueue();
  const { latitude, longitude, getGoogleMapsLink, hasLocation } = useLocation();
  const { contacts, hasMinimumContacts } = useEmergencyContacts();

  const handlePanicPress = useCallback(() => {
    if (!hasMinimumContacts) {
      toast.error('Please add at least 2 emergency contacts first');
      return;
    }
    setCurrentTrigger('manual');
    setShowCountdown(true);
  }, [hasMinimumContacts]);

  const handleCountdownCancel = useCallback(() => {
    setShowCountdown(false);
    toast.success('Emergency cancelled. Stay safe!');
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);

    const event: EmergencyEvent = {
      id: crypto.randomUUID(),
      userId: 'local-user',
      trigger: currentTrigger,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      status: 'pending',
      offlineQueued: !isOnline,
      message: `[EMERGENCY ALERT]\nUser may be in danger.\nLocation: ${getGoogleMapsLink() || 'Location unavailable'}\nTime: ${new Date().toLocaleString()}`,
    };

    if (isOnline) {
      // In production, this would call the API
      toast.success('Emergency alert sent to your contacts!');
      console.log('Sending emergency:', event);
    } else {
      addToQueue(event);
      toast.warning('No network. Alert queued and will be sent automatically when online.');
    }
  }, [currentTrigger, latitude, longitude, isOnline, getGoogleMapsLink, addToQueue]);

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
      <main className="flex flex-col items-center justify-center px-4 py-8">
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <PanicButton
            onTrigger={handlePanicPress}
            disabled={!guardianActive}
          />
        </div>

        {/* Quick actions */}
        <div className="w-full max-w-md mt-8">
          <QuickActions />
        </div>

        {/* Info cards */}
        <div className="w-full max-w-md mt-6 space-y-3">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''} configured
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasMinimumContacts ? 'Ready to alert' : 'Add at least 2 contacts'}
                </p>
              </div>
            </div>
          </div>

          {!isOnline && (
            <div className="glass-card rounded-2xl p-4 border-warning/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Offline Mode Active</p>
                  <p className="text-xs text-muted-foreground">
                    Alerts will be queued and sent when online
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
