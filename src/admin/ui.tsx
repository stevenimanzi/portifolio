import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { resolveImage } from '../content/defaults';
import { approxBytes, fileToDataUrl, formatBytes, MAX_IMAGE_BYTES } from './imageTools';

/* ---------- Toasts ---------- */
type ToastKind = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

const ToastContext = createContext<(text: string, kind?: ToastKind) => void>(() => {});
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = nextId.current++;
    setItems(list => [...list, { id, kind, text }]);
    setTimeout(() => setItems(list => list.filter(t => t.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="adm-toasts" aria-live="polite">
        {items.map(t => (
          <div key={t.id} className={`adm-toast ${t.kind}`} role="status">{t.text}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---------- Layout bits ---------- */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="adm-pagehead">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="adm-muted">{subtitle}</p>}
      </div>
      {actions && <div className="adm-pagehead-actions">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = ''
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || actions) && (
        <header className="adm-card-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="adm-muted">{subtitle}</p>}
          </div>
          {actions && <div className="adm-card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue'; children: ReactNode }) {
  return <span className={`adm-pill ${tone}`}>{children}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="adm-empty">
      <strong>{title}</strong>
      {text && <p className="adm-muted">{text}</p>}
      {action}
    </div>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'error' | 'success'; children: ReactNode }) {
  return <div className={`adm-notice ${tone}`} role={tone === 'error' ? 'alert' : undefined}>{children}</div>;
}

/* ---------- Form controls ---------- */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className={`adm-formfield ${error ? 'has-error' : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? <small className="adm-fielderror">{error}</small> : hint ? <small className="adm-muted">{hint}</small> : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="adm-toggle-row">
      <div>
        <strong>{label}</strong>
        {hint && <p className="adm-muted">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`adm-switch ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <i></i>
      </button>
    </div>
  );
}

/** Character counter with a good range, used for SEO titles and descriptions. */
export function Counter({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.length;
  const tone = n === 0 ? 'red' : n < min || n > max ? 'amber' : 'green';
  return <span className={`adm-counter ${tone}`}>{n} / {min}–{max}</span>;
}

/* ---------- Modal ---------- */
export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="adm-modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        className={`adm-modal ${wide ? 'wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="adm-modal-head">
          <h2>{title}</h2>
          <button type="button" className="adm-iconbtn" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="adm-modal-body">{children}</div>
        {footer && <footer className="adm-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

/* ---------- Image list editor ---------- */
export function ImageListEditor({
  value,
  onChange,
  max = 6,
  maxWidth = 1400,
  label = 'Images'
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  maxWidth?: number;
  label?: string;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);

  const stored = value.filter(v => v.startsWith('data:')).reduce((sum, v) => sum + approxBytes(v), 0);
  const tooBig = stored > MAX_IMAGE_BYTES;

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const next = [...value];
      for (const file of Array.from(files)) {
        if (next.length >= max) {
          toast(`You can add up to ${max} images here.`, 'info');
          break;
        }
        if (!file.type.startsWith('image/')) {
          toast(`"${file.name}" is not an image.`, 'error');
          continue;
        }
        next.push(await fileToDataUrl(file, maxWidth));
      }
      onChange(next);
    } catch {
      toast('That picture could not be processed. Try another file.', 'error');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addLink = () => {
    const url = link.trim();
    if (!/^https?:\/\//i.test(url)) {
      toast('Paste a full link that starts with https://', 'error');
      return;
    }
    if (value.length >= max) {
      toast(`You can add up to ${max} images here.`, 'info');
      return;
    }
    onChange([...value, url]);
    setLink('');
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="adm-images">
      <div className="adm-images-head">
        <span>{label} <small className="adm-muted">({value.length}/{max})</small></span>
        {stored > 0 && (
          <small className={tooBig ? 'adm-fielderror' : 'adm-muted'}>
            Uploaded: {formatBytes(stored)} of {formatBytes(MAX_IMAGE_BYTES)}
          </small>
        )}
      </div>

      {value.length > 0 && (
        <ul className="adm-thumbs">
          {value.map((token, i) => (
            <li key={`${i}-${token.slice(0, 24)}`}>
              <img src={resolveImage(token)} alt="" loading="lazy" />
              <span className="adm-thumb-index">{i + 1}</span>
              <div className="adm-thumb-actions">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move image ${i + 1} earlier`}>←</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} aria-label={`Move image ${i + 1} later`}>→</button>
                <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label={`Remove image ${i + 1}`}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="adm-images-add">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={max > 1}
          hidden
          onChange={e => void addFiles(e.target.files)}
        />
        <button type="button" className="adm-btn" onClick={() => fileRef.current?.click()} disabled={busy || value.length >= max}>
          {busy ? 'Processing…' : 'Upload from device'}
        </button>
        <div className="adm-images-link">
          <input
            type="url"
            placeholder="…or paste an image link (https://)"
            value={link}
            onChange={e => setLink(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
          />
          <button type="button" className="adm-btn" onClick={addLink} disabled={!link}>Add</button>
        </div>
      </div>
      <small className="adm-muted">Pictures you upload are shrunk automatically. The first image is the cover.</small>
    </div>
  );
}
