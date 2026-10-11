import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './reveal.css';

type Variant = 'up' | 'left' | 'right' | 'zoom' | 'blur';

interface Target {
  sel: string;
  variant: Variant;
  /** Cards in a row enter one after another */
  stagger?: boolean;
  delay?: number;
}

/* Every section of the site, and how it enters when the visitor scrolls to it.
   Elements are tagged from here, so the page components stay untouched. */
const TARGETS: Target[] = [
  // Section titles
  { sel: '.section-header', variant: 'blur' },
  { sel: '.page-intro', variant: 'blur' },
  { sel: '.education-header', variant: 'blur' },

  // Home
  { sel: '.services-section .arc-carousel-container', variant: 'zoom', delay: 120 },
  { sel: '.projects-section .arc-carousel-container', variant: 'zoom', delay: 120 },
  { sel: '.carousel-controls', variant: 'up', delay: 250 },
  { sel: '.testimonial-stage', variant: 'zoom', delay: 120 },
  { sel: '.testimonial-author', variant: 'up', delay: 300 },

  // Services / Projects
  { sel: '.cover-wrap', variant: 'zoom', delay: 100 },
  { sel: '.mb-carousel', variant: 'zoom', delay: 100 },
  { sel: '.mb-visit', variant: 'up', delay: 200 },

  // Skills
  { sel: '.skills-filters', variant: 'up' },
  { sel: '.skill-card-new', variant: 'up', stagger: true },
  { sel: '.contour-timeline-wrapper', variant: 'zoom' },
  { sel: '.education-section .arc-carousel-container', variant: 'zoom', delay: 120 },

  // Contact & shared
  { sel: '.cta-band', variant: 'up' },
  { sel: '.footer-brand', variant: 'left' },
  { sel: '.footer-link-group', variant: 'up', stagger: true },
  { sel: '.footer-bottom', variant: 'up', delay: 200 }
];

const REMOVE_AFTER_MS = 1900; // hand the element back to its own hover/transition styles

/** Scroll-triggered entrance animations for every section. Renders nothing. */
export default function RevealManager() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (pathname.startsWith('/admin')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const root = document.documentElement;
    root.classList.add('rv-on');

    let pending: HTMLElement[] = [];
    const timers: number[] = [];

    const tag = () => {
      TARGETS.forEach(target => {
        const found = document.querySelectorAll<HTMLElement>(target.sel);
        found.forEach((el, index) => {
          if (el.dataset.rv || el.classList.contains('is-visible')) return;
          if (el.getBoundingClientRect().height === 0) return; // not laid out (yet)
          el.dataset.rv = target.variant;
          const stagger = target.stagger ? Math.min(index, 5) * 90 : 0;
          el.style.setProperty('--rv-delay', `${(target.delay ?? 0) + stagger}ms`);
          el.classList.add('rv');
          pending.push(el);
        });
      });
    };

    const reveal = (el: HTMLElement) => {
      el.classList.add('is-visible');
      const delay = parseInt(el.style.getPropertyValue('--rv-delay'), 10) || 0;
      timers.push(
        window.setTimeout(() => {
          el.classList.remove('rv', 'is-visible');
          delete el.dataset.rv;
          el.style.removeProperty('--rv-delay');
        }, REMOVE_AFTER_MS + delay)
      );
    };

    const check = () => {
      if (pending.length === 0) return;
      const limit = window.innerHeight * 0.92;
      pending = pending.filter(el => {
        if (!el.isConnected) return false;
        const r = el.getBoundingClientRect();
        if (r.top < limit && r.bottom > 0) {
          reveal(el);
          return false;
        }
        return true;
      });
    };

    // Tag before the browser paints, so nothing flashes visible and then hides again.
    tag();
    check();

    // Content that mounts later (lazy pages, filters) is tagged in the same frame it appears.
    const onDomChange = () => {
      tag();
      check();
    };

    const observer = new MutationObserver(onDomChange);
    observer.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);

    return () => {
      timers.forEach(t => window.clearTimeout(t));
      observer.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      root.classList.remove('rv-on');
      // leave nothing half-hidden behind when the page changes
      document.querySelectorAll<HTMLElement>('.rv').forEach(el => {
        el.classList.remove('rv', 'is-visible');
        delete el.dataset.rv;
        el.style.removeProperty('--rv-delay');
      });
    };
  }, [pathname]);

  return null;
}
