import { create } from 'zustand';
import { contactService } from '../services/contactService';
import type { Contact, ContactInput } from '../types/contact.types';

interface ContactStore {
  contacts: Contact[];
  loading: boolean;
  error: string;
  fetchContacts: () => Promise<void>;
  createContact: (data: ContactInput) => Promise<void>;
  updateContact: (id: number, data: ContactInput) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  loading: false,
  error: '',

  fetchContacts: async () => {
    set({ loading: true, error: '' });
    try {
      const contacts = await contactService.list();
      set({ contacts, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createContact: async (data) => {
    set({ loading: true, error: '' });
    try {
      const contact = await contactService.create(data);
      set({ contacts: [contact, ...get().contacts], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateContact: async (id, data) => {
    set({ loading: true, error: '' });
    try {
      const contact = await contactService.update(id, data);
      set({
        contacts: get().contacts.map((c) => (c.id === id ? contact : c)),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteContact: async (id) => {
    set({ loading: true, error: '' });
    try {
      await contactService.delete(id);
      set({
        contacts: get().contacts.filter((c) => c.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: '' }),
}));
