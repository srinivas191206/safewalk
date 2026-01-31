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
            <div className="w-full h-full lg:h-[844px] lg:max-w-[390px] lg:rounded-[3rem] lg:shadow-2xl lg:ring-8 lg:ring-slate-800 bg-background relative overflow-hidden flex flex-col">
                {/* Mock Notch for iPhone-like feel */}
                <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50"></div>

                <div className="flex-1 overflow-y-auto w-full h-full custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};
