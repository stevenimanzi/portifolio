import { useAdminData } from '../AdminData';
import ContentManager from '../ContentManager';
import { resolveImage } from '../../content/defaults';
import type { ServiceItem } from '../../content/model';
import { approxBytes, MAX_IMAGE_BYTES } from '../imageTools';
import { Field, ImageListEditor, Toggle } from '../ui';

interface ServiceForm {
  title: string;
  tag: string;
  summary: string;
  details: string;
  images: string[];
  published: boolean;
  order: number;
}

export default function ServicesAdmin() {
  const { all, contentLoaded, contentError } = useAdminData();

  return (
    <ContentManager<ServiceItem, ServiceForm>
      title="Services"
      subtitle="The services shown on your Home and Services pages."
      collectionName="services"
      noun="Service"
      items={all.services}
      loaded={contentLoaded}
      error={contentError}
      rowTitle={s => s.title}
      rowMeta={s => `${s.tag} · ${s.summary}`}
      rowThumb={s => resolveImage(s.image)}
      newForm={order => ({ title: '', tag: '', summary: '', details: '', images: [], published: true, order })}
      toForm={s => ({ title: s.title, tag: s.tag, summary: s.summary, details: s.details, images: s.image ? [s.image] : [], published: s.published, order: s.order })}
      toPayload={f => ({
        title: f.title.trim(),
        tag: f.tag.trim(),
        summary: f.summary.trim(),
        details: f.details.trim(),
        image: f.images[0] ?? '',
        published: f.published,
        order: Number.isFinite(f.order) ? f.order : 1000
      })}
      validate={f => {
        if (!f.title.trim()) return 'Give the service a title.';
        if (!f.summary.trim()) return 'Write a one-sentence summary.';
        if (f.images.length === 0) return 'Add a picture for the service.';
        const stored = f.images.filter(i => i.startsWith('data:')).reduce((s, i) => s + approxBytes(i), 0);
        if (stored > MAX_IMAGE_BYTES) return 'That picture is too large. Try a smaller one or use an image link.';
        return null;
      }}
      renderFields={(f, set) => (
        <div className="adm-form">
          <div className="adm-form-grid">
            <Field label="Service title" htmlFor="st"><input id="st" className="adm-input" value={f.title} onChange={e => set({ title: e.target.value })} maxLength={80} /></Field>
            <Field label="Short label" htmlFor="sg" hint="One or two words, e.g. Security"><input id="sg" className="adm-input" value={f.tag} onChange={e => set({ tag: e.target.value })} maxLength={30} /></Field>
          </div>
          <Field label="Summary" htmlFor="ss" hint="One sentence shown on the card.">
            <textarea id="ss" className="adm-input" rows={2} value={f.summary} onChange={e => set({ summary: e.target.value })} maxLength={200} />
          </Field>
          <Field label="Full description" htmlFor="sd" hint="Shown when the card is opened.">
            <textarea id="sd" className="adm-input" rows={4} value={f.details} onChange={e => set({ details: e.target.value })} maxLength={600} />
          </Field>
          <ImageListEditor label="Picture" value={f.images} onChange={images => set({ images })} max={1} maxWidth={900} />
          <div className="adm-form-grid">
            <Field label="Display order" htmlFor="so" hint="Lower numbers show first.">
              <input id="so" className="adm-input" type="number" value={f.order} onChange={e => set({ order: Number(e.target.value) })} />
            </Field>
          </div>
          <Toggle checked={f.published} onChange={published => set({ published })} label="Show on the website" hint="Turn off to keep it saved but hidden." />
        </div>
      )}
    />
  );
}
