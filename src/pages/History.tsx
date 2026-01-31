import { ArrowLeft, Clock, MapPin, AlertTriangle, CheckCircle, XCircle, Wifi, Car, Mic, Siren, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';

// Demo data for UI - in production this would come from the backend
const demoHistory = [
  {
    id: '1',
    trigger: 'manual' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'sent' as const,
    location: 'Mumbai, Maharashtra',
  },
  {
    id: '2',
    trigger: 'accident' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'cancelled' as const,
    location: 'Delhi, NCR',
  },
  {
    id: '3',
    trigger: 'voice' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'sent' as const,
    location: 'Bangalore, Karnataka',
  },
];

const triggerLabels = {
  accident: { label: 'Accident Detected', icon: Car },
  voice: { label: 'Voice Trigger', icon: Mic },
  manual: { label: 'Manual SOS', icon: Siren },
};

const statusConfig = {
  sent: { label: 'Sent', color: 'text-accent', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', icon: XCircle },
  pending: { label: 'Pending', color: 'text-warning', icon: Clock },
  failed: { label: 'Failed', color: 'text-primary', icon: AlertTriangle },
};

const History = () => {
  return (
    <div className="min-h-screen bg-background safe-area-inset pb-24">
      {/* Header */}
      <header className="px-4 pt-4 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Emergency History</h1>
            <p className="text-sm text-muted-foreground">Past alerts and events</p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {demoHistory.map((event) => {
          const trigger = triggerLabels[event.trigger];
          const status = statusConfig[event.status];
          const StatusIcon = status.icon;
          const TriggerIcon = trigger.icon;

          return (
            <div key={event.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    <TriggerIcon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{trigger.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 ${status.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">{status.label}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            </div>
          );
        })}

        {demoHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No history yet</h3>
            <p className="text-sm text-muted-foreground">
              Emergency events will appear here
            </p>
          </div>
        )}

        {/* Info note */}
        <div className="glass-card rounded-2xl p-4 mt-6">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span>This is demo data. Connect to backend for real history.</span>
          </p>
        </div>
      </main>

      <NavBar />
    </div>
  );
};

export default History;
