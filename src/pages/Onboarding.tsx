import { useState } from 'react';
import { Shield, ArrowRight, Phone, Users, MapPin, Mic, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Step = 'welcome' | 'phone' | 'permissions' | 'complete';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState<Step>('welcome');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState('');

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setShowOtp(true);
    toast.success('OTP sent to your phone (demo)');
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter the OTP');
      return;
    }
    if (!name) {
      toast.error('Please enter your name');
      return;
    }
    // Save to localStorage for demo
    localStorage.setItem('guardian_user', JSON.stringify({ phone, name }));
    setStep('permissions');
  };

  const handleRequestPermissions = async () => {
    // Request location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {});
    }

    // Request notifications
    if ('Notification' in window) {
      await Notification.requestPermission();
    }

    setStep('complete');
  };

  const handleComplete = () => {
    onComplete();
  };

  const features = [
    { icon: Shield, label: 'Automatic Accident Detection' },
    { icon: Mic, label: 'Voice-Activated SOS' },
    { icon: MapPin, label: 'Live Location Sharing' },
    { icon: Bell, label: 'Instant SMS & WhatsApp Alerts' },
  ];

  const permissions = [
    { icon: MapPin, label: 'Location', description: 'To share your location during emergencies' },
    { icon: Mic, label: 'Microphone', description: 'For voice-activated emergency triggers' },
    { icon: Bell, label: 'Notifications', description: 'To alert you about emergency status' },
  ];

  return (
    <div className="min-h-screen bg-background safe-area-inset flex flex-col">
      {/* Welcome Step */}
      {step === 'welcome' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Guardian Mode</h1>
          <p className="text-muted-foreground mb-8">Your personal safety companion</p>

          <div className="space-y-4 w-full max-w-sm mb-12">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 glass-card rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setStep('phone')}
            size="lg"
            className="w-full max-w-sm h-14 text-lg"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {/* Phone Step */}
      {step === 'phone' && (
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h1>
            <p className="text-muted-foreground">Enter your phone number to get started</p>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-2 h-12"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value="+91"
                  disabled
                  className="w-16 h-12 text-center"
                />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 h-12"
                  maxLength={10}
                />
              </div>
            </div>

            {!showOtp ? (
              <Button onClick={handleSendOtp} className="w-full h-12">
                Send OTP
              </Button>
            ) : (
              <>
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="mt-2 h-12 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Demo: Enter any 6 digits
                  </p>
                </div>
                <Button onClick={handleVerifyOtp} className="w-full h-12">
                  Verify & Continue
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Permissions Step */}
      {step === 'permissions' && (
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Enable Permissions</h1>
            <p className="text-muted-foreground">
              Guardian Mode needs these permissions to protect you
            </p>
          </div>

          <div className="space-y-4 flex-1">
            {permissions.map(({ icon: Icon, label, description }) => (
              <div key={label} className="glass-card rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleRequestPermissions} className="w-full h-14 text-lg">
            Enable Permissions
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-accent" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">You're Protected!</h1>
          <p className="text-muted-foreground mb-4">Welcome, {name}</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs">
            Guardian Mode is now active. Add your emergency contacts to complete setup.
          </p>

          <Button onClick={handleComplete} size="lg" className="w-full max-w-sm h-14 text-lg">
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
