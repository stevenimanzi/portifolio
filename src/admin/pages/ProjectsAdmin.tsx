import { useAdminData } from '../AdminData';
import ContentManager from '../ContentManager';
import { resolveImage } from '../../content/defaults';
import type { ProjectItem } from '../../content/model';
import { approxBytes, MAX_IMAGE_BYTES } from '../imageTools';
import { Field, ImageListEditor, Toggle } from '../ui';

interface ProjectForm {
  name: string;
  type: string;
  description: string;
  link: string;
  images: string[];
  published: boolean;
  order: number;
}

const TYPES = ['Web App', 'Business System', 'E-Commerce', 'Website', 'Mobile App'];

export default function ProjectsAdmin() {
  const { all, contentLoaded, contentError } = useAdminData();

  return (
    <ContentManager<ProjectItem, ProjectForm>
      title="Projects"
      subtitle="The work shown on your Home and Projects pages. Each project can have several screenshots."
      collectionName="projects"
      noun="Project"
      items={all.projects}
      loaded={contentLoaded}
      error={contentError}
      rowTitle={p => p.name}
      rowMeta={p => `${p.type} · ${p.images.length} image${p.images.length === 1 ? '' : 's'} · ${p.link && p.link !== '#' ? p.link.replace(/^https?:\/\//, '') : 'private'}`}
      rowThumb={p => resolveImage(p.images[0] ?? '')}
      newForm={order => ({ name: '', type: 'Web App', description: '', link: '', images: [], published: true, order })}
      toForm={p => ({ name: p.name, type: p.type, description: p.description, link: p.link === '#' ? '' : p.link, images: p.images, published: p.published, order: p.order })}
      toPayload={f => ({
        name: f.name.trim(),
        type: f.type.trim() || 'Web App',
        description: f.description.trim(),
        link: f.link.trim() || '#',
        images: f.images,
        published: f.published,
        order: Number.isFinite(f.order) ? f.order : 1000
      })}
      validate={f => {
        if (!f.name.trim()) return 'Give the project a name.';
        if (!f.description.trim()) return 'Write a short description.';
        if (f.link.trim() && !/^https?:\/\//i.test(f.link.trim())) return 'The live link must start with https://';
        if (f.images.length === 0) return 'Add at least one screenshot.';
        const stored = f.images.filter(i => i.startsWith('data:')).reduce((s, i) => s + approxBytes(i), 0);
        if (stored > MAX_IMAGE_BYTES) return 'The uploaded pictures are too large together. Remove one or use image links instead.';
        return null;
      }}
      renderFields={(f, set) => (
        <div className="adm-form">
          <div className="adm-form-grid">
            <Field label="Project name" htmlFor="pn"><input id="pn" className="adm-input" value={f.name} onChange={e => set({ name: e.target.value })} maxLength={80} /></Field>
            <Field label="Type" htmlFor="pt">
              <input id="pt" className="adm-input" list="project-types" value={f.type} onChange={e => set({ type: e.target.value })} maxLength={40} />
              <datalist id="project-types">{TYPES.map(t => <option key={t} value={t} />)}</datalist>
            </Field>
          </div>
          <Field label="Short description" htmlFor="pd" hint="One or two sentences, shown on the project cards.">
            <textarea id="pd" className="adm-input" rows={3} value={f.description} onChange={e => set({ description: e.target.value })} maxLength={300} />
          </Field>
          <Field label="Live website link" htmlFor="pl" hint="Leave empty for a private project.">
            <input id="pl" className="adm-input" type="url" placeholder="https://" value={f.link} onChange={e => set({ link: e.target.value })} />
          </Field>
          <ImageListEditor label="Screenshots" value={f.images} onChange={images => set({ images })} max={8} maxWidth={1400} />
          <div className="adm-form-grid">
            <Field label="Display order" htmlFor="po" hint="Lower numbers show first.">
              <input id="po" className="adm-input" type="number" value={f.order} onChange={e => set({ order: Number(e.target.value) })} />
            </Field>
          </div>
          <Toggle checked={f.published} onChange={published => set({ published })} label="Show on the website" hint="Turn off to keep it saved but hidden." />
        </div>
      )}
    />
  );
}
