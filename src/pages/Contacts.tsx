import { useState } from 'react';
import { ArrowLeft, Plus, UserPlus, AlertTriangle, Contact as LucideContact, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EmergencyContactCard } from '@/components/EmergencyContactCard';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { toast } from 'sonner';


const Contacts = () => {
  const navigate = useNavigate();
  const { contacts, addContact, deleteContact, hasMinimumContacts } = useEmergencyContacts();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',

  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.relationship) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Format with +91
    const contactToAdd = {
      ...formData,
      phone: `+91${formData.phone}`
    };

    await addContact(contactToAdd);
    setFormData({ name: '', phone: '', relationship: '' });
    setShowForm(false);
    // Hook already toasts success
  };

  const handleDelete = async (id: string) => {
    await deleteContact(id);
    // Hook already toasts success
  };

  const handlePickContact = () => {
    navigate('/contacts/select');
  };

  return (
    <div className="flex flex-col bg-background min-h-full">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 border-b border-border/10 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">Safe Nodes</h1>
            <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest">
              {hasMinimumContacts
                ? `${contacts.length} SECURE CONNECTIONS`
                : `ADD ${2 - contacts.length} MORE FOR SYSTEM OPS`}
            </p>
          </div>
        </div>
      </header>

      <main className="overflow-y-auto px-4 py-6 space-y-6">
        {/* Add button or form */}
        {showForm ? (
          <form onSubmit={handleSubmit} className="glass-card rounded-[2.5rem] p-6 space-y-5 border-2 border-primary/10 shadow-premium">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-foreground uppercase tracking-tight">Initialize New Node</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePickContact}
                  className="rounded-full font-bold h-8 text-[10px]"
                >
                  <LucideContact className="w-3 h-3 mr-1" /> Pick
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="rounded-full font-bold"
                >
                  Cancel
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Codename / Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Sentinel One"
                  className="rounded-2xl bg-muted/30 border-none h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Universal Phone ID</Label>
                <div className="flex gap-2">
                  <Input
                    value="+91"
                    disabled
                    className="w-16 text-center rounded-2xl bg-muted/50 border-none font-bold"
                  />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="98765 43210"
                    className="flex-1 rounded-2xl bg-muted/30 border-none h-12 font-bold"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase tracking-widest ml-1">Node Relationship</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="e.g. Primary Support"
                  className="rounded-2xl bg-muted/30 border-none h-12"
                />
              </div>


            </div>

            <Button type="submit" className="w-full h-14 rounded-[1.5rem] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-glow-red">
              <UserPlus className="w-5 h-5 mr-2" />
              Activate Node
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowForm(true)}
                className="col-span-1 h-16 text-sm font-black uppercase tracking-widest rounded-[2rem] border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-primary transition-all shadow-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Manual Add
              </Button>
              <Button
                onClick={handlePickContact}
                className="col-span-1 h-16 text-sm font-black uppercase tracking-widest rounded-[2rem] bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-all shadow-sm border border-secondary"
              >
                <LucideContact className="w-5 h-5 mr-2" />
                From Phone
              </Button>
            </div>
          </div>
        )}

        {/* Contacts list */}
        <div className="space-y-4 pb-12">
          {contacts.map((contact) => (
            <EmergencyContactCard
              key={contact.id}
              contact={contact}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {contacts.length === 0 && !showForm && (
          <div className="text-center py-16 px-8">
            <div className="w-20 h-20 rounded-[2rem] bg-muted flex items-center justify-center mx-auto mb-6 shadow-premium">
              <UserPlus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-black text-foreground mb-2 italic">No Guardian Nodes Detected</h3>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider leading-relaxed">
              Minimum of 2 active Guardian Nodes required for Guardian Mode activation.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Contacts;
