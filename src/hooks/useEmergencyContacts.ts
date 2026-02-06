import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { EmergencyContact } from '@/types/emergency';
import { toast } from 'sonner';

export const useEmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Load contacts from Supabase
  const fetchContacts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Map snake_case DB to camelCase Type
      const mappedContacts: EmergencyContact[] = (data || []).map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        relationship: c.relationship,

      }));

      setContacts(mappedContacts);
    } catch (e) {
      console.error('Error fetching contacts:', e);
      // Fallback to local storage (optional, or just empty)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = useCallback(async (contact: Omit<EmergencyContact, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to add contacts');
        return;
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship,

        })
        .select()
        .single();

      if (error) throw error;

      const newContact: EmergencyContact = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        relationship: data.relationship,

      };

      setContacts(prev => [...prev, newContact]);
      toast.success('Contact saved to cloud');
      return newContact;
    } catch (e: any) {
      console.error('Error adding contact:', e);
      toast.error('Failed to save contact: ' + e.message);
      throw e;
    }
  }, []);

  const updateContact = useCallback(async (id: string, updates: Partial<EmergencyContact>) => {
    // Optimistic update
    setContacts(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));

    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.relationship) dbUpdates.relationship = updates.relationship;


      const { error } = await supabase
        .from('contacts')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Error updating contact:', e);
      toast.error('Failed to update contact');
      // Revert optimistic update? (Simplified: just refetch)
      fetchContacts();
    }
  }, [fetchContacts]);

  const deleteContact = useCallback(async (id: string) => {
    // Optimistic delete
    setContacts(prev => prev.filter(c => c.id !== id));

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Contact deleted');
    } catch (e) {
      console.error('Error deleting contact:', e);
      toast.error('Failed to delete contact');
      fetchContacts();
    }
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    hasMinimumContacts: contacts.length >= 2,
  };
};
