import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { collection, limit, onSnapshot, orderBy, query, type Timestamp } from 'firebase/firestore';
import { countPendingImport, db, useLiveCollection, useLiveDoc } from './adminFirebase';
import { buildAll } from '../content/ContentContext';
import type { RawContent } from '../content/model';

export interface MessageDoc {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Timestamp | null;
}

interface AdminDataValue {
  messages: MessageDoc[];
  messagesLoaded: boolean;
  messagesError: string;
  unread: number;
  /** Raw saved documents (what is in the database). */
  raw: RawContent;
  /** Built-in content merged with the saved documents, including hidden items. */
  all: ReturnType<typeof buildAll>;
  contentLoaded: boolean;
  contentError: string;
  /** Built-in items / settings that are not saved in the database yet */
  pendingImport: number;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminData() {
  const value = useContext(AdminDataContext);
  if (!value) throw new Error('useAdminData must be used inside <AdminDataProvider>');
  return value;
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [messagesError, setMessagesError] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(300));
    return onSnapshot(
      q,
      snap => {
        setMessages(
          snap.docs.map(d => ({ id: d.id, ...(d.data({ serverTimestamps: 'estimate' }) as Omit<MessageDoc, 'id'>) }))
        );
        setMessagesLoaded(true);
        setMessagesError('');
      },
      () => {
        setMessagesError('Could not load messages. Check that Firestore is created and the security rules are deployed.');
        setMessagesLoaded(true);
      }
    );
  }, []);

  const services = useLiveCollection('services');
  const projects = useLiveCollection('projects');
  const testimonials = useLiveCollection('testimonials');
  const site = useLiveDoc<NonNullable<RawContent['site']>>('settings', 'site');
  const seo = useLiveDoc<NonNullable<RawContent['seo']>>('settings', 'seo');

  const raw = useMemo<RawContent>(
    () => ({
      services: services.docs,
      projects: projects.docs,
      testimonials: testimonials.docs,
      site: site.data,
      seo: seo.data
    }),
    [services.docs, projects.docs, testimonials.docs, site.data, seo.data]
  );
  const all = useMemo(() => buildAll(raw), [raw]);

  const value: AdminDataValue = {
    messages,
    messagesLoaded,
    messagesError,
    unread: messages.filter(m => !m.read).length,
    raw,
    all,
    contentLoaded: services.loaded && projects.loaded && testimonials.loaded && site.loaded && seo.loaded,
    contentError: services.error || projects.error || testimonials.error || site.error || seo.error,
    pendingImport: countPendingImport(all, raw)
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
