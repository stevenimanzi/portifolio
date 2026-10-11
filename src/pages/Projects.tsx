import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Projects.css';
import PageHero from '../components/PageHero';
import CtaBand from '../components/CtaBand';
import { useContent } from '../content/ContentContext';

const AUTOPLAY_MS = 5000;

// Slide look per distance from the active one (index 0 sits inside the laptop screen).
const LOOK: Record<number, { tx: number; scale: number; opacity: number; dim: number }> = {
  0: { tx: 0, scale: 1, opacity: 1, dim: 1 },
  1: { tx: 0.78, scale: 0.5, opacity: 0.95, dim: 0.75 },
  2: { tx: 1.36, scale: 0.44, opacity: 0.4, dim: 0.5 }
};

const getCircularOffset = (index: number, current: number, total: number) => {
  let offset = index - current;
  const half = Math.floor(total / 2);
  if (offset > half) offset -= total;
  else if (offset < -(total - 1 - half)) offset += total;
  return offset;
};

export default function Projects() {
  const { projects } = useContent();
  // One flat list of slides: project 1's screens, then project 2's, and so on.
  const slides = useMemo(
    () => projects.flatMap((project, projectIndex) =>
      project.images.map((src, i) => ({ src, projectIndex, screen: i + 1, screens: project.images.length }))
    ),
    [projects]
  );
  const total = slides.length;

  // Arriving from the Home page: open on the project that was clicked.
  const [searchParams] = useSearchParams();
  const [indexRaw, setIndex] = useState(() => {
    const wanted = projects.findIndex(p => p.id === searchParams.get('project'));
    const first = wanted >= 0 ? slides.findIndex(sl => sl.projectIndex === wanted) : -1;
    return first >= 0 ? first : 0;
  });
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  // projects can be added / hidden from the dashboard, so keep the index inside the list
  const index = Math.min(indexRaw, Math.max(0, total - 1));

  const current = slides[index];
  const project = current ? projects[current.projectIndex] : undefined;
  const projectSlides = useMemo(
    () => slides.map((s, i) => ({ ...s, i })).filter(s => s.projectIndex === current?.projectIndex),
    [slides, current?.projectIndex]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Warm the cache for the next few screenshots so they never pop in while sliding.
  useEffect(() => {
    if (total === 0) return;
    for (let k = 1; k <= 3; k++) {
      const img = new Image();
      img.src = slides[(index + k) % total].src;
    }
  }, [index, total, slides]);

  // Auto-advance. Re-arms after every change, so a manual click restarts the wait.
  useEffect(() => {
    if (total < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setIndex(i => (i + 1) % total), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, total]);

  const prev = () => setIndex(i => (i - 1 + total) % total);
  const next = () => setIndex(i => (i + 1) % total);

  if (!current || !project) {
    return (
      <div className="projects-page">
        <PageHero
          title="Featured"
          accent="Projects"
          subtitle="Systems, platforms, and websites built to solve real business problems."
        />
        <div className="page-body projects-body">
          <CtaBand
            title="Want something like this for your business?"
            text="Every project started with a simple conversation. Let's talk about yours."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <PageHero
        title="Featured"
        accent="Projects"
        subtitle="Systems, platforms, and websites built to solve real business problems."
      />

      <div className="page-body projects-body">
        <section
          className="mb-carousel"
          aria-roledescription="carousel"
          aria-label="Project screenshots"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={e => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
          }}
        >
          <div
            className="mb-stage"
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
            }}
          >
            {/* Screenshots: only the active one and its neighbours are mounted */}
            {slides.map((slide, i) => {
              const offset = getCircularOffset(i, index, total);
              const distance = Math.abs(offset);
              if (distance > 2) return null;
              const look = LOOK[distance];
              const isActive = offset === 0;

              return (
                <div
                  key={slide.src}
                  className={`mb-slide ${isActive ? 'active' : ''}`}
                  style={{
                    '--tx': Math.sign(offset) * look.tx,
                    '--s': look.scale,
                    '--dim': look.dim,
                    opacity: look.opacity,
                    zIndex: 2 - distance
                  } as React.CSSProperties}
                  onClick={isActive ? undefined : () => setIndex(i)}
                  aria-hidden={!isActive}
                >
                  <img
                    src={slide.src}
                    alt={isActive ? `${projects[slide.projectIndex].name}, screen ${slide.screen} of ${slide.screens}` : ''}
                    decoding="async"
                    draggable={false}
                  />
                </div>
              );
            })}

            {/* MacBook: bezel is drawn over the slides, the screen area stays see-through */}
            <div className="mb-lid" aria-hidden="true"></div>
            <div className="mb-base" aria-hidden="true"></div>

            <button type="button" className="mb-arrow mb-arrow-prev" onClick={prev} aria-label="Previous screenshot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button type="button" className="mb-arrow mb-arrow-next" onClick={next} aria-label="Next screenshot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <div className="mb-caption" aria-live="polite" key={project.id}>
            <h2>{project.name}</h2>
            <p>{project.type} · Screen {current.screen} of {current.screens}</p>
          </div>

          <div className="mb-dots" role="group" aria-label={`${project.name} screenshots`}>
            {projectSlides.map(s => (
              <button
                key={s.src}
                type="button"
                className={`mb-dot ${s.i === index ? 'active' : ''}`}
                aria-label={`Show screen ${s.screen}`}
                aria-current={s.i === index}
                onClick={() => setIndex(s.i)}
              />
            ))}
          </div>
        </section>

        <div className="mb-visit">
          {project.link !== '#' ? (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn-neon">
              Visit {project.name} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span className="mb-private">{project.name} is a private project</span>
          )}
        </div>

        <CtaBand
          title="Want something like this for your business?"
          text="Every project above started with a simple conversation. Let's talk about yours."
        />
      </div>
    </div>
  );
}
