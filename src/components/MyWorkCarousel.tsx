import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectItem } from '../content/model';
import './MyWorkCarousel.css';

interface MyWorkCarouselProps {
  projects: ProjectItem[];
}

export default function MyWorkCarousel({ projects }: MyWorkCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = projects.length;

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check if on desktop container scrolls or track scrolls on mobile
    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;

    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);

    // Estimate active card index
    const cardWidth = 380 + 24; // card width + gap
    const idx = Math.min(total - 1, Math.max(0, Math.round(scrollLeft / cardWidth)));
    setCurrentIndex(idx);
  }, [total]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    const scrollAmount = 404; // 380px card + 24px gap
    const delta = direction === 'left' ? -scrollAmount : scrollAmount;

    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') scroll('left');
    if (e.key === 'ArrowRight') scroll('right');
  };

  if (total === 0) return null;

  return (
    <section
      className="work-carousel-section"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="My Work and engineering projects carousel"
    >
      <div className="work-carousel-outer">
        {/* Left & Right Fade Masks (Matches Framer Marquee/Track) */}
        <div className="work-fade-mask-left" aria-hidden="true" />
        <div className="work-fade-mask-right" aria-hidden="true" />

        <div className="work-carousel-container" ref={containerRef}>
          {/* 1. Intro Section (Matches Framer .ts-onscroll-intro) */}
          <div className="work-carousel-intro">
            <span className="work-intro-eyebrow">
              <span className="eyebrow-dot" />
              <span>FEATURED PORTFOLIO</span>
            </span>

            <h2 className="work-intro-title">
              Selected Works &amp; <strong>Engineering.</strong>
            </h2>

            <p className="work-intro-desc">
              Explore real-world platforms built with strict quality standards, clean code architecture, 
              and high-performance full-stack execution.
            </p>

            <div className="work-intro-controls">
              <div className="work-nav-btn-group">
                <button
                  type="button"
                  className="work-nav-btn"
                  onClick={() => scroll('left')}
                  disabled={!canScrollLeft}
                  aria-label="Scroll to previous project"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="work-nav-btn"
                  onClick={() => scroll('right')}
                  disabled={!canScrollRight}
                  aria-label="Scroll to next project"
                >
                  →
                </button>
                <span className="work-counter-text">
                  <strong>{String(currentIndex + 1).padStart(2, '0')}</strong> / {String(total).padStart(2, '0')}
                </span>
              </div>

              <Link to="/projects" className="work-explore-all-link">
                <span>View All Projects in Archive</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* 2. Track of Cards (Matches Framer .ts-onscroll-track) */}
          <div className="work-carousel-track">
            {projects.map((project) => {
              const coverImg = project.images[0] || '';
              const screensCount = project.images.length;
              const initial = project.name.charAt(0).toUpperCase();
              const hasLiveLink = project.link && project.link !== '#';

              return (
                <article
                  key={project.id}
                  className="work-glamour-card"
                  aria-label={`Project: ${project.name}`}
                >
                  <div>
                    {/* Card Header: 5 Stars + Screens badge */}
                    <div className="work-card-header">
                      <div
                        className="work-card-stars"
                        role="img"
                        aria-label="5 out of 5 stars quality build"
                      >
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className="work-star-icon"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      <span className="work-card-screens-badge">
                        {screensCount > 0 ? `${screensCount} Screens` : 'Live Project'}
                      </span>
                    </div>

                    {/* Image Preview Box */}
                    <div className="work-card-image-box">
                      <img
                        src={coverImg}
                        alt={`${project.name} interface preview`}
                        loading="lazy"
                      />
                      <div className="work-card-image-fade" />
                      <span className="work-card-type-chip">{project.type}</span>

                      {hasLiveLink && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="work-card-link-icon"
                          aria-label={`Visit live website for ${project.name}`}
                          title="Open live site"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="work-card-body">
                      <h3 className="work-card-title">{project.name}</h3>
                      <p className="work-card-desc">{project.description}</p>
                    </div>
                  </div>

                  {/* Card Footer: Author info & Details link */}
                  <div className="work-card-footer">
                    <div className="work-author-info">
                      <div className="work-author-avatar" aria-hidden="true">
                        {initial}
                      </div>
                      <div className="work-author-meta">
                        <span className="work-author-name">{project.name}</span>
                        <span className="work-author-role">{project.type}</span>
                      </div>
                    </div>

                    <Link
                      to={`/projects?project=${project.id}`}
                      className="work-card-detail-btn"
                    >
                      <span>Explore</span>
                      <span aria-hidden="true">→</span>
                    </Link>
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
