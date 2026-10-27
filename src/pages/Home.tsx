import { useState, useEffect } from 'react';
import './Home.css';
import Timeline from '../components/Timeline';
import FramerMarqueeCarousel from '../components/FramerMarqueeCarousel';
import { useContent } from '../content/ContentContext';

export default function Home() {
  const { services: servicesData, projects, testimonials, site } = useContent();

  const [testimonialRaw, setActiveTestimonialIndex] = useState(0);
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

      {/* 1. Services - Framer TestimonialCarousel Design System */}
      {servicesData.length > 0 && (
        <FramerMarqueeCarousel
          sectionId="services"
          eyebrow="CAPABILITIES &amp; SERVICES"
          title={<>What I Can <strong>Do For You.</strong></>}
          subtitle="Specialized digital engineering, mobile applications, software quality assurance, database management, and organic search growth."
          direction="left"
          items={servicesData.map(s => ({
            id: s.id,
            title: s.title,
            tag: s.tag,
            description: s.summary,
            image: s.image,
            detailLink: `/contact?service=${s.id}`,
            ctaText: 'Request Service'
          }))}
        />
      )}

      {/* 2. Scroll timeline: one year at a time */}
      <Timeline />

      {/* 3. Featured Projects - Framer TestimonialCarousel Design System */}
      {projects.length > 0 && (
        <FramerMarqueeCarousel
          sectionId="my-work"
          eyebrow="FEATURED PORTFOLIO"
          title={<>Selected Works &amp; <strong>Engineering.</strong></>}
          subtitle="A curated selection of real production systems, enterprise business solutions, and web applications built from scratch."
          direction="right"
          items={projects.map(p => ({
            id: p.id,
            title: p.name,
            tag: p.type,
            description: p.description,
            image: p.images[0] || '',
            link: p.link !== '#' ? p.link : undefined,
            detailLink: `/projects?project=${p.id}`,
            ctaText: 'Explore Project'
          }))}
        />
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
