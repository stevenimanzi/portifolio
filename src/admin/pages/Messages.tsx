import { useMemo, useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../adminFirebase';
import { useAdminData, type MessageDoc } from '../AdminData';
import { formatWhen } from '../analyticsData';
import { Card, EmptyState, Notice, PageHeader, useToast } from '../ui';

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

export default function Messages() {
  const { messages, messagesLoaded, messagesError } = useAdminData();
  const toast = useToast();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter(m => {
      if (filter === 'unread' && m.read) return false;
      if (!q) return true;
      return [m.name, m.email, m.subject, m.message].some(v => v.toLowerCase().includes(q));
    });
  }, [messages, filter, search]);

  const unread = messages.filter(m => !m.read).length;

  const openMessage = (m: MessageDoc) => {
    setOpenId(prev => (prev === m.id ? null : m.id));
    if (!m.read) void updateDoc(doc(db, 'messages', m.id), { read: true });
  };

  const toggleRead = (m: MessageDoc) =>
    updateDoc(doc(db, 'messages', m.id), { read: !m.read }).catch(() => toast('Could not update the message.', 'error'));

  const remove = async (m: MessageDoc) => {
    if (!window.confirm(`Delete the message from ${m.name}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'messages', m.id));
      toast('Message deleted.');
    } catch {
      toast('Could not delete the message.', 'error');
    }
  };

  const exportCsv = () => {
    const rows = [
      ['Date', 'Name', 'Email', 'Subject', 'Message', 'Read'],
      ...messages.map(m => [
        m.createdAt ? m.createdAt.toDate().toISOString() : '',
        m.name,
        m.email,
        m.subject,
        m.message,
        m.read ? 'yes' : 'no'
      ])
    ];
    const blob = new Blob([rows.map(r => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `messages-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle={`${messages.length} in total · ${unread} unread`}
        actions={
          <button type="button" className="adm-btn" onClick={exportCsv} disabled={messages.length === 0}>
            <ArrowDownTrayIcon aria-hidden="true" /> Export CSV
          </button>
        }
      />

      {messagesError && <Notice tone="error">{messagesError}</Notice>}

      <Card>
        <div className="adm-toolbar">
          <input
            type="search"
            className="adm-input"
            placeholder="Search name, email, subject or text…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search messages"
          />
          <div className="adm-seg" role="group" aria-label="Filter messages">
            <button type="button" className={filter === 'all' ? 'active' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
            <button type="button" className={filter === 'unread' ? 'active' : ''} aria-pressed={filter === 'unread'} onClick={() => setFilter('unread')}>Unread</button>
          </div>
        </div>

        {messagesLoaded && shown.length === 0 && !messagesError && (
          <EmptyState
            title={messages.length === 0 ? 'No messages yet' : 'Nothing matches'}
            text={messages.length === 0 ? 'Messages from your contact form will appear here.' : 'Try a different search or filter.'}
          />
        )}

        <ul className="adm-messages">
          {shown.map(m => {
            const isOpen = openId === m.id;
            return (
              <li key={m.id} className={`adm-message ${m.read ? '' : 'unread'} ${isOpen ? 'open' : ''}`}>
                <button type="button" className="adm-message-head" onClick={() => openMessage(m)} aria-expanded={isOpen}>
                  <span className="adm-dot" aria-label={m.read ? 'Read' : 'Unread'}></span>
                  <span className="adm-message-who">
                    <strong>{m.name}</strong>
                    <span className="adm-muted">{m.subject}</span>
                  </span>
                  <span className="adm-muted adm-message-when">{formatWhen(m.createdAt)}</span>
                </button>

                {isOpen && (
                  <div className="adm-message-body">
                    <p className="adm-muted">From <a href={`mailto:${m.email}`}>{m.email}</a></p>
                    <p className="adm-message-text">{m.message}</p>
                    <div className="adm-actions">
                      <a className="adm-btn primary" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`}>
                        Reply by email
                      </a>
                      <button type="button" className="adm-btn" onClick={() => toggleRead(m)}>
                        Mark as {m.read ? 'unread' : 'read'}
                      </button>
                      <button type="button" className="adm-btn danger" onClick={() => remove(m)}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
