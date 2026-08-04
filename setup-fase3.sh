#!/bin/bash
# =============================================================================
# SETUP FASE 3 — Módulo Contacts
# =============================================================================
# Reescreve a Agenda de Contatos em Tailwind + DaisyUI
# Integra ao backend unificado com auth por sessão
# =============================================================================

set -e

echo "📇 FASE 3 — Módulo Contacts"
echo "============================="
echo ""

cd ~/Sites/github/01-PI-planner/unified-platform

CONTACTS_DST="src/modules/contacts"
AGENDA_SRC="../Agenda-em-react-js"

# -----------------------------------------------------------------------------
# 1. COPIAR HOOKS DA AGENDA (se existirem)
# -----------------------------------------------------------------------------
echo "📦 1. Copiando hooks da Agenda..."

mkdir -p "$CONTACTS_DST/hooks"

if [ -d "$AGENDA_SRC/front/src/hooks" ]; then
    cp "$AGENDA_SRC/front/src/hooks/"* "$CONTACTS_DST/hooks/" 2>/dev/null || true
    echo "   ✅ Hooks copiados da Agenda"
elif [ -d "$AGENDA_SRC/src/hooks" ]; then
    cp "$AGENDA_SRC/src/hooks/"* "$CONTACTS_DST/hooks/" 2>/dev/null || true
    echo "   ✅ Hooks copiados da Agenda"
else
    echo "   ⚠️  Hooks não encontrados na Agenda. Criando do zero..."
fi

# Garantir que os hooks existam (criar se faltarem)
if [ ! -f "$CONTACTS_DST/hooks/useCEP.ts" ]; then
    cat > "$CONTACTS_DST/hooks/useCEP.ts" << 'EOFHOOK'
import { useState, useCallback } from 'react';

export interface AddressData {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export function useCEP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAddress = useCallback(async (cep: string): Promise<AddressData | null> => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) {
      setError('CEP inválido');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await res.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }

      return {
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
      };
    } catch {
      setError('Erro ao buscar CEP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchAddress, loading, error };
}
EOFHOOK
    echo "   ✅ useCEP.ts criado"
fi

if [ ! -f "$CONTACTS_DST/hooks/usePhoneMask.ts" ]; then
    cat > "$CONTACTS_DST/hooks/usePhoneMask.ts" << 'EOFHOOK'
import { useState, useCallback } from 'react';

export function usePhoneMask() {
  const [value, setValue] = useState('');

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 10) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }

    setValue(v);
  }, []);

  const setPhone = useCallback((phone: string) => {
    setValue(phone);
  }, []);

  return { value, onChange, setPhone };
}
EOFHOOK
    echo "   ✅ usePhoneMask.ts criado"
fi

if [ ! -f "$CONTACTS_DST/hooks/useDateMask.ts" ]; then
    cat > "$CONTACTS_DST/hooks/useDateMask.ts" << 'EOFHOOK'
import { useState, useCallback } from 'react';

export function useDateMask() {
  const [value, setValue] = useState('');

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 8) v = v.slice(0, 8);

    if (v.length > 4) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length > 2) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }

    setValue(v);
  }, []);

  const setDate = useCallback((date: string) => {
    setValue(date);
  }, []);

  return { value, onChange, setDate };
}
EOFHOOK
    echo "   ✅ useDateMask.ts criado"
fi

# -----------------------------------------------------------------------------
# 2. TIPOS
# -----------------------------------------------------------------------------
echo "📦 2. Criando tipos..."

mkdir -p "$CONTACTS_DST/types"

cat > "$CONTACTS_DST/types/contact.types.ts" << 'EOFTYPE'
export interface Contact {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  created_at: string;
  updated_at: string;
}

export interface ContactInput {
  name: string;
  phone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}
EOFTYPE

echo "   ✅ contact.types.ts criado"

# -----------------------------------------------------------------------------
# 3. SERVICE (API Client)
# -----------------------------------------------------------------------------
echo "📦 3. Criando service de API..."

mkdir -p "$CONTACTS_DST/services"

cat > "$CONTACTS_DST/services/contactService.ts" << 'EOFSVC'
import type { Contact, ContactInput } from '../types/contact.types';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3101';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 401) {
    throw new Error('Não autenticado');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro na requisição');
  }

  return res.json();
}

export const contactService = {
  list: (): Promise<Contact[]> => fetchWithAuth('/api/contacts'),
  create: (data: ContactInput): Promise<Contact> =>
    fetchWithAuth('/api/contacts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: ContactInput): Promise<Contact> =>
    fetchWithAuth(`/api/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number): Promise<{ message: string }> =>
    fetchWithAuth(`/api/contacts/${id}`, { method: 'DELETE' }),
};
EOFSVC

echo "   ✅ contactService.ts criado"

# -----------------------------------------------------------------------------
# 4. STORE (Zustand)
# -----------------------------------------------------------------------------
echo "📦 4. Criando store Zustand..."

mkdir -p "$CONTACTS_DST/store"

cat > "$CONTACTS_DST/store/useContactStore.ts" << 'EOFSTORE'
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
EOFSTORE

echo "   ✅ useContactStore.ts criado"

# -----------------------------------------------------------------------------
# 5. COMPONENTES
# -----------------------------------------------------------------------------
echo "📦 5. Criando componentes..."

mkdir -p "$CONTACTS_DST/components"

cat > "$CONTACTS_DST/components/ContactForm.tsx" << 'EOFCOMP'
import { useState, useEffect } from 'react';
import { X, Save, Search } from 'lucide-react';
import { useCEP } from '../hooks/useCEP';
import { usePhoneMask } from '../hooks/usePhoneMask';
import type { Contact, ContactInput } from '../types/contact.types';

interface Props {
  contact?: Contact | null;
  onSave: (data: ContactInput) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ContactForm({ contact, onSave, onCancel, loading }: Props) {
  const [form, setForm] = useState<ContactInput>({
    name: '',
    phone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
  });

  const { fetchAddress, loading: cepLoading } = useCEP();
  const phoneMask = usePhoneMask();

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        cep: contact.cep,
        logradouro: contact.logradouro,
        numero: contact.numero,
        bairro: contact.bairro,
        cidade: contact.cidade,
        uf: contact.uf,
      });
      phoneMask.setPhone(contact.phone);
    }
  }, [contact]);

  const handleChange = (field: keyof ContactInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCEPBlur = async () => {
    const cleanCEP = form.cep.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      const address = await fetchAddress(cleanCEP);
      if (address) {
        setForm((prev) => ({
          ...prev,
          logradouro: address.logradouro,
          bairro: address.bairro,
          cidade: address.cidade,
          uf: address.uf,
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, phone: phoneMask.value });
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title">{contact ? 'Editar Contato' : 'Novo Contato'}</h3>
          <button onClick={onCancel} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Nome *</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Telefone</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={phoneMask.value}
                onChange={phoneMask.onChange}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input
                type="email"
                className="input input-bordered"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">CEP</span></label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={form.cep}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  onBlur={handleCEPBlur}
                  placeholder="00000-000"
                />
                {cepLoading && <span className="loading loading-spinner" />}
              </div>
            </div>

            <div className="form-control md:col-span-2">
              <label className="label"><span className="label-text">Logradouro</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={form.logradouro}
                onChange={(e) => handleChange('logradouro', e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Número</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={form.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Bairro</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={form.bairro}
                onChange={(e) => handleChange('bairro', e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Cidade</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={form.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">UF</span></label>
              <input
                type="text"
                className="input input-bordered w-20"
                value={form.uf}
                onChange={(e) => handleChange('uf', e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
          </div>

          <div className="card-actions justify-end mt-4">
            <button type="button" onClick={onCancel} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
EOFCOMP

cat > "$CONTACTS_DST/components/ContactCard.tsx" << 'EOFCOMP'
import { Phone, Mail, MapPin, Pencil, Trash2 } from 'lucide-react';
import type { Contact } from '../types/contact.types';

interface Props {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
  deleting: boolean;
}

export default function ContactCard({ contact, onEdit, onDelete, deleting }: Props) {
  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{contact.name}</h3>
            <div className="flex flex-col gap-1 mt-2 text-sm text-gray-500">
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {contact.phone}
                </span>
              )}
              {contact.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {contact.email}
                </span>
              )}
              {(contact.logradouro || contact.cidade) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {contact.logradouro}{contact.numero ? `, ${contact.numero}` : ''}
                  {contact.bairro ? ` - ${contact.bairro}` : ''}
                  {contact.cidade ? `, ${contact.cidade}` : ''}
                  {contact.uf ? `/${contact.uf}` : ''}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(contact)}
              className="btn btn-ghost btn-sm btn-circle"
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(contact.id)}
              className="btn btn-ghost btn-sm btn-circle text-error"
              title="Excluir"
              disabled={deleting}
            >
              {deleting ? <span className="loading loading-spinner loading-xs" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
EOFCOMP

cat > "$CONTACTS_DST/components/ContactList.tsx" << 'EOFCOMP'
import { Search, Users, Plus } from 'lucide-react';
import { useState } from 'react';
import ContactCard from './ContactCard';
import type { Contact } from '../types/contact.types';

interface Props {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  deletingId: number | null;
}

export default function ContactList({ contacts, onEdit, onDelete, onAdd, deletingId }: Props) {
  const [search, setSearch] = useState('');

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cidade?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar contato..."
            className="input input-bordered w-full pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Novo Contato
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg text-gray-500">
            {search ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
          </p>
          {!search && (
            <button onClick={onAdd} className="btn btn-outline mt-4">
              <Plus className="w-4 h-4" /> Adicionar primeiro contato
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={onEdit}
              onDelete={onDelete}
              deleting={deletingId === contact.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
EOFCOMP

echo "   ✅ Components criados"

# -----------------------------------------------------------------------------
# 6. PÁGINA
# -----------------------------------------------------------------------------
echo "📦 6. Criando ContactsPage..."

cat > "$CONTACTS_DST/pages/ContactsPage.tsx" << 'EOFPAGE'
import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useContactStore } from '../store/useContactStore';
import ContactList from '../components/ContactList';
import ContactForm from '../components/ContactForm';
import type { Contact, ContactInput } from '../types/contact.types';

export default function ContactsPage() {
  const { contacts, loading, error, fetchContacts, createContact, updateContact, deleteContact, clearError } = useContactStore();
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSave = async (data: ContactInput) => {
    try {
      if (editingContact) {
        await updateContact(editingContact.id, data);
      } else {
        await createContact(data);
      }
      setShowForm(false);
      setEditingContact(null);
    } catch {
      // erro já está na store
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteContact(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContact(null);
    clearError();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Contatos</h1>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button onClick={clearError} className="btn btn-ghost btn-sm">×</button>
        </div>
      )}

      {showForm ? (
        <ContactForm
          contact={editingContact}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      ) : (
        <ContactList
          contacts={contacts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => setShowForm(true)}
          deletingId={deletingId}
        />
      )}
    </div>
  );
}
EOFPAGE

echo "   ✅ ContactsPage.tsx criado"

# -----------------------------------------------------------------------------
# 7. AUTH STORE (Zustand)
# -----------------------------------------------------------------------------
echo "📦 7. Criando auth store..."

mkdir -p src/store

cat > src/store/useAuthStore.ts << 'EOFSTORE'
import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3101';

interface User {
  id: number;
  username: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string;
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: '',

  checkAuth: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const user = await res.json();
        set({ user });
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: '' });
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login falhou');
      set({ user: data.user, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  register: async (username, password) => {
    set({ loading: true, error: '' });
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registro falhou');
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    set({ user: null });
  },

  clearError: () => set({ error: '' }),
}));
EOFSTORE

echo "   ✅ useAuthStore.ts criado"

# -----------------------------------------------------------------------------
# 8. PROTECTED ROUTE
# -----------------------------------------------------------------------------
echo "📦 8. Criando ProtectedRoute..."

mkdir -p src/components

cat > src/components/ProtectedRoute.tsx << 'EOFCOMP'
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!user) checkAuth();
  }, [user, checkAuth]);

  if (user === null && location.pathname !== '/login') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
EOFCOMP

echo "   ✅ ProtectedRoute.tsx criado"

# -----------------------------------------------------------------------------
# 9. LOGIN PAGE
# -----------------------------------------------------------------------------
echo "📦 9. Criando LoginPage..."

mkdir -p src/pages

cat > src/pages/LoginPage.tsx << 'EOFPAGE'
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      if (isRegister) {
        await register(username, password);
        setIsRegister(false);
      } else {
        await login(username, password);
        navigate(from, { replace: true });
      }
    } catch {
      // erro já está na store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-6">
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Usuário</span></label>
              <input
                type="text"
                className="input input-bordered"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Senha</span></label>
              <input
                type="password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isRegister ? (
                <><UserPlus className="w-5 h-5" /> Criar conta</>
              ) : (
                <><LogIn className="w-5 h-5" /> Entrar</>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => { setIsRegister(!isRegister); clearError(); }}
              className="btn btn-link"
            >
              {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
EOFPAGE

echo "   ✅ LoginPage.tsx criado"

# -----------------------------------------------------------------------------
# 10. INSTRUÇÕES MANUAIS
# -----------------------------------------------------------------------------
echo ""
echo "=============================="
echo "📋 INSTRUÇÕES MANUAIS NECESSÁRIAS"
echo "=============================="
echo ""
echo "O script não pode editar automaticamente os arquivos existentes."
echo "Você precisa editar:"
echo ""
echo "1️⃣  ADICIONAR ROTA /contacts (protegida) e /login"
echo "   Edite: src/routes/AppRoutes.tsx (ou src/App.tsx)"
echo ""
echo "   import ContactsPage from '../modules/contacts/pages/ContactsPage';"
echo "   import LoginPage from '../pages/LoginPage';"
echo "   import ProtectedRoute from '../components/ProtectedRoute';"
echo ""
echo "   <Route path="/login" element={<LoginPage />} />"
echo "   <Route path="/contacts" element={"
echo "     <ProtectedRoute>"
echo "       <ContactsPage />"
echo "     </ProtectedRoute>"
echo "   } />"
echo ""
echo "2️⃣  ADICIONAR ITEM NA SIDEBAR"
echo "   Edite: src/layouts/Sidebar.tsx"
echo ""
echo "   import { Users } from 'lucide-react';"
echo ""
echo "   <Link to="/contacts" className="...">"
echo "     <Users className="w-5 h-5" />"
echo "     <span>Contatos</span>"
echo "   </Link>"
echo ""
echo "3️⃣  ADICIONAR LOGOUT NO HEADER/SIDEBAR (opcional)"
echo "   import { useAuthStore } from '../store/useAuthStore';"
echo "   const { user, logout } = useAuthStore();"
echo "   {user && <button onClick={logout}>Sair</button>}"
echo ""
echo "4️⃣  ADICIONAR VITE_API_BASE_URL no .env (se não existir)"
echo "   VITE_API_BASE_URL=http://localhost:3101"
echo ""
echo "=============================="
echo "✅ FASE 3 — Código gerado!"
echo "=============================="
echo ""
echo "Arquivos criados em: $CONTACTS_DST"
find "$CONTACTS_DST" -type f | sort
echo ""
echo "Também criados:"
echo "  src/store/useAuthStore.ts"
echo "  src/components/ProtectedRoute.tsx"
echo "  src/pages/LoginPage.tsx"
echo ""
echo "Próximos passos:"
echo "  1. Edite src/routes/AppRoutes.tsx (rotas /login e /contacts)"
echo "  2. Edite src/layouts/Sidebar.tsx (link Contatos)"
echo "  3. npm run dev para testar"
echo "  4. git add . && git commit -m 'fase-3: modulo contacts + auth frontend'"
echo "  5. git push origin main"
