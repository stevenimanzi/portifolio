import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowUturnLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import type { Base } from '../content/model';
import { patchItem, removeItem, saveItem } from './adminFirebase';
import { Badge, Card, EmptyState, Modal, Notice, PageHeader, useToast } from './ui';

interface FormBase {
  published: boolean;
  order: number;
}

export interface ManagerProps<T extends Base, F extends FormBase> {
  title: string;
  subtitle: string;
  collectionName: 'projects' | 'services' | 'testimonials';
  noun: string;
  items: T[];
  loaded: boolean;
  error: string;
  rowTitle: (item: T) => string;
  rowMeta: (item: T) => string;
  rowThumb?: (item: T) => string;
  newForm: (nextOrder: number) => F;
  toForm: (item: T) => F;
  toPayload: (form: F) => Record<string, unknown>;
  validate: (form: F) => string | null;
  renderFields: (form: F, set: (patch: Partial<F>) => void) => ReactNode;
}

type Filter = 'live' | 'hidden' | 'all';

/** List + editor for one kind of website content. Built-in items can be edited, hidden or removed. */
export default function ContentManager<T extends Base, F extends FormBase>(props: ManagerProps<T, F>) {
  const { collectionName, noun, items } = props;
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<{ item: T | null } | null>(null);
  const [form, setForm] = useState<F | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const isHidden = (i: T) => !i.published || i.deleted;
  const shown = useMemo(
    () => items.filter(i => (filter === 'all' ? true : filter === 'live' ? !isHidden(i) : isHidden(i))),
    [items, filter]
  );
  const liveCount = items.filter(i => !isHidden(i)).length;

  const docIdFor = (item: T) => item.docId ?? (item.source === 'custom' ? item.id : `b-${item.id}`);
  const extraFor = (item: T) => (item.source === 'custom' ? {} : { builtinId: item.id });

  const openNew = () => {
    const nextOrder = items.reduce((max, i) => Math.max(max, i.order), 0) + 10;
    setEditing({ item: null });
    setForm(props.newForm(nextOrder));
    setFormError('');
  };

  const openEdit = (item: T) => {
    setEditing({ item });
    setForm(props.toForm(item));
    setFormError('');
  };

  const close = () => {
    if (saving) return;
    setEditing(null);
    setForm(null);
  };

  const save = async () => {
    if (!form || !editing) return;
    const problem = props.validate(form);
    if (problem) {
      setFormError(problem);
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = props.toPayload(form);
      const item = editing.item;
      if (!item) await saveItem(collectionName, null, payload);
      else await saveItem(collectionName, docIdFor(item), { ...payload, ...extraFor(item), deleted: item.deleted });
      toast(`${noun} saved. Visitors see it within a few minutes.`);
      setEditing(null);
      setForm(null);
    } catch {
      setFormError('Could not save. Check your connection and that you are signed in, then try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (item: T) => {
    try {
      await patchItem(collectionName, docIdFor(item), { ...extraFor(item), published: !item.published });
      toast(item.published ? `${noun} hidden from the website.` : `${noun} is live again.`);
    } catch {
      toast('Could not change visibility.', 'error');
    }
  };

  const remove = async (item: T) => {
    const builtin = item.source !== 'custom';
    const message = builtin
      ? `Remove this built-in ${noun.toLowerCase()} from the website? You can restore it later.`
      : `Delete this ${noun.toLowerCase()} permanently?`;
    if (!window.confirm(message)) return;
    try {
      if (builtin) await patchItem(collectionName, docIdFor(item), { ...extraFor(item), deleted: true });
      else await removeItem(collectionName, docIdFor(item));
      toast(builtin ? `${noun} removed (you can restore it).` : `${noun} deleted.`);
    } catch {
      toast('Could not remove it.', 'error');
    }
  };

  const restore = async (item: T) => {
    try {
      await patchItem(collectionName, docIdFor(item), { ...extraFor(item), deleted: false, published: true });
      toast(`${noun} restored.`);
    } catch {
      toast('Could not restore it.', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title={props.title}
        subtitle={props.subtitle}
        actions={
          <button type="button" className="adm-btn primary" onClick={openNew}>
            <PlusIcon aria-hidden="true" /> Add {noun.toLowerCase()}
          </button>
        }
      />

      {props.error && <Notice tone="error">{props.error} Make sure Firestore is created and the rules are deployed.</Notice>}

      <Card>
        <div className="adm-toolbar">
          <div className="adm-seg" role="group" aria-label="Filter">
            <button type="button" className={filter === 'all' ? 'active' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All ({items.length})</button>
            <button type="button" className={filter === 'live' ? 'active' : ''} aria-pressed={filter === 'live'} onClick={() => setFilter('live')}>Live ({liveCount})</button>
            <button type="button" className={filter === 'hidden' ? 'active' : ''} aria-pressed={filter === 'hidden'} onClick={() => setFilter('hidden')}>Hidden ({items.length - liveCount})</button>
          </div>
        </div>

        {shown.length === 0 ? (
          <EmptyState title={`No ${noun.toLowerCase()}s here`} text="Use the button above to add one." />
        ) : (
          <ul className="adm-rows-list">
            {shown.map(item => {
              const thumb = props.rowThumb?.(item);
              return (
                <li key={`${item.source}-${item.id}`} className={isHidden(item) ? 'muted' : ''}>
                  {props.rowThumb && (
                    <div className="adm-row-thumb">{thumb ? <img src={thumb} alt="" loading="lazy" /> : <span>—</span>}</div>
                  )}
                  <div className="adm-row-main">
                    <strong>{props.rowTitle(item)}</strong>
                    <span className="adm-muted">{props.rowMeta(item)}</span>
                    <div className="adm-row-badges">
                      {item.source === 'builtin' && <Badge>Not saved yet</Badge>}
                      {item.source === 'override' && <Badge tone="blue">In database</Badge>}
                      {item.source === 'custom' && <Badge tone="green">Added by you</Badge>}
                      {item.deleted ? <Badge tone="red">Removed</Badge> : !item.published && <Badge tone="amber">Hidden</Badge>}
                    </div>
                  </div>
                  <div className="adm-row-actions">
                    {item.deleted ? (
                      <button type="button" className="adm-btn" onClick={() => restore(item)}>
                        <ArrowUturnLeftIcon aria-hidden="true" /> Restore
                      </button>
                    ) : (
                      <>
                        <button type="button" className="adm-iconbtn" onClick={() => openEdit(item)} aria-label={`Edit ${props.rowTitle(item)}`} title="Edit">
                          <PencilSquareIcon />
                        </button>
                        <button
                          type="button"
                          className="adm-iconbtn"
                          onClick={() => toggleVisible(item)}
                          aria-label={item.published ? `Hide ${props.rowTitle(item)}` : `Show ${props.rowTitle(item)}`}
                          title={item.published ? 'Hide from website' : 'Show on website'}
                        >
                          {item.published ? <EyeIcon /> : <EyeSlashIcon />}
                        </button>
                        <button type="button" className="adm-iconbtn danger" onClick={() => remove(item)} aria-label={`Remove ${props.rowTitle(item)}`} title="Remove">
                          <TrashIcon />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={!!editing && !!form}
        title={editing?.item ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`}
        onClose={close}
        wide
        footer={
          <>
            {formError && <span className="adm-fielderror adm-grow">{formError}</span>}
            <button type="button" className="adm-btn" onClick={close} disabled={saving}>Cancel</button>
            <button type="button" className="adm-btn primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        {form && props.renderFields(form, patch => setForm(prev => (prev ? { ...prev, ...patch } : prev)))}
      </Modal>
    </>
  );
}
