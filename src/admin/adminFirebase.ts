import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  type DocumentData
} from 'firebase/firestore';
import { app, ADMIN_EMAIL, ADMIN_EMAILS } from '../lib/firebase';
import type { RawContent, RawDoc } from '../content/model';
import type { buildAll } from '../content/contentUtils';

// Everything here lives in the lazy-loaded admin chunk, so visitors never download it.
export const auth = getAuth(app);
export const db = getFirestore(app);

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem('sm_admin_token');
  } catch {
    return null;
  }
}

export function isAdminUser(user: User | null): user is User {
  return !!user && (ADMIN_EMAILS.includes(user.email ?? '') || user.uid === 'mysql-admin');
}

// Development-only shortcut for checking the dashboard layout without signing in.
const DEV_PREVIEW = import.meta.env.DEV;
const devUser = { email: ADMIN_EMAIL, displayName: 'Preview', uid: 'dev-preview' } as User;
const devPreviewOn = () => {
  try {
    return DEV_PREVIEW && sessionStorage.getItem('sm_dev_admin') === '1';
  } catch {
    return false;
  }
};

/** Current admin user (supports both MySQL token auth and Firebase auth). */
export function useAuthUser() {
  const [state, setState] = useState<{ user: User | null; ready: boolean }>(() => {
    if (devPreviewOn()) return { user: devUser, ready: true };
    const token = getAdminToken();
    const savedUser = localStorage.getItem('sm_admin_user');
    if (token && savedUser) {
      try {
        const u = JSON.parse(savedUser) as { email: string; displayName?: string };
        return {
          user: {
            email: u.email,
            displayName: u.displayName || 'Steven IMANZI',
            uid: 'mysql-admin'
          } as User,
          ready: true
        };
      } catch {
        /* invalid storage */
      }
    }
    return { user: null, ready: false };
  });

  useEffect(() => {
    if (devPreviewOn()) return;
    if (getAdminToken()) return;
    return onAuthStateChanged(auth, user => setState({ user, ready: true }));
  }, []);

  return state;
}

export function logOut() {
  try {
    localStorage.removeItem('sm_admin_token');
    localStorage.removeItem('sm_admin_user');
  } catch {
    /* ignore */
  }
  return signOut(auth).catch(() => {});
}

/** Update message read state in MySQL or Firestore */
export async function updateMessageStatus(id: string, read: boolean) {
  const token = getAdminToken();
  if (token) {
    const res = await fetch('/api/messages.php', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: Number(id), read })
    });
    if (!res.ok) throw new Error('Could not update message in MySQL');
    window.dispatchEvent(new CustomEvent('sm_data_updated'));
    return;
  }
  const { updateDoc } = await import('firebase/firestore');
  return updateDoc(doc(db, 'messages', id), { read });
}

/** Delete message in MySQL or Firestore */
export async function deleteMessage(id: string) {
  const token = getAdminToken();
  if (token) {
    const res = await fetch(`/api/messages.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Could not delete message in MySQL');
    window.dispatchEvent(new CustomEvent('sm_data_updated'));
    return;
  }
  return deleteDoc(doc(db, 'messages', id));
}

/** Live list of documents in a collection. */
export function useLiveCollection(name: string) {
  const [state, setState] = useState<{ docs: RawDoc[]; loaded: boolean; error: string }>({
    docs: [],
    loaded: false,
    error: ''
  });

  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      // If signed into MySQL backend, content is handled through AdminData
      return;
    }
    return onSnapshot(
      collection(db, name),
      snap => setState({ docs: snap.docs.map(d => ({ id: d.id, ...d.data() }) as RawDoc), loaded: true, error: '' }),
      () => setState(s => ({ ...s, loaded: true, error: `Could not load "${name}".` }))
    );
  }, [name]);

  return state;
}

/** Live single document. */
export function useLiveDoc<T = DocumentData>(collectionName: string, id: string) {
  const [state, setState] = useState<{ data: T | null; loaded: boolean; error: string }>({
    data: null,
    loaded: false,
    error: ''
  });

  useEffect(() => {
    const token = getAdminToken();
    if (token) return;
    return onSnapshot(
      doc(db, collectionName, id),
      snap => setState({ data: snap.exists() ? (snap.data() as T) : null, loaded: true, error: '' }),
      () => setState(s => ({ ...s, loaded: true, error: `Could not load "${collectionName}/${id}".` }))
    );
  }, [collectionName, id]);

  return state;
}

/** Replace a whole document (or create it when `id` is null). */
export async function saveItem(collectionName: string, id: string | null, data: Record<string, unknown>) {
  const token = getAdminToken();
  if (token) {
    const type = collectionName === 'projects' ? 'project' : collectionName === 'services' ? 'service' : 'testimonial';
    const itemId = id || (typeof data.id === 'string' && data.id) || `${collectionName.slice(0, 3)}-${Date.now()}`;
    const res = await fetch('/api/content.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type,
        item: { ...data, id: itemId }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Could not save ${collectionName} to MySQL.`);
    }
    window.dispatchEvent(new CustomEvent('sm_data_updated'));
    return;
  }

  const now = Date.now();
  return id
    ? setDoc(doc(db, collectionName, id), { ...data, updatedAt: now })
    : addDoc(collection(db, collectionName), { ...data, createdAt: now, updatedAt: now });
}

/** Change only some fields of a document. */
export async function patchItem(collectionName: string, id: string, data: Record<string, unknown>) {
  const token = getAdminToken();
  if (token) {
    const type = collectionName === 'projects' ? 'project' : collectionName === 'services' ? 'service' : 'testimonial';
    const res = await fetch('/api/content.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type,
        item: { ...data, id }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Could not update ${collectionName} in MySQL.`);
    }
    window.dispatchEvent(new CustomEvent('sm_data_updated'));
    return;
  }

  return setDoc(doc(db, collectionName, id), { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function removeItem(collectionName: string, id: string) {
  const token = getAdminToken();
  if (token) {
    const type = collectionName === 'projects' ? 'project' : collectionName === 'services' ? 'service' : 'testimonial';
    const res = await fetch(`/api/content.php?type=${type}&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Could not remove ${collectionName} in MySQL.`);
    }
    window.dispatchEvent(new CustomEvent('sm_data_updated'));
    return;
  }

  return deleteDoc(doc(db, collectionName, id));
}

/** Site-wide settings documents live in the `settings` collection. */
export async function saveSetting(id: 'site' | 'seo', data: Record<string, unknown>) {
  const token = getAdminToken();
  if (token) {
    const res = await fetch('/api/content.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'settings',
        settingId: id,
        data
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `Could not save setting ${id} to MySQL.`);
    }
    window.dispatchEvent(new CustomEvent('sm_data_updated'));
    return;
  }

  return setDoc(doc(db, 'settings', id), { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function resetSetting(id: 'site' | 'seo') {
  const token = getAdminToken();
  if (token) {
    // MySQL settings can be updated or left default
    window.dispatchEvent(new CustomEvent('sm_data_updated'));
    return;
  }

  return deleteDoc(doc(db, 'settings', id));
}

/** How many pieces of website content still only exist in the code, not in the database. */
export function countPendingImport(all: ReturnType<typeof buildAll>, raw: RawContent) {
  const builtin = (items: { source: string }[]) => items.filter(i => i.source === 'builtin').length;
  return builtin(all.services) + builtin(all.projects) + builtin(all.testimonials) + (raw.site ? 0 : 1) + (raw.seo ? 0 : 1);
}

/** Saves the website's current content into the database. */
export async function importBuiltins(all: ReturnType<typeof buildAll>, raw: RawContent) {
  const token = getAdminToken();
  if (token) {
    // For MySQL, built-ins are already seeded or can be synced via /api/content.php
    for (const s of all.services) {
      await saveItem('services', s.id, s as unknown as Record<string, unknown>);
    }
    for (const p of all.projects) {
      await saveItem('projects', p.id, p as unknown as Record<string, unknown>);
    }
    for (const t of all.testimonials) {
      await saveItem('testimonials', t.id, t as unknown as Record<string, unknown>);
    }
    if (all.site) await saveSetting('site', all.site as unknown as Record<string, unknown>);
    if (all.seo) await saveSetting('seo', all.seo as unknown as Record<string, unknown>);
    return all.services.length + all.projects.length + all.testimonials.length + 2;
  }

  const batch = writeBatch(db);
  const now = Date.now();
  let count = 0;

  all.services.filter(i => i.source === 'builtin').forEach(i => {
    batch.set(doc(db, 'services', `b-${i.id}`), {
      builtinId: i.id, title: i.title, tag: i.tag, summary: i.summary, details: i.details,
      image: i.image, published: true, deleted: false, order: i.order, updatedAt: now
    });
    count++;
  });
  all.projects.filter(i => i.source === 'builtin').forEach(i => {
    batch.set(doc(db, 'projects', `b-${i.id}`), {
      builtinId: i.id, name: i.name, type: i.type, description: i.description, link: i.link,
      images: i.images, published: true, deleted: false, order: i.order, updatedAt: now
    });
    count++;
  });
  all.testimonials.filter(i => i.source === 'builtin').forEach(i => {
    batch.set(doc(db, 'testimonials', `b-${i.id}`), {
      builtinId: i.id, name: i.name, role: i.role, text: i.text,
      published: true, deleted: false, order: i.order, updatedAt: now
    });
    count++;
  });
  if (!raw.site) {
    batch.set(doc(db, 'settings', 'site'), { ...all.site, updatedAt: now });
    count++;
  }
  if (!raw.seo) {
    batch.set(doc(db, 'settings', 'seo'), { ...all.seo, updatedAt: now });
    count++;
  }

  if (count > 0) await batch.commit();
  return count;
}
