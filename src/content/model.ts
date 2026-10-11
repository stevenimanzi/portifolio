/* Shared content model: what the public site shows and what the admin dashboard edits.
   Built-in content (shipped with the site) is merged with documents saved from the dashboard. */

export type Source = 'builtin' | 'override' | 'custom';

export interface Base {
  id: string;        // stable id (built-in id, or the Firestore document id for custom items)
  docId?: string;    // Firestore document that holds edits / the custom item
  source: Source;
  published: boolean;
  deleted: boolean;
  order: number;
}

export interface ServiceItem extends Base {
  title: string;
  tag: string;
  summary: string;
  details: string;
  image: string;     // image token or URL (see resolveImage)
}

export interface ProjectItem extends Base {
  name: string;
  type: string;
  description: string;
  link: string;      // '' or '#' means "private"
  images: string[];  // image tokens or URLs
}

export interface TestimonialItem extends Base {
  name: string;
  role: string;
  text: string;
}

export interface SiteSettings {
  heroQuote: string;
  role: string;
  email: string;
  phone: string;
  whatsapp: string;  // digits only, international format, e.g. 250796194401
  location: string;
  github: string;
  linkedin: string;
  x: string;
  instagram: string;
  footerText: string;
  yearsStart: number;
}

export interface PageSeo {
  title: string;
  description: string;
  image: string;
}

export const PAGE_KEYS = ['home', 'skills', 'services', 'projects', 'contact'] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_PATHS: Record<PageKey, string> = {
  home: '/',
  skills: '/skills',
  services: '/services',
  projects: '/projects',
  contact: '/contact'
};

export const PAGE_LABELS: Record<PageKey, string> = {
  home: 'Home',
  skills: 'Skills',
  services: 'Services',
  projects: 'Projects',
  contact: 'Contact'
};

export interface SeoSettings {
  siteName: string;
  description: string;
  keywords: string;
  author: string;
  canonicalUrl: string;   // no trailing slash
  ogImage: string;        // site-wide social image (absolute URL or /path)
  twitterHandle: string;
  robotsIndex: boolean;
  googleVerification: string;
  orgName: string;
  orgCity: string;
  orgCountry: string;
  pages: Record<PageKey, PageSeo>;
}

export interface RawDoc {
  id: string;
  [key: string]: unknown;
}

export interface RawContent {
  services: RawDoc[];
  projects: RawDoc[];
  testimonials: RawDoc[];
  site: Partial<SiteSettings> | null;
  seo: (Partial<Omit<SeoSettings, 'pages'>> & { pages?: Partial<Record<PageKey, Partial<PageSeo>>> }) | null;
}

export const emptyRaw: RawContent = { services: [], projects: [], testimonials: [], site: null, seo: null };

/**
 * Built-in items + saved documents:
 *  - a document with `builtinId` replaces (or hides) that built-in item,
 *  - any other document is a new, custom item.
 */
export function mergeItems<T extends Base>(
  defaults: T[],
  docs: RawDoc[],
  customDefaults: Record<string, unknown>
): T[] {
  const overrides = new Map<string, RawDoc>();
  const custom: RawDoc[] = [];
  docs.forEach(d => {
    if (typeof d.builtinId === 'string' && d.builtinId) overrides.set(d.builtinId, d);
    else custom.push(d);
  });

  const items: T[] = defaults.map(base => {
    const o = overrides.get(base.id);
    if (!o) return base;
    const rest: Record<string, unknown> = { ...o };
    delete rest.id;
    delete rest.builtinId;
    return {
      ...base,
      ...rest,
      id: base.id,
      docId: o.id,
      source: 'override',
      published: rest.published !== false,
      deleted: rest.deleted === true,
      order: typeof rest.order === 'number' ? rest.order : base.order
    } as unknown as T;
  });

  custom.forEach(d => {
    items.push({
      ...customDefaults,
      ...d,
      id: d.id,
      docId: d.id,
      source: 'custom',
      published: d.published !== false,
      deleted: false,
      order: typeof d.order === 'number' ? d.order : 1000
    } as unknown as T);
  });

  return items.sort((a, b) => a.order - b.order);
}

export const visibleOnly = <T extends Base>(items: T[]) => items.filter(i => i.published && !i.deleted);

/** Splits a string with newlines / commas into a clean list. */
export const toList = (value: string) =>
  value.split(/[\n,]/).map(v => v.trim()).filter(Boolean);
