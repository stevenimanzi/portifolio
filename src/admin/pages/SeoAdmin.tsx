import { useMemo, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { defaultSeo } from '../../content/defaults';
import { PAGE_KEYS, PAGE_LABELS, PAGE_PATHS, type PageKey, type SeoSettings } from '../../content/model';
import { resetSetting, saveSetting } from '../adminFirebase';
import { useAdminData } from '../AdminData';
import { Card, Counter, Field, Notice, PageHeader, Toggle, useToast } from '../ui';

type Tab = 'global' | PageKey;
type Level = 'good' | 'warn' | 'bad';

const abs = (base: string, url: string) => (!url ? '' : /^https?:\/\//i.test(url) ? url : `${base.replace(/\/+$/, '')}${url.startsWith('/') ? '' : '/'}${url}`);
const clip = (text: string, n: number) => (text.length > n ? text.slice(0, n - 1).trimEnd() + '…' : text);
const host = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

function healthChecks(f: SeoSettings) {
  const checks: { level: Level; text: string }[] = [];
  const titles = PAGE_KEYS.map(k => f.pages[k].title.trim());

  PAGE_KEYS.forEach(k => {
    const t = f.pages[k].title.trim();
    const d = f.pages[k].description.trim();
    if (!t) checks.push({ level: 'bad', text: `${PAGE_LABELS[k]}: add a page title.` });
    else if (t.length < 30 || t.length > 60) checks.push({ level: 'warn', text: `${PAGE_LABELS[k]}: title is ${t.length} characters (best 30–60).` });
    if (!d) checks.push({ level: 'bad', text: `${PAGE_LABELS[k]}: add a meta description.` });
    else if (d.length < 70 || d.length > 160) checks.push({ level: 'warn', text: `${PAGE_LABELS[k]}: description is ${d.length} characters (best 70–160).` });
  });

  if (new Set(titles).size !== titles.length) checks.push({ level: 'warn', text: 'Some pages share the same title. Give each page its own.' });
  if (!/^https:\/\//i.test(f.canonicalUrl)) checks.push({ level: 'bad', text: 'The website address must start with https://' });
  if (!f.ogImage.trim()) checks.push({ level: 'warn', text: 'Add a social sharing image so links look good on WhatsApp, Facebook and LinkedIn.' });
  if (!f.robotsIndex) checks.push({ level: 'bad', text: 'Search engines are blocked (noindex). Turn indexing back on to appear on Google.' });
  if (!f.googleVerification.trim()) checks.push({ level: 'warn', text: 'Google Search Console is not verified yet (optional but recommended).' });
  if (f.description.trim().length < 70) checks.push({ level: 'warn', text: 'The site-wide description is short. Aim for 70–160 characters.' });

  if (checks.length === 0) checks.push({ level: 'good', text: 'Everything looks good. Nice work!' });
  const problems = checks.filter(c => c.level !== 'good').length;
  const score = Math.max(0, Math.round(100 - checks.filter(c => c.level === 'bad').length * 15 - checks.filter(c => c.level === 'warn').length * 6));
  return { checks, problems, score: problems === 0 ? 100 : score };
}

function SeoForm({ initial }: { initial: SeoSettings }) {
  const toast = useToast();
  const [form, setForm] = useState<SeoSettings>(initial);
  const [tab, setTab] = useState<Tab>('global');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setGlobal = (patch: Partial<SeoSettings>) => setForm(prev => ({ ...prev, ...patch }));
  const setPage = (key: PageKey, patch: Partial<SeoSettings['pages'][PageKey]>) =>
    setForm(prev => ({ ...prev, pages: { ...prev.pages, [key]: { ...prev.pages[key], ...patch } } }));

  const health = useMemo(() => healthChecks(form), [form]);

  const previewKey: PageKey = tab === 'global' ? 'home' : tab;
  const page = form.pages[previewKey];
  const previewTitle = page.title || form.siteName;
  const previewDesc = page.description || form.description;
  const previewUrl = `${form.canonicalUrl.replace(/\/+$/, '')}${PAGE_PATHS[previewKey] === '/' ? '' : PAGE_PATHS[previewKey]}`;
  const previewImage = abs(form.canonicalUrl, page.image || form.ogImage);

  const save = async () => {
    if (!/^https:\/\//i.test(form.canonicalUrl.trim())) {
      setError('The website address must start with https://');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await saveSetting('seo', { ...form, canonicalUrl: form.canonicalUrl.trim().replace(/\/+$/, '') });
      toast('SEO settings saved. Google picks them up on its next visit.');
    } catch {
      setError('Could not save. Check your connection and that you are signed in.');
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Go back to the original SEO settings?')) return;
    try {
      await resetSetting('seo');
      setForm(defaultSeo);
      toast('Restored the original SEO settings.');
    } catch {
      toast('Could not reset.', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="SEO"
        subtitle="Control how your website appears on Google and when links are shared."
        actions={
          <>
            <button type="button" className="adm-btn" onClick={reset} disabled={saving}>Restore originals</button>
            <button type="button" className="adm-btn primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}

      <div className="adm-grid seo">
        <div className="adm-stack">
          <div className="adm-seg adm-seg-scroll" role="tablist" aria-label="SEO sections">
            <button type="button" role="tab" aria-selected={tab === 'global'} className={tab === 'global' ? 'active' : ''} onClick={() => setTab('global')}>Site-wide</button>
            {PAGE_KEYS.map(k => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{PAGE_LABELS[k]}</button>
            ))}
          </div>

          {tab === 'global' ? (
            <>
              <Card title="Site-wide settings" subtitle="Used on every page unless a page overrides it.">
                <div className="adm-form">
                  <div className="adm-form-grid">
                    <Field label="Site name" htmlFor="q1"><input id="q1" className="adm-input" value={form.siteName} onChange={e => setGlobal({ siteName: e.target.value })} /></Field>
                    <Field label="Website address" htmlFor="q2" hint="Your final https:// address, no trailing slash. Change it when you connect your own domain."><input id="q2" className="adm-input" type="url" value={form.canonicalUrl} onChange={e => setGlobal({ canonicalUrl: e.target.value })} /></Field>
                  </div>
                  <Field label={<>Default description <Counter value={form.description} min={70} max={160} /></>} htmlFor="q3">
                    <textarea id="q3" className="adm-input" rows={3} value={form.description} onChange={e => setGlobal({ description: e.target.value })} />
                  </Field>
                  <Field label="Keywords" htmlFor="q4" hint="Comma separated. Helps describe the site; Google mostly ignores it."><textarea id="q4" className="adm-input" rows={2} value={form.keywords} onChange={e => setGlobal({ keywords: e.target.value })} /></Field>
                  <div className="adm-form-grid">
                    <Field label="Author" htmlFor="q5"><input id="q5" className="adm-input" value={form.author} onChange={e => setGlobal({ author: e.target.value })} /></Field>
                    <Field label="X / Twitter handle" htmlFor="q6"><input id="q6" className="adm-input" placeholder="@name" value={form.twitterHandle} onChange={e => setGlobal({ twitterHandle: e.target.value })} /></Field>
                  </div>
                  <Field label="Social sharing image" htmlFor="q7" hint="A full https:// link, or a file on your site such as /steven_imanzi.png. Best size 1200×630.">
                    <input id="q7" className="adm-input" value={form.ogImage} onChange={e => setGlobal({ ogImage: e.target.value })} />
                  </Field>
                  <Field label="Google Search Console verification code" htmlFor="q8" hint="Only the code from the “HTML tag” method (the long value inside content=&quot;…&quot;).">
                    <input id="q8" className="adm-input" value={form.googleVerification} onChange={e => setGlobal({ googleVerification: e.target.value })} />
                  </Field>
                  <Toggle checked={form.robotsIndex} onChange={robotsIndex => setGlobal({ robotsIndex })} label="Allow search engines to list this site" hint="Turn off only while the site is under construction." />
                </div>
              </Card>

              <Card title="Business details" subtitle="Helps Google show your business correctly (structured data).">
                <div className="adm-form-grid">
                  <Field label="Business name" htmlFor="o1"><input id="o1" className="adm-input" value={form.orgName} onChange={e => setGlobal({ orgName: e.target.value })} /></Field>
                  <Field label="City" htmlFor="o2"><input id="o2" className="adm-input" value={form.orgCity} onChange={e => setGlobal({ orgCity: e.target.value })} /></Field>
                  <Field label="Country code" htmlFor="o3" hint="Two letters, e.g. RW"><input id="o3" className="adm-input" maxLength={2} value={form.orgCountry} onChange={e => setGlobal({ orgCountry: e.target.value.toUpperCase() })} /></Field>
                </div>
              </Card>
            </>
          ) : (
            <Card title={`${PAGE_LABELS[tab]} page`} subtitle={`Address: ${PAGE_PATHS[tab]}`}>
              <div className="adm-form">
                <Field label={<>Page title <Counter value={page.title} min={30} max={60} /></>} htmlFor="p1" hint="What people see in Google and in the browser tab.">
                  <input id="p1" className="adm-input" value={page.title} onChange={e => setPage(tab, { title: e.target.value })} />
                </Field>
                <Field label={<>Meta description <Counter value={page.description} min={70} max={160} /></>} htmlFor="p2" hint="The short text under the title in Google.">
                  <textarea id="p2" className="adm-input" rows={3} value={page.description} onChange={e => setPage(tab, { description: e.target.value })} />
                </Field>
                <Field label="Sharing image for this page (optional)" htmlFor="p3" hint="Leave empty to use the site-wide image.">
                  <input id="p3" className="adm-input" value={page.image} onChange={e => setPage(tab, { image: e.target.value })} />
                </Field>
              </div>
            </Card>
          )}
        </div>

        <div className="adm-stack">
          <Card title="Search result preview" subtitle={tab === 'global' ? 'Showing the Home page' : `Showing the ${PAGE_LABELS[previewKey]} page`}>
            <div className="adm-serp">
              <span className="adm-serp-url">{host(form.canonicalUrl)} <em>› {PAGE_LABELS[previewKey].toLowerCase()}</em></span>
              <span className="adm-serp-title">{clip(previewTitle, 60)}</span>
              <span className="adm-serp-desc">{clip(previewDesc, 160)}</span>
            </div>
            <h3 className="adm-h3 adm-spaced">Social share preview</h3>
            <div className="adm-social">
              <div className="adm-social-img">{previewImage ? <img src={previewImage} alt="" /> : <span>No image</span>}</div>
              <div className="adm-social-text">
                <small>{host(previewUrl).toUpperCase()}</small>
                <strong>{clip(previewTitle, 70)}</strong>
                <span>{clip(previewDesc, 110)}</span>
              </div>
            </div>
          </Card>

          <Card title="SEO health" subtitle={`Score ${health.score}/100`}>
            <div className="adm-meter big"><i style={{ width: `${health.score}%` }}></i></div>
            <ul className="adm-checks">
              {health.checks.map((c, i) => (
                <li key={i} className={c.level}>
                  {c.level === 'good' ? <CheckCircleIcon aria-hidden="true" /> : c.level === 'warn' ? <ExclamationTriangleIcon aria-hidden="true" /> : <XCircleIcon aria-hidden="true" />}
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="How this is applied">
            <ul className="adm-plain">
              <li><b>Google &amp; browsers:</b> the title, description, canonical link, social tags and structured data are updated on every page as it opens, using these settings.</li>
              <li><b>WhatsApp, Facebook, LinkedIn previews:</b> these read the page source without running scripts, so they use the Home-page tags saved into the site when it is published. After changing SEO run <code>npm run ship</code> (or ask Claude to publish) to refresh them.</li>
              <li><b>Sitemap &amp; robots.txt:</b> <code>/sitemap.xml</code> and <code>/robots.txt</code> are regenerated on every publish from your website address and the indexing switch.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function SeoAdmin() {
  const { all, contentLoaded } = useAdminData();
  if (!contentLoaded) return <div className="adm-loading">Loading…</div>;
  return <SeoForm initial={all.seo} />;
}
