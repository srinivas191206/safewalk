import { ArrowLeft, Shield, Bell, MapPin, Mic, Volume2, Vibrate, Moon, Info, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { NavBar } from '@/components/NavBar';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const Settings = () => {
  const [settings, setSettings] = useState({
    guardianMode: true,
    accidentDetection: true,
    voiceTrigger: true,
    locationSharing: true,
    notifications: true,
    alarmSound: true,
    vibration: true,
  });

  const updateSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingGroups = [
    {
      title: 'Guardian Features',
      items: [
        {
          key: 'guardianMode' as const,
          icon: Shield,
          label: 'Guardian Mode',
          description: 'Enable automatic protection',
        },
        {
          key: 'accidentDetection' as const,
          icon: Vibrate,
          label: 'Accident Detection',
          description: 'Detect sudden impacts using sensors',
        },
        {
          key: 'voiceTrigger' as const,
          icon: Mic,
          label: 'Voice Trigger',
          description: 'Activate SOS with voice commands',
        },
      ],
    },
    {
      title: 'Location & Alerts',
      items: [
        {
          key: 'locationSharing' as const,
          icon: MapPin,
          label: 'Location Sharing',
          description: 'Include location in emergency alerts',
        },
        {
          key: 'notifications' as const,
          icon: Bell,
          label: 'Notifications',
          description: 'Show status notifications',
        },
      ],
    },
    {
      title: 'Emergency Response',
      items: [
        {
          key: 'alarmSound' as const,
          icon: Volume2,
          label: 'Loud Alarm',
          description: 'Play alarm during emergencies',
        },
        {
          key: 'vibration' as const,
          icon: Vibrate,
          label: 'Vibration',
          description: 'Vibrate during emergencies',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-24">
      {/* Header */}
      <header className="px-4 pt-4 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your preferences</p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-6">
        {settingGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
              {group.title}
            </h2>
            <div className="glass-card rounded-2xl divide-y divide-border">
              {group.items.map(({ key, icon: Icon, label, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={() => updateSetting(key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* App info */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Info className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Guardian Mode</p>
              <p className="text-xs text-muted-foreground">Version 1.0.0 • Made for India</p>
            </div>
          </div>
        </div>

        {/* Permissions note */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Some features require device permissions to work properly.
            <br />
            Please ensure all permissions are granted.
          </p>
        </div>

        {/* Logout Button */}
        <div className="px-1 pt-4 pb-8">
          <button
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                localStorage.removeItem('guardian_user');
                localStorage.removeItem('guardian_onboarded');
                toast.success('Logged out successfully');
                window.location.href = '/';
              } catch (error: any) {
                toast.error(error.message);
              }
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all font-bold group"
          >
            <LogOut className="w-5 h-5 group-active:scale-90 transition-transform" />
            Sign Out of Safe walk
          </button>
        </div>
      </main>

      <NavBar />
    </div>
  );
};

export default Settings;
