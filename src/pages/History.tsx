import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MapPin, CheckCircle, XCircle, AlertTriangle, Car, Mic, Siren, Play, Pause, FileText, ChevronDown, ChevronUp, Trash2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { EmergencyTrigger, EmergencyEvent } from '@/types/emergency';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';

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
  const [events, setEvents] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioObject, setAudioObject] = useState<HTMLAudioElement | null>(null);

  const deleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    localStorage.setItem('guardian_sos_history', JSON.stringify(updated));
    toast.success('Incident log removed');
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to permanently clear all security logs?')) {
      setEvents([]);
      localStorage.removeItem('guardian_sos_history');
      toast.success('Security archive cleared');
    }
  };

  const playRecording = async (id: string, path: string) => {
    try {
      if (playingId === id && audioObject) {
        audioObject.pause();
        setPlayingId(null);
        return;
      }

      if (audioObject) {
        audioObject.pause();
      }

      const fileName = path.split('/').pop() || '';
      const file = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Data,
      });

      if (!file.data) throw new Error('EMPTY_FILE');

      const byteCharacters = atob(file.data as string);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });
      const blobUrl = URL.createObjectURL(blob);

      const audio = new Audio(blobUrl);
      setAudioObject(audio);
      setPlayingId(id);

      audio.onplay = () => toast.success('Playing audio evidence...');
      audio.onended = () => {
        setPlayingId(null);
        URL.revokeObjectURL(blobUrl);
      };
      audio.onerror = (e) => {
        console.error('Audio object error:', e);
        toast.error('Codec error during playback');
        setPlayingId(null);
      };

      await audio.play();
    } catch (e: any) {
      console.error('Playback failed:', e);
      toast.error(`Evidence playback failed: ${e.message || 'Unknown error'}`);
      setPlayingId(null);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // 1. Fetch from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        let remoteEvents: any[] = [];
        if (user) {
          const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            remoteEvents = data.map(e => ({
              id: e.id,
              trigger: (e.trigger_type as EmergencyTrigger) || 'manual',
              timestamp: e.created_at,
              status: (e.status as any) || 'sent',
              latitude: e.latitude,
              longitude: e.longitude,
              message: e.message || '',
              offlineQueued: false,
            }));
          }
        }

        // 2. Fetch from Local Storage
        const localHistory: EmergencyEvent[] = JSON.parse(localStorage.getItem('guardian_sos_history') || '[]');

        // 3. Merge and De-duplicate (Prioritize local for detailed data like recordings)
        const merged = [...localHistory];
        remoteEvents.forEach(re => {
          if (!merged.find(me => me.id === re.id)) {
            merged.push(re);
          }
        });

        // Sort by timestamp
        merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setEvents(merged);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 border-b border-border/10 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight">SOS History</h1>
              <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest">Security Archive</p>
            </div>
          </div>
          {events.length > 0 && (
            <button
              onClick={clearAll}
              className="p-3 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all active:scale-90"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-6 px-5 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Accessing Logs...</p>
          </div>
        ) : (
          <div className="space-y-4 pb-12">
            {events.map((event) => {
              const trigger = triggerLabels[event.trigger] || triggerLabels.manual;
              const status = statusConfig[event.status] || statusConfig.sent;
              const StatusIcon = status.icon;
              const TriggerIcon = trigger.icon;
              const isExpanded = expandedId === event.id;

              return (
                <div key={event.id} className="glass-card rounded-[2.2rem] p-5 border border-white/5 shadow-premium group transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors duration-500">
                        <TriggerIcon className="w-7 h-7 text-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-foreground tracking-tight leading-none mb-1.5">{trigger.label}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                          {new Date(event.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                          <span className="mx-2">•</span>
                          {new Date(event.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${status.color.replace('text-', 'bg-').replace('text-', 'border-')}/10 border-${status.color.split('-')[1]}/20`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${status.color}`}>{status.label}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3.5 bg-muted/20 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center border border-white/5">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Incident Location</p>
                        <p className="text-xs font-bold text-foreground truncate">
                          {event.latitude && event.longitude ? `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}` : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Access Actions */}
                    <div className="flex gap-2">
                      {event.recordingPath && (
                        <button
                          onClick={() => playRecording(event.id, event.recordingPath!)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-2xl transition-all ${playingId === event.id
                            ? 'bg-primary text-white border-primary shadow-glow-red'
                            : 'bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary'
                            }`}
                        >
                          {playingId === event.id ? (
                            <>
                              <Pause className="w-4 h-4 fill-white" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-primary" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Play Evidence</span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : event.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary/50 hover:bg-secondary border border-white/5 rounded-2xl transition-all"
                      >
                        <FileText className="w-4 h-4 text-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Logs</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="w-12 flex items-center justify-center bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/10 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Collapsible Logs Section */}
                    {isExpanded && (
                      <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-background/40 rounded-2xl p-4 border border-white/5">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Chronological Event Log</p>
                          <div className="space-y-4">
                            {event.logEntries?.map((entry, idx) => (
                              <div key={idx} className="relative pl-6 border-l border-primary/20 pb-2">
                                <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
                                <p className="text-[10px] font-black text-foreground mb-1">
                                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {entry.event}
                                </p>
                              </div>
                            ))}
                            {!event.logEntries && (
                              <p className="text-xs text-muted-foreground italic text-center py-4">Detailed logs unavailable for this legacy event.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {events.length === 0 && (
              <div className="text-center py-20 px-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-muted/30 flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-muted-foreground/20">
                  <Clock className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-black text-foreground mb-2 italic">Archive Empty</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-relaxed opacity-60">
                  No security incidents or SOS logs have been recorded yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
