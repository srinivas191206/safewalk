import { useState } from 'react';
import { ArrowLeft, Plus, UserPlus, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EmergencyContactCard } from '@/components/EmergencyContactCard';
import { NavBar } from '@/components/NavBar';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { toast } from 'sonner';

const Contacts = () => {
  const { contacts, addContact, deleteContact, hasMinimumContacts } = useEmergencyContacts();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    whatsappEnabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.relationship) {
      toast.error('Please fill in all fields');
      return;
    }

    addContact(formData);
    setFormData({ name: '', phone: '', relationship: '', whatsappEnabled: true });
    setShowForm(false);
    toast.success('Contact added successfully');
  };

  const handleDelete = (id: string) => {
    deleteContact(id);
    toast.success('Contact removed');
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-24">
      {/* Header */}
      <header className="px-4 pt-4 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Emergency Contacts</h1>
            <p className="text-sm text-muted-foreground">
              {hasMinimumContacts
                ? `${contacts.length} contacts configured`
                : 'Add at least 2 contacts'}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-4">
        {/* Add button or form */}
        {showForm ? (
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">Add New Contact</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contact name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="e.g., Parent, Spouse, Friend"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="whatsapp">Enable WhatsApp Alerts</Label>
                  <p className="text-xs text-muted-foreground">Send alerts via WhatsApp too</p>
                </div>
                <Switch
                  id="whatsapp"
                  checked={formData.whatsappEnabled}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, whatsappEnabled: checked }))
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </form>
        ) : (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full h-14 text-base"
            variant="outline"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Emergency Contact
          </Button>
        )}

        {/* Contacts list */}
        <div className="space-y-3">
          {contacts.map((contact) => (
            <EmergencyContactCard
              key={contact.id}
              contact={contact}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {contacts.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No contacts yet</h3>
            <p className="text-sm text-muted-foreground">
              Add at least 2 emergency contacts to use Guardian Mode
            </p>
          </div>
        )}

        {/* Minimum contacts warning */}
        {contacts.length > 0 && !hasMinimumContacts && (
          <div className="glass-card rounded-2xl p-4 border-warning/30">
            <p className="text-sm text-warning text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Add {2 - contacts.length} more contact{2 - contacts.length > 1 ? 's' : ''} to activate Guardian Mode</span>
            </p>
          </div>
        )}
      </main>

      <NavBar />
    </div>
  );
};

export default Contacts;
