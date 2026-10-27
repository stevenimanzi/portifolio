import {
  PAGE_KEYS,
  mergeItems,
  visibleOnly,
  type PageKey,
  type PageSeo,
  type ProjectItem,
  type RawContent,
  type SeoSettings,
  type ServiceItem,
  type SiteSettings,
  type TestimonialItem
} from './model';
import {
  defaultProjects,
  defaultSeo,
  defaultServices,
  defaultSite,
  defaultTestimonials,
  resolveImage
} from './defaults';

export interface Content {
  services: ServiceItem[];
  projects: ProjectItem[];
  testimonials: TestimonialItem[];
  site: SiteSettings;
  seo: SeoSettings;
}

/** Everything, including hidden / deleted items (the admin dashboard needs these too). */
export function buildAll(raw: RawContent) {
  const services = mergeItems<ServiceItem>(defaultServices, raw.services, { title: '', tag: '', summary: '', details: '', image: '' });
  const projects = mergeItems<ProjectItem>(defaultProjects, raw.projects, { name: '', type: 'Web App', description: '', link: '', images: [] });
  const testimonials = mergeItems<TestimonialItem>(defaultTestimonials, raw.testimonials, { name: '', role: '', text: '' });

  const site: SiteSettings = { ...defaultSite, ...(raw.site ?? {}) };

  const pages = {} as Record<PageKey, PageSeo>;
  PAGE_KEYS.forEach(k => {
    pages[k] = { ...defaultSeo.pages[k], ...(raw.seo?.pages?.[k] ?? {}) } as PageSeo;
  });
  const seo: SeoSettings = { ...defaultSeo, ...(raw.seo ?? {}), pages } as SeoSettings;
  if (seo.ogImage === '/profile.jpg') seo.ogImage = defaultSeo.ogImage;
  if (!seo.googleVerification) seo.googleVerification = defaultSeo.googleVerification;

  return { services, projects, testimonials, site, seo };
}

/** What visitors see: published items only, with image tokens turned into real URLs. */
export function buildContent(raw: RawContent): Content {
  const all = buildAll(raw);
  return {
    services: visibleOnly(all.services).map(s => ({ ...s, image: resolveImage(s.image) })),
    projects: visibleOnly(all.projects)
      .map(p => ({ ...p, images: p.images.map(resolveImage).filter(Boolean) })),
    testimonials: visibleOnly(all.testimonials),
    site: all.site,
    seo: all.seo
  };
}
