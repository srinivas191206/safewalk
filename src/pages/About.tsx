import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Mic, Signal, Battery, MessageSquare, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Shield,
            title: "Guardian Mode",
            desc: "Keeps the screen awake and monitors for falls/crashes using device sensors."
        },
        {
            icon: MessageSquare,
            title: "Automated SMS",
            desc: "Sends direct SMS alerts to all emergency contacts instantly in the background without user intervention."
        },
        {
            icon: Mic,
            title: "Voice Evidence",
            desc: "Automatically records 60 seconds of audio when SOS is triggered to capture evidence of the emergency."
        },
        {
            icon: AlertTriangle,
            title: "Crash Detection",
            desc: "Uses the accelerometer to detect sudden impacts (G-force > 3.5) and triggers SOS automatically."
        },
        {
            icon: Signal,
            title: "Offline Support",
            desc: "Queues alerts when offline and sends them automatically once connectivity is restored."
        },
        {
            icon: Battery,
            title: "Smart Monitoring",
            desc: "Tracks battery levels and atmospheric pressure to provide context on your environment."
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-border/10 sticky top-0 bg-background/80 backdrop-blur-md z-10 flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full w-10 h-10 p-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold">About Safe Walk</h1>
            </header>

            <main className="flex-1 p-6 space-y-8 overflow-y-auto">
                {/* Intro */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center border border-primary/20 shadow-glow-red/20">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-3xl opacity-90" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Safe <span className="text-primary italic">Walk</span></h2>
                        <p className="text-muted-foreground text-sm">v1.0.0 • Enterprise Safety Protocol</p>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Safe Walk is designed to be your silent guardian. It leverages advanced device sensors and native telephony to ensure help is always one tap away.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {features.map((f, i) => (
                        <div key={i} className="glass-card p-4 rounded-2xl flex items-start gap-4 border border-border/50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <f.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legal / Credits */}
                <div className="pt-8 text-center space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Designed for Safety</p>
                    <p className="text-xs text-muted-foreground">© 2026 Safe Walk Initiative</p>
                </div>
            </main>
        </div>
    );
};

export default About;
