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
import { app, ADMIN_EMAIL } from '../lib/firebase';
import type { RawContent, RawDoc } from '../content/model';
import type { buildAll } from '../content/ContentContext';

// Everything here lives in the lazy-loaded admin chunk, so visitors never download it.
export const auth = getAuth(app);
export const db = getFirestore(app);

export function isAdminUser(user: User | null): user is User {
  return !!user && user.email === ADMIN_EMAIL;
}

// Development-only shortcut for checking the dashboard layout without signing in.
// `import.meta.env.DEV` is false in production builds, so this code is removed from the live site.
const DEV_PREVIEW = import.meta.env.DEV;
const devUser = { email: ADMIN_EMAIL, displayName: 'Preview', uid: 'dev-preview' } as User;
const devPreviewOn = () => {
  try {
    return DEV_PREVIEW && sessionStorage.getItem('sm_dev_admin') === '1';
  } catch {
    return false;
  }
};

/** Current Firebase user. `ready` is false until Firebase has restored the session. */
export function useAuthUser() {
  const [state, setState] = useState<{ user: User | null; ready: boolean }>(() =>
    devPreviewOn() ? { user: devUser, ready: true } : { user: null, ready: false }
  );

  useEffect(() => {
    if (devPreviewOn()) return;
    return onAuthStateChanged(auth, user => setState({ user, ready: true }));
  }, []);

  return state;
}

export function logOut() {
  return signOut(auth);
}

/** Live list of documents in a collection. */
export function useLiveCollection(name: string) {
  const [state, setState] = useState<{ docs: RawDoc[]; loaded: boolean; error: string }>({
    docs: [],
    loaded: false,
    error: ''
  });

  useEffect(() => {
    return onSnapshot(
      collection(db, name),
      snap => setState({ docs: snap.docs.map(d => ({ id: d.id, ...d.data() }) as RawDoc), loaded: true, error: '' }),
      () => setState(s => ({ ...s, loaded: true, error: `Could not load "${name}".` }))
    );
  }, [name]);

  return state;
}

/** Live single document (returns null when it does not exist yet). */
export function useLiveDoc<T = DocumentData>(collectionName: string, id: string) {
  const [state, setState] = useState<{ data: T | null; loaded: boolean; error: string }>({
    data: null,
    loaded: false,
    error: ''
  });

  useEffect(() => {
    return onSnapshot(
      doc(db, collectionName, id),
      snap => setState({ data: snap.exists() ? (snap.data() as T) : null, loaded: true, error: '' }),
      () => setState(s => ({ ...s, loaded: true, error: `Could not load "${collectionName}/${id}".` }))
    );
  }, [collectionName, id]);

  return state;
}

/** Replace a whole document (or create it when `id` is null). */
export function saveItem(collectionName: string, id: string | null, data: Record<string, unknown>) {
  const now = Date.now();
  return id
    ? setDoc(doc(db, collectionName, id), { ...data, updatedAt: now })
    : addDoc(collection(db, collectionName), { ...data, createdAt: now, updatedAt: now });
}

/** Change only some fields of a document (creates it if needed). */
export function patchItem(collectionName: string, id: string, data: Record<string, unknown>) {
  return setDoc(doc(db, collectionName, id), { ...data, updatedAt: Date.now() }, { merge: true });
}

export function removeItem(collectionName: string, id: string) {
  return deleteDoc(doc(db, collectionName, id));
}

/** Site-wide settings documents live in the `settings` collection. */
export function saveSetting(id: 'site' | 'seo', data: Record<string, unknown>) {
  return setDoc(doc(db, 'settings', id), { ...data, updatedAt: Date.now() }, { merge: true });
}

export function resetSetting(id: 'site' | 'seo') {
  return deleteDoc(doc(db, 'settings', id));
}

/** How many pieces of website content still only exist in the code, not in the database. */
export function countPendingImport(all: ReturnType<typeof buildAll>, raw: RawContent) {
  const builtin = (items: { source: string }[]) => items.filter(i => i.source === 'builtin').length;
  return builtin(all.services) + builtin(all.projects) + builtin(all.testimonials) + (raw.site ? 0 : 1) + (raw.seo ? 0 : 1);
}

/** Saves the website's current content into the database so the dashboard manages real data. */
export async function importBuiltins(all: ReturnType<typeof buildAll>, raw: RawContent) {
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
