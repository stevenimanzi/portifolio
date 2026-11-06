import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { collection, limit, onSnapshot, orderBy, query, type Timestamp } from 'firebase/firestore';
import { countPendingImport, db, getAdminToken, useLiveCollection, useLiveDoc } from './adminFirebase';
import { buildAll } from '../content/contentUtils';
import type { RawContent, RawDoc } from '../content/model';

export interface MessageDoc {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Timestamp | { toDate: () => Date } | null;
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
  refresh?: () => void;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

// oxlint-disable-next-line react/only-export-components
export function useAdminData() {
  const value = useContext(AdminDataContext);
  if (!value) throw new Error('useAdminData must be used inside <AdminDataProvider>');
  return value;
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const isMysql = Boolean(getAdminToken());

  const [fbMessages, setFbMessages] = useState<MessageDoc[]>([]);
  const [fbMessagesLoaded, setFbMessagesLoaded] = useState(false);
  const [fbMessagesError, setFbMessagesError] = useState('');

  const [apiMessages, setApiMessages] = useState<MessageDoc[]>([]);
  const [apiRaw, setApiRaw] = useState<RawContent>({
    services: [],
    projects: [],
    testimonials: [],
    site: null,
    seo: null
  });
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiError, setApiError] = useState('');

  const loadFromApi = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;

    try {
      const [msgRes, contentRes] = await Promise.all([
        fetch('/api/messages.php', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/content.php')
      ]);

      if (msgRes.ok) {
        const msgs = await msgRes.json();
        setApiMessages(
          (msgs as Array<Record<string, unknown>>).map(m => ({
            id: String(m.id),
            name: String(m.name ?? ''),
            email: String(m.email ?? ''),
            subject: String(m.subject ?? ''),
            message: String(m.message ?? ''),
            read: Boolean(m.read),
            createdAt: m.createdAt ? { toDate: () => new Date(String(m.createdAt)) } : null
          }))
        );
      }

      if (contentRes.ok) {
        const cnt = await contentRes.json();
        setApiRaw({
          services: (cnt.services ?? []) as RawDoc[],
          projects: (cnt.projects ?? []) as RawDoc[],
          testimonials: (cnt.testimonials ?? []) as RawDoc[],
          site: cnt.settings?.site ?? null,
          seo: cnt.settings?.seo ?? null
        });
      }
      setApiLoaded(true);
      setApiError('');
    } catch {
      setApiError('Could not load data from MySQL server.');
      setApiLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isMysql) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadFromApi();
      const onUpdate = () => void loadFromApi();
      window.addEventListener('sm_data_updated', onUpdate);
      return () => window.removeEventListener('sm_data_updated', onUpdate);
    }

    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(300));
    return onSnapshot(
      q,
      snap => {
        setFbMessages(
          snap.docs.map(d => ({ id: d.id, ...(d.data({ serverTimestamps: 'estimate' }) as Omit<MessageDoc, 'id'>) }))
        );
        setFbMessagesLoaded(true);
        setFbMessagesError('');
      },
      () => {
        setFbMessagesError('Could not load messages from Firestore.');
        setFbMessagesLoaded(true);
      }
    );
  }, [isMysql, loadFromApi]);

  const services = useLiveCollection('services');
  const projects = useLiveCollection('projects');
  const testimonials = useLiveCollection('testimonials');
  const site = useLiveDoc<NonNullable<RawContent['site']>>('settings', 'site');
  const seo = useLiveDoc<NonNullable<RawContent['seo']>>('settings', 'seo');

  const raw = useMemo<RawContent>(() => {
    if (isMysql) return apiRaw;
    return {
      services: services.docs,
      projects: projects.docs,
      testimonials: testimonials.docs,
      site: site.data,
      seo: seo.data
    };
  }, [isMysql, apiRaw, services.docs, projects.docs, testimonials.docs, site.data, seo.data]);

  const all = useMemo(() => buildAll(raw), [raw]);
  const messages = isMysql ? apiMessages : fbMessages;
  const messagesLoaded = isMysql ? apiLoaded : fbMessagesLoaded;
  const messagesError = isMysql ? apiError : fbMessagesError;

  const value: AdminDataValue = {
    messages,
    messagesLoaded,
    messagesError,
    unread: messages.filter(m => !m.read).length,
    raw,
    all,
    contentLoaded: isMysql ? apiLoaded : services.loaded && projects.loaded && testimonials.loaded && site.loaded && seo.loaded,
    contentError: isMysql ? apiError : services.error || projects.error || testimonials.error || site.error || seo.error,
    pendingImport: countPendingImport(all, raw),
    refresh: loadFromApi
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
