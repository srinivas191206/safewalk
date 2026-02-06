import React from 'react';

interface MobilePreviewProps {
    children: React.ReactNode;
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-secondary/30 lg:bg-slate-900 flex justify-center items-center py-0 lg:py-8 overflow-x-hidden">
            {/* 
        On large screens: Constrain width and add frame style
        On mobile: Full screen 
      */}
            <div
                className="w-full h-full lg:h-[844px] lg:max-w-[390px] lg:rounded-[3.5rem] lg:shadow-2xl lg:ring-[12px] lg:ring-slate-900 bg-background relative overflow-hidden flex flex-col"
                style={{ transform: 'translateZ(0)' }}
            >
                {/* Mock Notch for iPhone-like feel */}
                <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-3xl z-[100]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1.5 bg-slate-800 rounded-full"></div>
                </div>

                <div className="flex-1 overflow-y-auto w-full h-full custom-scrollbar">
                    {children}
                </div>

                {/* Home Indicator Bar */}
                <div className="hidden lg:block absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-foreground/20 rounded-full z-[100]"></div>
            </div>
        </div>
    );
};
