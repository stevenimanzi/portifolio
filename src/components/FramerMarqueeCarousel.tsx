import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './FramerMarqueeCarousel.css';

export interface FramerCarouselItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  image: string;
  link?: string;
  detailLink?: string;
  ctaText?: string;
}

interface FramerMarqueeCarouselProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle: string;
  items: FramerCarouselItem[];
  sectionId?: string;
  direction?: 'left' | 'right';
  speed?: number; // pixels per second (default: 42)
}

export default function FramerMarqueeCarousel({
  eyebrow,
  title,
  subtitle,
  items,
  sectionId,
  direction = 'left',
  speed = 42
}: FramerMarqueeCarouselProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Position and physics refs (60fps continuous animation without triggering React re-renders)
  const posRef = useRef({
    x: 0,
    lastTime: 0,
    isPointerDown: false,
    startX: 0,
    dragStartX: 0,
    velocity: 0,
    lastPointerX: 0,
    lastPointerTime: 0,
    setWidth: 0
  });

  const total = items.length;
  // Double buffer for seamless infinite loop (100% like Framer InfiniteTrack)
  const duplicated = [...items, ...items];

  // Measure one set width
  const measureSetWidth = useCallback(() => {
    if (!trackRef.current) return;
    const cards = trackRef.current.children;
    if (cards.length >= total && total > 0) {
      let width = 0;
      for (let i = 0; i < total; i++) {
        const card = cards[i] as HTMLElement;
        width += card.offsetWidth + 24; // width + gap
      }
      posRef.current.setWidth = width;
    }
  }, [total]);

  useEffect(() => {
    measureSetWidth();
    window.addEventListener('resize', measureSetWidth);
    return () => window.removeEventListener('resize', measureSetWidth);
  }, [measureSetWidth]);

  // Infinite Animation Loop
  useEffect(() => {
    let active = true;

    const tick = (now: number) => {
      if (!active) return;
      const p = posRef.current;
      if (p.lastTime === 0) p.lastTime = now;
      const dt = Math.min(now - p.lastTime, 100);
      p.lastTime = now;

      if (p.setWidth > 0) {
        if (!p.isPointerDown) {
          // Physics decay after drag release
          if (Math.abs(p.velocity) > 0.05) {
            p.x += p.velocity * (dt / 16.67);
            p.velocity *= Math.pow(0.92, dt / 16.67);
          } else {
            p.velocity = 0;
            // Base continuous marquee speed with hover deceleration
            const speedMultiplier = isHovered ? 0.2 : 1;
            const step = (speed * (dt / 1000)) * speedMultiplier;
            p.x += direction === 'left' ? -step : step;
          }

          // Seamless loop wrap
          const setW = p.setWidth;
          p.x = ((p.x % setW) - setW) % setW;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${p.x}px, 0, 0)`;
        }
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    posRef.current.lastTime = performance.now();
    animationFrameId.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [direction, speed, isHovered]);

  // Pointer drag events with velocity tracking
  const onPointerDown = (e: React.PointerEvent) => {
    const p = posRef.current;
    p.isPointerDown = true;
    p.startX = e.clientX;
    p.dragStartX = p.x;
    p.lastPointerX = e.clientX;
    p.lastPointerTime = performance.now();
    p.velocity = 0;
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = posRef.current;
    if (!p.isPointerDown) return;

    const now = performance.now();
    const dt = now - p.lastPointerTime || 16;
    const deltaX = e.clientX - p.lastPointerX;

    p.x = p.dragStartX + (e.clientX - p.startX);
    p.velocity = deltaX / (dt / 16.67);

    p.lastPointerX = e.clientX;
    p.lastPointerTime = now;

    if (p.setWidth > 0) {
      p.x = ((p.x % p.setWidth) - p.setWidth) % p.setWidth;
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${p.x}px, 0, 0)`;
    }
  };

  const onPointerUp = () => {
    posRef.current.isPointerDown = false;
    setIsDragging(false);
  };

  // Manual smooth button navigation
  const navigateBy = (delta: number) => {
    const p = posRef.current;
    p.velocity = delta;
  };

  if (total === 0) return null;

  return (
    <section
      id={sectionId}
      className="framer-tc-section"
      aria-label="Carousel section"
    >
      <div className="framer-tc-outer">
        {/* 1. Header & Controls */}
        <div className="framer-tc-header">
          <div className="framer-tc-intro-content">
            {eyebrow && (
              <span className="framer-tc-eyebrow">
                <span className="eyebrow-pulse-dot" />
                <span>{eyebrow}</span>
              </span>
            )}

            <h2 className="framer-tc-title">{title}</h2>
            <p className="framer-tc-subtitle">{subtitle}</p>
          </div>

          <div className="framer-tc-controls">
            <button
              type="button"
              className="framer-tc-nav-btn"
              onClick={() => navigateBy(24)}
              aria-label="Scroll carousel left"
            >
              ←
            </button>
            <button
              type="button"
              className="framer-tc-nav-btn"
              onClick={() => navigateBy(-24)}
              aria-label="Scroll carousel right"
            >
              →
            </button>
          </div>
        </div>

        {/* 2. Marquee Stage with Fade Masks */}
        <div
          ref={stageRef}
          className="framer-tc-stage"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            onPointerUp();
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="framer-tc-fade-left" aria-hidden="true" />
          <div className="framer-tc-fade-right" aria-hidden="true" />

          {/* 3. Infinite Translation Track */}
          <div ref={trackRef} className="framer-tc-track">
            {duplicated.map((item, idx) => {
              const initial = item.title.charAt(0).toUpperCase();
              const hasExternalLink = item.link && item.link !== '#';
              const targetRoute = item.detailLink || (hasExternalLink ? item.link : undefined);

              return (
                <article
                  key={`${item.id}-${idx}`}
                  className="framer-tc-card"
                  aria-label={item.title}
                >
                  <div>
                    {/* Card Top: Category Tag (Stars & Screen Count Removed) */}
                    <div className="framer-card-top-row">
                      <span className="framer-card-pill">{item.tag}</span>
                    </div>

                    {/* Card Image Box */}
                    <div className="framer-card-media">
                      <img src={item.image} alt={item.title} loading="lazy" />
                      <div className="framer-card-media-overlay" />

                      {hasExternalLink && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="framer-card-action-btn"
                          aria-label={`Visit live website for ${item.title}`}
                          title="Open live link"
                          onClick={e => isDragging && e.preventDefault()}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="framer-card-body">
                      <h3 className="framer-card-title">{item.title}</h3>
                      <p className="framer-card-text">{item.description}</p>
                    </div>
                  </div>

                  {/* Card Footer: Author info & CTA */}
                  <div className="framer-card-footer">
                    <div className="framer-author-group">
                      <div className="framer-author-avatar" aria-hidden="true">
                        {initial}
                      </div>
                      <div className="framer-author-meta">
                        <span className="framer-author-name">{item.title}</span>
                        <span className="framer-author-role">{item.tag}</span>
                      </div>
                    </div>

                    {targetRoute && (
                      targetRoute.startsWith('/') ? (
                        <Link
                          to={targetRoute}
                          className="framer-card-cta-btn"
                          onClick={e => isDragging && e.preventDefault()}
                        >
                          <span>{item.ctaText || 'Explore'}</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <a
                          href={targetRoute}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="framer-card-cta-btn"
                          onClick={e => isDragging && e.preventDefault()}
                        >
                          <span>{item.ctaText || 'View Live'}</span>
                          <span aria-hidden="true">→</span>
                        </a>
                      )
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
