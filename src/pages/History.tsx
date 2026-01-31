import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, CheckCircle, XCircle, AlertTriangle, Car, Mic, Siren } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { supabase } from '@/lib/supabase';
import type { EmergencyTrigger } from '@/types/emergency';

interface HistoryEvent {
  id: string;
  trigger: EmergencyTrigger;
  timestamp: string;
  status: 'sent' | 'cancelled' | 'pending' | 'failed';
  location: string;
}

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
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedEvents: HistoryEvent[] = (data || []).map(e => ({
          id: e.id,
          trigger: (e.trigger_type as EmergencyTrigger) || 'manual',
          timestamp: e.created_at,
          status: (e.status as any) || 'sent',
          location: e.latitude && e.longitude ? `${e.latitude.toFixed(4)}, ${e.longitude.toFixed(4)}` : 'Unknown Location',
        }));

        setEvents(mappedEvents);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading history...</div>
        ) : (
          <>
            {events.map((event) => {
              const trigger = triggerLabels[event.trigger] || triggerLabels.manual;
              const status = statusConfig[event.status] || statusConfig.sent;
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

            {events.length === 0 && (
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
          </>
        )}
      </main>

      <NavBar />
    </div>
  );
};

export default History;
