import { Home, History, Users, Settings, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const NavBar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Info, label: 'About', path: '/about' },
  ];

  return (
    <nav className="w-full bg-white border-t border-border/50 shadow-sm pb-safe">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={label}
              to={path}
              className={`flex flex-col items-center gap-1 px-4 py-1 ${isActive
                ? 'text-primary'
                : 'text-muted-foreground'
                }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
