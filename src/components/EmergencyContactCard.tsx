import { User, Phone, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EmergencyContact } from '@/types/emergency';

interface EmergencyContactCardProps {
  contact: EmergencyContact;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const EmergencyContactCard = ({ 
  contact, 
  onDelete,
  showActions = true 
}: EmergencyContactCardProps) => {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
          <User className="w-6 h-6 text-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{contact.name}</h3>
          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
          <div className="flex items-center gap-2 mt-1">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{contact.phone}</span>
            {contact.whatsappEnabled && (
              <MessageCircle className="w-3 h-3 text-accent ml-2" />
            )}
          </div>
        </div>
      </div>

      {showActions && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(contact.id)}
          className="text-muted-foreground hover:text-primary"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};
