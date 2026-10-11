import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Services.css';
import { useContent } from '../content/ContentContext';
import PageHero from '../components/PageHero';
import CtaBand from '../components/CtaBand';

const AUTOPLAY_MS = 8000;

// Shortest signed distance around the ring, so the last card sits left of the first.
const getCircularOffset = (index: number, current: number, total: number) => {
  let offset = index - current;
  const half = Math.floor(total / 2);
  if (offset > half) offset -= total;
  else if (offset < -(total - 1 - half)) offset += total;
  return offset;
};

export default function Services() {
  const { services: servicesData } = useContent();
  const total = servicesData.length;
  // Arriving from the Home page ("Click to read more"): open on that service and keep it in view.
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('service');
  const requestedIndex = requested ? servicesData.findIndex(s => s.id === requested) : -1;
  const [activeRaw, setActiveIndex] = useState(() => (requestedIndex >= 0 ? requestedIndex : 2));
  const [autoplayOn] = useState(requestedIndex < 0); // do not rotate away while they read the details
  const [paused, setPaused] = useState(false);
  // services can be added / hidden from the dashboard, so keep the index inside the list
  const activeIndex = Math.min(activeRaw, Math.max(0, total - 1));

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!requested) return;
    const timer = window.setTimeout(() => {
      document.querySelector('.cover-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [requested]);

  useEffect(() => {
    if (!autoplayOn || total < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % total);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [autoplayOn, paused, total]);

  const prev = () => setActiveIndex(i => (i - 1 + total) % total);
  const next = () => setActiveIndex(i => (i + 1) % total);

  return (
    <div className="services-page">
      <PageHero
        title="My"
        accent="Services"
        subtitle="Simple, reliable digital solutions to help your business grow, scale, and succeed."
      />

      <div className="page-body">
        <div className="page-intro">
          <h2>What I can build for you</h2>
          <p>From your first website to security cameras and AI automation, every service is handled end to end.</p>
        </div>

        <div
          className="cover-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={e => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
          }}
        >
          <div className="cover-stage">
            {servicesData.map((service, index) => {
              const offset = getCircularOffset(index, activeIndex, total);
              const isActive = offset === 0;

              return (
                <article
                  key={service.id}
                  className={`cover-card ${isActive ? 'active' : ''}`}
                  style={{
                    '--x': `${offset * 280}px`,
                    '--z': `${Math.abs(offset) * -200}px`,
                    '--ry': `${offset * -25}deg`,
                    '--rz': `${offset * 2}deg`,
                    '--s': isActive ? 1 : 1 - Math.abs(offset) * 0.05,
                    zIndex: isActive ? 20 : 10 - Math.abs(offset)
                  } as React.CSSProperties}
                  // Side cards act as buttons that bring themselves to the center.
                  {...(!isActive && {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': `Show ${service.title}`,
                    onClick: () => setActiveIndex(index),
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveIndex(index);
                      }
                    }
                  })}
                >
                  <div className="cover-image">
                    <img src={service.image} alt={isActive ? service.title : ''} />
                    <div className="cover-image-fade"></div>
                  </div>

                  <div className="cover-body">
                    <h3>{service.title}</h3>
                    <p className="cover-summary">{service.summary}</p>
                    <p className="cover-details">{service.details}</p>
                    <Link to="/contact" className="cover-cta" tabIndex={isActive ? 0 : -1}>
                      Request service <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="cover-controls">
            <button type="button" className="btn-neon-outline" onClick={prev}>← Prev</button>
            <div className="cover-dots">
              {servicesData.map((service, index) => (
                <button
                  key={service.id}
                  type="button"
                  className={`cover-dot ${index === activeIndex ? 'active' : ''}`}
                  aria-label={`Go to ${service.title}`}
                  aria-current={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
            <button type="button" className="btn-neon-outline" onClick={next}>Next →</button>
          </div>
        </div>

        <CtaBand
          title="Not sure which service you need?"
          text="Tell me about your business and I will recommend the simplest way to get results."
        />
      </div>
    </div>
  );
}
