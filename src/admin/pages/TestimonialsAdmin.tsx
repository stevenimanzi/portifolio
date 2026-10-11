import { useAdminData } from '../AdminData';
import ContentManager from '../ContentManager';
import type { TestimonialItem } from '../../content/model';
import { Field, Toggle } from '../ui';

interface TestimonialForm {
  name: string;
  role: string;
  text: string;
  published: boolean;
  order: number;
}

export default function TestimonialsAdmin() {
  const { all, contentLoaded, contentError } = useAdminData();

  return (
    <ContentManager<TestimonialItem, TestimonialForm>
      title="Testimonials"
      subtitle="What clients and teammates say about you, shown in the feedback section on the Home page."
      collectionName="testimonials"
      noun="Testimonial"
      items={all.testimonials}
      loaded={contentLoaded}
      error={contentError}
      rowTitle={t => t.name}
      rowMeta={t => `${t.role} · “${t.text.length > 70 ? t.text.slice(0, 70) + '…' : t.text}”`}
      newForm={order => ({ name: '', role: '', text: '', published: true, order })}
      toForm={t => ({ name: t.name, role: t.role, text: t.text, published: t.published, order: t.order })}
      toPayload={f => ({
        name: f.name.trim(),
        role: f.role.trim(),
        text: f.text.trim(),
        published: f.published,
        order: Number.isFinite(f.order) ? f.order : 1000
      })}
      validate={f => {
        if (!f.name.trim()) return 'Enter the person’s name.';
        if (!f.text.trim()) return 'Write what they said.';
        return null;
      }}
      renderFields={(f, set) => (
        <div className="adm-form">
          <div className="adm-form-grid">
            <Field label="Name" htmlFor="tn"><input id="tn" className="adm-input" value={f.name} onChange={e => set({ name: e.target.value })} maxLength={80} /></Field>
            <Field label="Role / company" htmlFor="tr"><input id="tr" className="adm-input" value={f.role} onChange={e => set({ role: e.target.value })} maxLength={100} /></Field>
          </div>
          <Field label="Their words" htmlFor="tt" hint="Keep it to two or three sentences.">
            <textarea id="tt" className="adm-input" rows={4} value={f.text} onChange={e => set({ text: e.target.value })} maxLength={400} />
          </Field>
          <div className="adm-form-grid">
            <Field label="Display order" htmlFor="to" hint="Lower numbers show first.">
              <input id="to" className="adm-input" type="number" value={f.order} onChange={e => set({ order: Number(e.target.value) })} />
            </Field>
          </div>
          <Toggle checked={f.published} onChange={published => set({ published })} label="Show on the website" />
        </div>
      )}
    />
  );
}
