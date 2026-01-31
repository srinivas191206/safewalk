import { History, Settings, TestTube, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActions = () => {
  const actions = [
    { icon: History, label: 'History', path: '/history' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: TestTube, label: 'Test Mode', path: '/test' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map(({ icon: Icon, label, path }) => (
        <Link
          key={label}
          to={path}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <Icon className="w-6 h-6 text-foreground" />
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
        </Link>
      ))}
    </div>
  );
};
