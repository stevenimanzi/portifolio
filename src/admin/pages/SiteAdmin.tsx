import { useState } from 'react';
import { defaultSite } from '../../content/defaults';
import type { SiteSettings } from '../../content/model';
import { resetSetting, saveSetting } from '../adminFirebase';
import { useAdminData } from '../AdminData';
import { Card, Field, Notice, PageHeader, useToast } from '../ui';

const isUrl = (v: string) => !v || /^https?:\/\//i.test(v.trim());

function SiteForm({ initial }: { initial: SiteSettings }) {
  const toast = useToast();
  const [form, setForm] = useState<SiteSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (patch: Partial<SiteSettings>) => setForm(prev => ({ ...prev, ...patch }));

  const validate = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return 'Enter a valid email address.';
    if (!/^\d{8,15}$/.test(form.whatsapp.trim())) return 'WhatsApp number must be digits only with the country code, e.g. 250796194401.';
    if (![form.github, form.linkedin, form.x, form.instagram].every(isUrl)) return 'Social links must start with https://';
    if (!form.heroQuote.trim() || !form.role.trim()) return 'The hero quote and role line cannot be empty.';
    return '';
  };

  const save = async () => {
    const problem = validate();
    setError(problem);
    if (problem) return;
    setSaving(true);
    try {
      await saveSetting('site', { ...form, whatsapp: form.whatsapp.trim(), yearsStart: Number(form.yearsStart) || defaultSite.yearsStart });
      toast('Site details saved. Visitors see them within a few minutes.');
    } catch {
      setError('Could not save. Check your connection and that you are signed in.');
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Go back to the original texts and links?')) return;
    try {
      await resetSetting('site');
      setForm(defaultSite);
      toast('Restored the original site details.');
    } catch {
      toast('Could not reset.', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Site details"
        subtitle="Your contact details, social links and the main texts on the Home page."
        actions={
          <>
            <button type="button" className="adm-btn" onClick={reset} disabled={saving}>Restore originals</button>
            <button type="button" className="adm-btn primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}

      <Card title="Home page" subtitle="The big text at the top of the Home page.">
        <div className="adm-form">
          <Field label="Hero quote" htmlFor="sq" hint="Each new line starts on a new row. Shown in capital letters.">
            <textarea id="sq" className="adm-input" rows={5} value={form.heroQuote} onChange={e => set({ heroQuote: e.target.value })} maxLength={400} />
          </Field>
          <div className="adm-form-grid">
            <Field label="Role line" htmlFor="sr"><input id="sr" className="adm-input" value={form.role} onChange={e => set({ role: e.target.value })} maxLength={120} /></Field>
            <Field label="Working since (year)" htmlFor="sy" hint="Used for “2+ yrs exp.”"><input id="sy" className="adm-input" type="number" value={form.yearsStart} onChange={e => set({ yearsStart: Number(e.target.value) })} /></Field>
          </div>
        </div>
      </Card>

      <Card title="Contact details" subtitle="Used on the Contact page, the footer, the mobile menu and the WhatsApp button.">
        <div className="adm-form">
          <div className="adm-form-grid">
            <Field label="Email" htmlFor="se"><input id="se" className="adm-input" type="email" value={form.email} onChange={e => set({ email: e.target.value })} /></Field>
            <Field label="Phone (as shown)" htmlFor="sp"><input id="sp" className="adm-input" value={form.phone} onChange={e => set({ phone: e.target.value })} /></Field>
            <Field label="WhatsApp number" htmlFor="sw" hint="Digits only, with the country code."><input id="sw" className="adm-input" inputMode="numeric" value={form.whatsapp} onChange={e => set({ whatsapp: e.target.value.replace(/\D/g, '') })} /></Field>
            <Field label="Location" htmlFor="sl"><input id="sl" className="adm-input" value={form.location} onChange={e => set({ location: e.target.value })} /></Field>
          </div>
          <a className="adm-link" href={`https://wa.me/${form.whatsapp}`} target="_blank" rel="noopener noreferrer">Test the WhatsApp link →</a>
        </div>
      </Card>

      <Card title="Social links" subtitle="Leave a link empty to keep it simple; it must start with https://">
        <div className="adm-form-grid">
          <Field label="GitHub" htmlFor="s1"><input id="s1" className="adm-input" type="url" value={form.github} onChange={e => set({ github: e.target.value })} /></Field>
          <Field label="LinkedIn" htmlFor="s2"><input id="s2" className="adm-input" type="url" value={form.linkedin} onChange={e => set({ linkedin: e.target.value })} /></Field>
          <Field label="X (Twitter)" htmlFor="s3"><input id="s3" className="adm-input" type="url" value={form.x} onChange={e => set({ x: e.target.value })} /></Field>
          <Field label="Instagram" htmlFor="s4"><input id="s4" className="adm-input" type="url" value={form.instagram} onChange={e => set({ instagram: e.target.value })} /></Field>
        </div>
      </Card>

      <Card title="Footer">
        <Field label="Footer description" htmlFor="sf">
          <textarea id="sf" className="adm-input" rows={2} value={form.footerText} onChange={e => set({ footerText: e.target.value })} maxLength={240} />
        </Field>
      </Card>
    </>
  );
}

export default function SiteAdmin() {
  const { all, contentLoaded } = useAdminData();
  if (!contentLoaded) return <div className="adm-loading">Loading…</div>;
  return <SiteForm initial={all.site} />;
}
