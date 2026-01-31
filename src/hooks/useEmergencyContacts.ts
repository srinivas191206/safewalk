import { useState, useEffect, useCallback } from 'react';
import type { EmergencyContact } from '@/types/emergency';

const CONTACTS_KEY = 'guardian_mode_contacts';

export const useEmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  // Load contacts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONTACTS_KEY);
    if (stored) {
      try {
        setContacts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse contacts:', e);
      }
    }
  }, []);

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const addContact = useCallback((contact: Omit<EmergencyContact, 'id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: crypto.randomUUID(),
    };
    setContacts(prev => [...prev, newContact]);
    return newContact;
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<EmergencyContact>) => {
    setContacts(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    hasMinimumContacts: contacts.length >= 2,
  };
};
