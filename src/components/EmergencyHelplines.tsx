import React from 'react';
import { Phone, Shield, Flame, Activity } from 'lucide-react';

export const EmergencyHelplines = () => {
    const helplines = [
        { name: 'SOS', number: '112', icon: Shield, color: 'text-primary', bg: 'bg-primary/10' },
        { name: 'POLICE', number: '100', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'FIRE', number: '101', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
        { name: 'AMBULANCE', number: '102', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    const handleCall = (number: string) => {
        window.open(`tel:${number}`);
    };

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Official Helplines</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {helplines.map((service) => (
                    <button
                        key={service.name}
                        onClick={() => handleCall(service.number)}
                        className="flex items-center gap-4 p-5 rounded-[2.2rem] bg-white border border-border/50 shadow-sm active:scale-95 transition-all group hover:border-primary/20"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${service.bg} flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform`}>
                            <service.icon className={`w-6 h-6 ${service.color}`} />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-none mb-1.5">{service.name}</p>
                            <p className="text-lg font-black text-foreground tracking-tight">{service.number}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
