import { useState } from 'react';
import { ArrowLeft, TestTube, CheckCircle, AlertTriangle, Mic, Smartphone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanicButton } from '@/components/PanicButton';
import { CountdownModal } from '@/components/CountdownModal';
import { useLocation } from '@/hooks/useLocation';
import { toast } from 'sonner';

const TestMode = () => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({
    location: null,
    sensors: null,
    notifications: null,
  });

  const { hasLocation, getCurrentLocation, latitude, longitude } = useLocation();

  const runLocationTest = () => {
    getCurrentLocation();
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, location: hasLocation }));
      if (hasLocation) {
        toast.success(`Location acquired: ${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`);
      } else {
        toast.error('Could not get location. Check permissions.');
      }
    }, 1500);
  };

  const runSensorTest = () => {
    // In production, this would test accelerometer/gyroscope
    const hasMotion = 'DeviceMotionEvent' in window;
    setTestResults(prev => ({ ...prev, sensors: hasMotion }));
    if (hasMotion) {
      toast.success('Motion sensors available');
    } else {
      toast.warning('Motion sensors may not be available');
    }
  };

  const runNotificationTest = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        const granted = permission === 'granted';
        setTestResults(prev => ({ ...prev, notifications: granted }));
        if (granted) {
          new Notification('Guardian Mode Test', {
            body: 'Notifications are working!',
            icon: '/favicon.ico',
          });
          toast.success('Notification permission granted');
        } else {
          toast.error('Notification permission denied');
        }
      });
    } else {
      setTestResults(prev => ({ ...prev, notifications: false }));
      toast.error('Notifications not supported');
    }
  };

  const tests = [
    {
      key: 'location',
      icon: MapPin,
      label: 'Location Services',
      description: 'Test GPS and location access',
      action: runLocationTest,
    },
    {
      key: 'sensors',
      icon: Smartphone,
      label: 'Motion Sensors',
      description: 'Test accelerometer and gyroscope',
      action: runSensorTest,
    },
    {
      key: 'notifications',
      icon: AlertTriangle,
      label: 'Notifications',
      description: 'Test push notification access',
      action: runNotificationTest,
    },
  ];

  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 border-b border-border/10 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">Diagnostic Mode</h1>
            <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest">Protocol Verification</p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-6">
        {/* Test SOS button */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <TestTube className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Test SOS Flow</h2>
              <p className="text-xs text-muted-foreground">
                Try the emergency flow without sending real alerts
              </p>
            </div>
          </div>

          <div className="flex justify-center py-4">
            <div className="scale-75">
              <PanicButton
                onTrigger={() => setShowCountdown(true)}
                isTestMode={true}
              />
            </div>
          </div>
        </div>

        {/* Feature tests */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Test Features
          </h2>
          <div className="space-y-3">
            {tests.map(({ key, icon: Icon, label, description, action }) => (
              <div key={key} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults[key] !== null && (
                      <div className={`p-1 rounded-full ${testResults[key] ? 'bg-accent/20' : 'bg-primary/20'}`}>
                        {testResults[key] ? (
                          <CheckCircle className="w-4 h-4 text-accent" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={action}
                    >
                      Test
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            🧪 Test mode does not send real emergency alerts.
            <br />
            All tests are for demonstration purposes only.
          </p>
        </div>
      </main>

      {/* Countdown modal */}
      <CountdownModal
        isOpen={showCountdown}
        onCancel={() => {
          setShowCountdown(false);
          toast.info('Test cancelled');
        }}
        onComplete={() => {
          setShowCountdown(false);
          toast.success('Test complete! In production, alerts would be sent here.');
        }}
        triggerType="manual"
      />

    </div>
  );
};

export default TestMode;
