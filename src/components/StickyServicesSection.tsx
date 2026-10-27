import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ServiceItem } from '../content/model';
import './StickyServicesSection.css';

interface StickyServicesSectionProps {
  services: ServiceItem[];
  initialServiceId?: string | null;
  showIntro?: boolean;
}

// Technical capability chips tailored per service
const serviceCapabilities: Record<string, string[]> = {
  'web-dev': ['React & TypeScript', 'Next-Gen UI/UX', 'Cloud & REST APIs', 'Sub-Second LCP'],
  'mobile-dev': ['Flutter & React Native', 'iOS & Android Ready', 'Offline Synchronization', 'Push Notifications'],
  'seo': ['Technical SEO Audits', 'Core Web Vitals 95+', 'JSON-LD Schema Markup', 'Organic Search Authority'],
  'software-testing': ['Automated Test Suites', 'API & Regression QA', 'Vulnerability Audits', 'Zero Downtime CI/CD'],
  'ecommerce': ['MTN MoMo & Airtel Money', 'Stripe & PayPal Checkouts', 'Automated Inventory', 'High Conversion UX'],
  'database-design': ['MySQL, Postgres & NoSQL', 'Schema Normalization', 'Complex Query Tuning', 'Automated Daily Backups']
};

const tickerItems = [
  'FULL-STACK ARCHITECTURE',
  'NATIVE MOBILE APPS',
  'AUTOMATED QUALITY ASSURANCE',
  'TECHNICAL SEARCH ENGINE OPTIMIZATION',
  'ENTERPRISE DATABASE ARCHITECTURE',
  'SEAMLESS E-COMMERCE INTEGRATIONS'
];

export default function StickyServicesSection({
  services,
  initialServiceId,
  showIntro = true
}: StickyServicesSectionProps) {
  const total = services.length;
  const initialIndex = initialServiceId
    ? Math.max(0, services.findIndex(s => s.id === initialServiceId))
    : 0;

  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Sync when initialServiceId changes
  useEffect(() => {
    if (!initialServiceId || total === 0) return;
    const idx = services.findIndex(s => s.id === initialServiceId);
    if (idx >= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(idx);
    }
  }, [initialServiceId, services, total]);

  // Autoplay
  useEffect(() => {
    if (total <= 1 || isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % total);
    }, 7000);
    return () => clearInterval(timer);
  }, [total, isPaused]);

  const prev = useCallback(() => {
    setActiveIndex(i => (i - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setActiveIndex(i => (i + 1) % total);
  }, [total]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  // Touch Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) prev();
      else next();
    }
    touchStartX.current = null;
  };

  if (total === 0) return null;

  return (
    <section
      className="sticky-services-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Services and capabilities interactive deck"
    >
      <div className="sticky-services-inner">
        {/* Header Block */}
        {showIntro && (
          <div className="sticky-services-header">
            <div className="sticky-services-badge">
              <span className="pulse-dot" />
              <span>CAPABILITIES &amp; EXPERTISE</span>
            </div>
            <h2 className="sticky-services-title">What I Can Do For You</h2>
            <p className="sticky-services-subtitle">
              Combining enterprise-grade software architecture, rapid mobile engineering, automated quality assurance,
              and high-converting search visibility into a unified engineering standard.
            </p>
          </div>
        )}

        {/* Marquee Ticker (Container element) */}
        <div className="sticky-services-ticker" aria-hidden="true">
          <div className="sticky-ticker-track">
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <div key={idx} className="sticky-ticker-item">
                <span>{item}</span>
                <span className="divider">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Pill Navigation Bar (Container element) */}
        <nav className="sticky-services-nav" aria-label="Services tabs">
          {services.map((svc, idx) => {
            const isActive = idx === activeIndex;
            const padNum = String(idx + 1).padStart(2, '0');
            return (
              <button
                key={svc.id}
                type="button"
                className={`sticky-nav-pill ${isActive ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                aria-current={isActive ? 'true' : 'false'}
                aria-label={`Jump to service: ${svc.title}`}
              >
                <span className="pill-num">{padNum}.</span>
                <span>{svc.title}</span>
              </button>
            );
          })}
        </nav>

        {/* 3D Stack Stage (Sticky-Card deck element) */}
        <div
          className="sticky-deck-viewport"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {services.map((svc, index) => {
            const diff = index - activeIndex;
            const isActive = diff === 0;

            // Geometry for Framer Sticky-Card perspective stack
            let transform = '';
            let opacity = 0;
            let zIndex = 1;
            let pointerEvents: 'auto' | 'none' = 'none';

            if (isActive) {
              transform = 'translate3d(-50%, 0, 0) scale(1) rotateX(0deg)';
              opacity = 1;
              zIndex = 30;
              pointerEvents = 'auto';
            } else if (diff > 0) {
              // Upcoming cards sitting behind in 3D stack
              const depth = Math.min(diff, 4);
              const translateY = depth * 18;
              const translateZ = -depth * 55;
              const scale = 1 - depth * 0.045;
              const rotateX = -depth * 1.8;
              transform = `translate3d(-50%, ${translateY}px, ${translateZ}px) scale(${scale}) rotateX(${rotateX}deg)`;
              opacity = Math.max(0, 1 - depth * 0.22);
              zIndex = 30 - depth;
            } else {
              // Past cards that exited the deck
              transform = 'translate3d(-50%, -60px, -120px) scale(0.92) rotateX(8deg)';
              opacity = 0;
              zIndex = 1;
            }

            const chips = serviceCapabilities[svc.id] || [
              svc.tag,
              'High Performance',
              'Clean Code Architecture',
              'Production Ready'
            ];

            const padCurrent = String(index + 1).padStart(2, '0');
            const padTotal = String(total).padStart(2, '0');

            return (
              <article
                key={svc.id}
                className={`sticky-deck-card ${isActive ? 'is-active' : ''}`}
                style={{
                  transform,
                  opacity,
                  zIndex,
                  pointerEvents
                }}
                aria-hidden={!isActive}
              >
                <div className="sticky-card-grid">
                  {/* Left Column: Info & Action */}
                  <div className="sticky-card-content">
                    <div>
                      <div className="sticky-card-top">
                        <span className="sticky-card-tag">{svc.tag}</span>
                        <span className="sticky-card-index">{padCurrent} / {padTotal}</span>
                      </div>

                      <div className="sticky-card-header">
                        <h3>{svc.title}</h3>
                        <p className="sticky-card-summary">{svc.summary}</p>
                        <p className="sticky-card-details">{svc.details}</p>
                      </div>

                      <div className="sticky-card-chips">
                        {chips.map((chip, i) => (
                          <span key={i} className="sticky-chip">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="sticky-card-actions">
                      <Link
                        to={`/contact?service=${svc.id}`}
                        className="sticky-btn-primary"
                        tabIndex={isActive ? 0 : -1}
                      >
                        <span>Start With This Service</span>
                        <span className="arrow" aria-hidden="true">→</span>
                      </Link>
                      <Link
                        to="/contact"
                        className="sticky-btn-ghost"
                        tabIndex={isActive ? 0 : -1}
                      >
                        Ask a Question
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Visual Showcase */}
                  <div className="sticky-card-visual">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      className="sticky-card-img"
                      loading={isActive ? 'eager' : 'lazy'}
                    />
                    <div className="sticky-card-img-overlay" />
                    <div className="sticky-visual-badge">
                      <span className="live-dot" />
                      <span>{svc.tag}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Controls & Progress Deck Footer */}
        <div className="sticky-deck-controls">
          <div className="sticky-control-btns">
            <button
              type="button"
              className="sticky-nav-btn"
              onClick={prev}
              aria-label="Previous service"
            >
              ←
            </button>
            <button
              type="button"
              className="sticky-nav-btn"
              onClick={next}
              aria-label="Next service"
            >
              →
            </button>
          </div>

          <div className="sticky-deck-progress" role="tablist" aria-label="Service slide progression">
            {services.map((svc, idx) => (
              <button
                key={svc.id}
                type="button"
                className={`sticky-progress-dot ${idx === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Jump to ${svc.title}`}
                aria-selected={idx === activeIndex}
              />
            ))}
          </div>

          <div className="sticky-deck-counter">
            <strong>{String(activeIndex + 1).padStart(2, '0')}</strong> of {String(total).padStart(2, '0')}
          </div>
        </div>
      </div>
    </section>
  );
}
