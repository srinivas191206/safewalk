import { Home, History, Users, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const NavBar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="absolute bottom-4 left-4 right-4 z-50">
      <div className="bg-card/80 backdrop-blur-2xl border border-border/40 rounded-[2rem] shadow-2xl">
        <div className="flex items-center justify-around py-3 px-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={label}
                to={path}
                className={`flex flex-col items-center gap-1.5 px-5 py-2 rounded-2xl transition-all duration-300 ${isActive
                    ? 'text-primary scale-110'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                  }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-0.5 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
