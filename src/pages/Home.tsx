import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Timeline from '../components/Timeline';
import StickyServicesSection from '../components/StickyServicesSection';
import { useContent } from '../content/ContentContext';



// Horizontal swipe on touch screens moves a carousel by one card.
function swipeHandlers(move: (direction: 1 | -1) => void) {
  let startX: number | null = null;
  return {
    onTouchStart: (e: React.TouchEvent) => { startX = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
    }
  };
}

export default function Home() {
  const { services: servicesData, projects, testimonials, site } = useContent();
  const featuredProjects = projects.map(p => ({
    id: p.id,
    name: p.name,
    image: p.images[0] ?? '',
    type: p.type,
    desc: p.description,
    link: p.link
  }));

  const [projectRaw, setProjectCarouselIndex] = useState(2);
  const [activeProjectCardId, setActiveProjectCardId] = useState<string | null>(null);
  const [testimonialRaw, setActiveTestimonialIndex] = useState(0);
  // Items can be added / hidden from the dashboard, so keep every index inside the list.
  const projectCarouselIndex = Math.min(projectRaw, Math.max(0, featuredProjects.length - 1));
  const activeTestimonialIndex = Math.min(testimonialRaw, Math.max(0, testimonials.length - 1));

  const getCircularOffset = (index: number, currentIndex: number, totalLength: number) => {
    let offset = index - currentIndex;
    const half = Math.floor(totalLength / 2);
    if (offset > half) offset -= totalLength;
    else if (offset < -(totalLength - 1 - half)) offset += totalLength;
    return offset;
  };

  // Autoplay for Testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonialIndex(prev => (prev >= testimonials.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Autoplay for Projects Carousel
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeProjectCardId === null) {
      interval = setInterval(() => {
        setProjectCarouselIndex(prev => (prev >= featuredProjects.length - 1 ? 0 : prev + 1));
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [activeProjectCardId, featuredProjects.length]);

  const startYear = site.yearsStart;
  const currentYear = new Date().getFullYear();
  const yearsExp = Math.max(1, currentYear - startYear);

  return (
    <main className="home-container">
      <section className="syntax-hero" aria-labelledby="main-hero-heading">
        <div className="syntax-content">

          
          {/* Right Quote */}
          <div className="syntax-quote-container">
            <p className="syntax-quote" style={{ whiteSpace: 'pre-line' }}>{site.heroQuote}</p>
          </div>
          
          {/* Bottom Area */}
          <div className="syntax-bottom">
            <div className="syntax-stats">
              <div className="syntax-stat-text">{startYear} <span className="syntax-arrow">→</span> {currentYear}</div>
              <div className="syntax-stat-highlight">{yearsExp}+ yrs exp.</div>
            </div>
            
            <div className="syntax-main-title">
              <h1 id="main-hero-heading" className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)' }}>
                Steven Imanzi - Top Web and Software Developer in Kigali, Rwanda
              </h1>
              <div className="syntax-huge-text" aria-hidden="true">
                STEVEN<br/>IMANZI
              </div>
              <p className="syntax-role">{site.role}</p>
            </div>
            
          </div>
        </div>
      </section>

      {servicesData.length > 0 && (
        <StickyServicesSection services={servicesData} showIntro={true} />
      )}

      {/* 2. Scroll timeline: one year at a time */}
      <Timeline />

      {/* 3. Featured Projects Arc Carousel */}
      {featuredProjects.length > 0 && (
      <section className="projects-section section">
        <div className="container">
          <div className="section-header">
            <h2 className="gradient-text">My Work</h2>
            <p style={{color: '#aaa', marginTop: '1rem'}}>A selection of recent projects I have built.</p>
          </div>
          
          <div
            className="arc-carousel-container cf"
            style={{marginTop: '4rem'}}
            {...swipeHandlers(dir => setProjectCarouselIndex(i => Math.min(featuredProjects.length - 1, Math.max(0, i + dir))))}
          >
            {featuredProjects.map((project, index) => {
              const offset = getCircularOffset(index, projectCarouselIndex, featuredProjects.length);
              const isExpanded = activeProjectCardId === project.id;
              
              const distance = Math.abs(offset);

              return (
                <div 
                  key={project.id}
                  className={`arc-carousel-card cf-card project-arc-card ${isExpanded ? 'expanded' : ''} ${offset === 0 ? 'active' : ''}`}
                  style={{
                    '--o': offset,
                    '--ao': distance,
                    '--s': offset === 0 ? 1 : 1 - distance * 0.05,
                    zIndex: offset === 0 ? 20 : 10 - distance,
                    padding: 0,
                    overflow: 'hidden'
                  } as React.CSSProperties}
                  onClick={() => {
                    if (offset !== 0) {
                      setProjectCarouselIndex(index);
                    } else {
                      setActiveProjectCardId(activeProjectCardId === project.id ? null : project.id);
                    }
                  }}
                >
                  <div className="card-content-wrapper" style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%'}}>
                    <div className="project-expanded-image" style={{width: '100%', height: isExpanded ? '200px' : '160px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                      <img src={project.image} alt={project.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                    
                    <div style={{padding: isExpanded ? '1.5rem 2rem' : '1.5rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
                      <h3 style={{fontSize: isExpanded ? '1.5rem' : '1.3rem', marginBottom: '0.4rem', color: '#fff'}}>{project.name}</h3>
                      <p className="summary" style={{color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '1rem'}}>{project.type}</p>
                      
                      <p style={{fontSize: '0.9rem', color: '#ccc', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{project.desc}</p>
                      
                      <div className="details-content" style={{flex: 1}}>
                        {isExpanded && (
                          <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                            {project.link !== '#' && (
                              <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{textDecoration: 'none', padding: '0.6rem 1.2rem'}}>
                                View Live
                              </a>
                            )}
                            <button 
                              className="btn btn-primary close-btn" 
                              style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.6rem 1.2rem', marginTop: 0}}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setActiveProjectCardId(null); 
                              }}
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {!isExpanded && offset === 0 && (
                        <Link to={`/projects?project=${project.id}`} className="read-more-hint" style={{marginTop: 'auto', textDecoration: 'none', display: 'block'}} onClick={(e) => e.stopPropagation()}>
                          Click to view details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="carousel-controls cf-controls">
            <button 
              className="carousel-btn prev-btn" 
              onClick={() => setProjectCarouselIndex(Math.max(0, projectCarouselIndex - 1))}
              disabled={projectCarouselIndex === 0}
            >
              ← Prev
            </button>
            <div className="carousel-indicators">
              {featuredProjects.map((_, index) => (
                <span 
                  key={index} 
                  className={`indicator-dot ${index === projectCarouselIndex ? 'active' : ''}`}
                  onClick={() => {
                    setProjectCarouselIndex(index);
                    setActiveProjectCardId(null);
                  }}
                />
              ))}
            </div>
            <button 
              className="carousel-btn next-btn" 
              onClick={() => setProjectCarouselIndex(Math.min(featuredProjects.length - 1, projectCarouselIndex + 1))}
              disabled={projectCarouselIndex === featuredProjects.length - 1}
            >
              Next →
            </button>
          </div>
        </div>
      </section>
      )}

      {/* 4. Testimonials Section */}
      {testimonials.length > 0 && (
      <section className="testimonials-section section" style={{marginTop: '4rem'}}>
        <div className="container">
          <div className="section-header">
            <h2 className="gradient-text">Client & Team Feedback</h2>
            <p style={{color: '#aaa', marginTop: '1rem'}}>What the people I work with have to say.</p>
          </div>
          
          {/* Hanger Layout */}
          <div className="testimonial-stage" style={{ position: 'relative', marginTop: '2rem', 
            height: '350px',
            display: 'flex', 
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            {/* Top horizontal line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '5%',
              right: '5%',
              height: '1px',
              background: 'rgba(255,255,255,0.15)'
            }}></div>

            {/* Testimonial Cards */}
            {testimonials.map((test, index) => {
              const offset = getCircularOffset(index, activeTestimonialIndex, testimonials.length);
              
              // Math for hanger position
              const xPos = offset * 340; 
              const rotation = offset * 4; // Slight tilt
              const scale = offset === 0 ? 1 : 0.85;
              const opacity = Math.abs(offset) > 1 ? 0 : (offset === 0 ? 1 : 0.4);
              const zIndex = 10 - Math.abs(offset);
              
              return (
                <div key={index} style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: `translateX(calc(-50% + ${xPos}px))`,
                  transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
                  zIndex,
                  opacity,
                  pointerEvents: Math.abs(offset) > 1 ? 'none' : 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  {/* Vertical string */}
                  <div style={{
                    width: '1px',
                    height: offset === 0 ? '30px' : '50px',
                    background: 'rgba(255,255,255,0.15)',
                    transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
                  }}></div>
                  
                  {/* Card */}
                  <div 
                    onClick={() => setActiveTestimonialIndex(index)}
                    style={{
                      background: 'rgba(20, 20, 20, 0.7)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '2.5rem 2rem',
                      width: '320px',
                      height: '300px',
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      transformOrigin: 'top center',
                      transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
                      boxShadow: offset === 0 ? '0 20px 40px rgba(0,0,0,0.5)' : 'none',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: '#666'}}>
                      <span style={{fontSize: '0.9rem'}}>0{index + 1}</span>
                      <span style={{color: 'var(--primary-color)', fontSize: '1.1rem', letterSpacing: '2px'}}>★★★★★</span>
                    </div>
                    <p style={{
                      color: offset === 0 ? '#fff' : '#aaa', 
                      fontSize: '1.1rem', 
                      lineHeight: '1.6', 
                      flex: 1,
                      transition: 'color 0.8s ease'
                    }}>
                      "{test.text}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Author Details (Below Hanger) */}
          <div className="testimonial-author" style={{ textAlign: 'center', marginTop: '1rem',
            transition: 'opacity 0.3s ease'
          }}>
            <div style={{
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #222, #444)',
              border: '2px solid var(--primary-color)',
              margin: '0 auto 1rem auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {testimonials[activeTestimonialIndex].name.charAt(0)}
            </div>
            <h4 style={{color: '#fff', margin: 0, fontSize: '1.2rem'}}>{testimonials[activeTestimonialIndex].name}</h4>
            <p style={{color: '#aaa', fontSize: '0.9rem', margin: '0.3rem 0 0 0'}}>{testimonials[activeTestimonialIndex].role}</p>
            
            {/* Arrows */}
            <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem'}}>
              <button 
                onClick={() => setActiveTestimonialIndex(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  color: '#fff', 
                  fontSize: '0.9rem', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer', 
                  padding: '0.6rem 1.5rem',
                  borderRadius: '30px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                ← Prev
              </button>
              <button 
                onClick={() => setActiveTestimonialIndex(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  color: '#fff', 
                  fontSize: '0.9rem', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer', 
                  padding: '0.6rem 1.5rem',
                  borderRadius: '30px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </section>
      )}





    </main>
  );
}
