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
