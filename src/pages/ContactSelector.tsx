import { useState, useEffect } from 'react';
import { ArrowLeft, Search, UserPlus, Phone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Contacts as PhoneContacts } from '@capacitor-community/contacts';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { toast } from 'sonner';

interface PhoneContact {
    contactId: string;
    displayName: string;
    phoneNumbers: { number: string }[];
}

const ContactSelector = () => {
    const navigate = useNavigate();
    const { contacts: emergencyContacts, addContact } = useEmergencyContacts();
    const [phoneContacts, setPhoneContacts] = useState<PhoneContact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<PhoneContact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadPhoneContacts();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredContacts(phoneContacts);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredContacts(
                phoneContacts.filter(contact =>
                    contact.displayName.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, phoneContacts]);

    const loadPhoneContacts = async () => {
        try {
            setLoading(true);

            // Request permission
            const perm = await PhoneContacts.requestPermissions();
            if (perm.contacts !== 'granted') {
                toast.error('Contact permission denied');
                navigate('/contacts');
                return;
            }

            // Get all contacts
            const result = await PhoneContacts.getContacts({
                projection: {
                    name: true,
                    phones: true,
                }
            });

            if (result && result.contacts) {
                // Filter contacts that have phone numbers
                const contactsWithPhones = result.contacts
                    .filter((c: any) => c.phones && c.phones.length > 0)
                    .map((c: any) => ({
                        contactId: c.contactId,
                        displayName: c.displayName || c.givenName || 'Unknown',
                        phoneNumbers: c.phones.map((p: any) => ({ number: p.number }))
                    }))
                    .sort((a, b) => a.displayName.localeCompare(b.displayName));

                setPhoneContacts(contactsWithPhones);
                setFilteredContacts(contactsWithPhones);
            }
        } catch (e) {
            console.error('Failed to load contacts:', e);
            toast.error('Failed to load phone contacts');
        } finally {
            setLoading(false);
        }
    };

    const formatPhoneNumber = (phone: string): string => {
        // Remove all non-digits
        let cleaned = phone.replace(/[^0-9]/g, '');

        // Extract 10-digit Indian number
        if (cleaned.length > 10) {
            if (cleaned.startsWith('91') && cleaned.length === 12) {
                cleaned = cleaned.substring(2);
            } else if (cleaned.startsWith('0') && cleaned.length === 11) {
                cleaned = cleaned.substring(1);
            } else {
                cleaned = cleaned.slice(-10);
            }
        }

        return cleaned;
    };

    const toggleContact = (contactId: string) => {
        const newSelected = new Set(selectedContacts);
        if (newSelected.has(contactId)) {
            newSelected.delete(contactId);
        } else {
            newSelected.add(contactId);
        }
        setSelectedContacts(newSelected);
    };

    const handleAddSelected = async () => {
        if (selectedContacts.size === 0) {
            toast.error('Please select at least one contact');
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const contactId of selectedContacts) {
            const contact = phoneContacts.find(c => c.contactId === contactId);
            if (!contact) continue;

            // Get first phone number
            const phoneNumber = contact.phoneNumbers[0]?.number;
            if (!phoneNumber) continue;

            const formattedPhone = formatPhoneNumber(phoneNumber);

            if (formattedPhone.length !== 10) {
                failCount++;
                continue;
            }

            // Check if already added
            const alreadyExists = emergencyContacts.some(
                ec => ec.phone === `+91${formattedPhone}`
            );

            if (alreadyExists) {
                failCount++;
                continue;
            }

            try {
                await addContact({
                    name: contact.displayName,
                    phone: `+91${formattedPhone}`,
                    relationship: 'Emergency Contact'
                });
                successCount++;
            } catch (e) {
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Added ${successCount} contact(s) successfully!`);
            navigate('/contacts');
        }
        if (failCount > 0) {
            toast.warning(`${failCount} contact(s) skipped (invalid or duplicate)`);
        }
    };

    const isContactAdded = (contact: PhoneContact): boolean => {
        const phoneNumber = contact.phoneNumbers[0]?.number;
        if (!phoneNumber) return false;

        const formatted = formatPhoneNumber(phoneNumber);
        return emergencyContacts.some(ec => ec.phone === `+91${formatted}`);
    };

    return (
        <div className="flex flex-col bg-background min-h-full">
            {/* Header */}
            <header className="px-5 pt-6 pb-4 border-b border-border/10 bg-background/60 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate('/contacts')}
                        className="p-2 -ml-2 rounded-xl hover:bg-secondary/50 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-foreground tracking-tight">
                            Select Contacts
                        </h1>
                        <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest">
                            {selectedContacts.size} SELECTED
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search contacts..."
                        className="pl-12 h-12 rounded-2xl bg-muted/30 border-none"
                    />
                </div>
            </header>

            {/* Contact List */}
            <main className="flex-1 overflow-y-auto px-4 py-4">
                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground font-bold">
                            Loading phone contacts...
                        </p>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-16 px-8">
                        <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-black text-foreground mb-2">
                            {searchQuery ? 'No contacts found' : 'No contacts available'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Make sure you have contacts saved on your phone'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2 pb-24">
                        {filteredContacts.map((contact) => {
                            const isAdded = isContactAdded(contact);
                            const isSelected = selectedContacts.has(contact.contactId);

                            return (
                                <button
                                    key={contact.contactId}
                                    onClick={() => !isAdded && toggleContact(contact.contactId)}
                                    disabled={isAdded}
                                    className={`w-full glass-card rounded-2xl p-4 flex items-center justify-between transition-all ${isAdded
                                            ? 'opacity-50 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-2 border-primary bg-primary/5'
                                                : 'hover:bg-muted/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground'
                                                }`}
                                        >
                                            {contact.displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-foreground">
                                                {contact.displayName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {contact.phoneNumbers[0]?.number}
                                            </p>
                                            {isAdded && (
                                                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                                                    Already Added
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {!isAdded && isSelected && (
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Fixed Bottom Action Button */}
            {selectedContacts.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/10">
                    <Button
                        onClick={handleAddSelected}
                        className="w-full h-14 rounded-[1.5rem] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-glow-red"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add {selectedContacts.size} Contact{selectedContacts.size !== 1 ? 's' : ''}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ContactSelector;
