import React, { useState, useEffect } from 'react';
import { NavBar } from '../components/NavBar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [showNavBar, setShowNavBar] = useState(false);

    useEffect(() => {
        // Check if user is onboarded
        const isOnboarded = localStorage.getItem('guardian_onboarded') === 'true';
        setShowNavBar(isOnboarded);

        // Listen for storage changes (when onboarding completes)
        const handleStorage = () => {
            const onboarded = localStorage.getItem('guardian_onboarded') === 'true';
            setShowNavBar(onboarded);
        };

        window.addEventListener('storage', handleStorage);

        // Also check on interval for same-tab changes
        const interval = setInterval(() => {
            const onboarded = localStorage.getItem('guardian_onboarded') === 'true';
            if (onboarded !== showNavBar) {
                setShowNavBar(onboarded);
            }
        }, 500);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, [showNavBar]);

    return (
        <div className="flex flex-col h-full relative">
            <main className={`flex-1 overflow-y-auto ${showNavBar ? 'pb-20' : ''}`}>
                {children}
            </main>

            {showNavBar && (
                <nav className="fixed bottom-0 left-0 right-0 z-[100]">
                    <NavBar />
                </nav>
            )}
        </div>
    );
};

export default MainLayout;
