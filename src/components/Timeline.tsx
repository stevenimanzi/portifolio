import { useEffect, useRef, useState } from 'react';
import './Timeline.css';

import img1 from '../assets/images/steven_imanzi.png';
import img2 from '../assets/hero.jpg';
import img3 from '../assets/images/profile.jpg';
import img4 from '../assets/images/profile.png';
import img5 from '../assets/images/steven_imanzi.png';

const timelineData = [
  {
    year: "2022",
    title: "How I Started",
    desc: [
      "I studied Computer System and Technology at Groupe Scolaire Des Parents in Huye.",
      "I gained hands-on skills in Networking, Basic Electronics, and Basic Electricity.",
      "I also learned Digital Phone System Installation and Computer Maintenance (both software and hardware).",
      "This is where I fell in love with solving problems using technology."
    ],
    tags: ["Computer Systems", "Networking", "Electronics", "Hardware & Software"],
    image: img1
  },
  {
    year: "2023",
    title: "Learning Software Development",
    desc: [
      "I studied Software Development at Saint Laurent Gaseke TSS.",
      "I gained strong skills in Web Application Development, UI/UX Design, and Database Management.",
      "I focused heavily on writing clean code and building scalable System Architectures.",
      "This is where I learned to use programming to solve real-world business problems."
    ],
    tags: ["Software Development", "Web Apps", "Databases", "System Architecture"],
    image: img2
  },
  {
    year: "2024",
    title: "Starting a Business",
    desc: [
      "After graduating in October 2024, I decided to start my own tech company.",
      "I teamed up with three classmates to create ICYEREKEZO DIGITAL INNOVATION Ltd.",
      "We all brought different skills: Sylvestre for leading, Oliane for marketing, and Robert for money management."
    ],
    tags: ["Business", "Teamwork", "Finance"],
    image: img3
  },
  {
    year: "2025",
    title: "Mastering Digital Sales",
    desc: [
      "In September 2025, I enrolled at Rwanda Polytechnic Musanze College.",
      "I gained advanced skills in E-Commerce Solutions, SEO, and Digital Marketing.",
      "I studied how online businesses operate, scale, and generate digital sales.",
      "This empowered me to build highly optimized websites that actively drive revenue."
    ],
    tags: ["E-Commerce", "SEO", "Digital Marketing", "Business Strategy"],
    image: img4
  },
  {
    year: "2026",
    title: "My Goal for the Future",
    desc: [
      "I want to contribute my efforts towards our country's goal of full digitalization.",
      "My vision is to help all businesses—both small and large—get online and thrive.",
      "I will keep bringing different talented people together to build digital tools.",
      "We are working hard to make this dream of a connected Africa come true."
    ],
    tags: ["Digitalization", "Business Growth", "Africa", "Big Dreams"],
    image: img5
  }
];

// Dot positions. Desktop: down the curved arc. Mobile: along a curve across the top.
const MOBILE_TOPS = ['28%', '50%', '60%', '50%', '28%'];
const desktopLeft = (i: number) => (i === 2 ? '50%' : i === 1 || i === 3 ? '42%' : '35%');

/**
 * Scroll-driven timeline (original design). The stage stays pinned to the screen while the
 * section scrolls past; each equal slice of scrolling switches to the next year and swaps
 * its content. Works the same on phones (arc runs across the top instead of down the side).
 */
export default function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = timelineData.length;

  useEffect(() => {
    // Cheap enough to run on every scroll event: it reads one rect and only re-renders
    // when the active year actually changes.
    const update = () => {
      const el = sectionRef.current;
      const stage = stageRef.current;
      if (!el || !stage) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - stage.offsetHeight;
      if (scrollable <= 0) return;

      // 0 when the stage pins, 1 when it lets go; each year owns an equal slice.
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      setActive(Math.min(total - 1, Math.floor(progress * total)));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [total]);

  // Clicking a year scrolls to the middle of that year's slice.
  const goTo = (index: number) => {
    const el = sectionRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    const scrollable = el.offsetHeight - stage.offsetHeight;
    if (scrollable <= 0) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((index + 0.5) / total) * scrollable, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="timeline-section"
      style={{ '--n': total } as React.CSSProperties}
      aria-label="My journey, year by year"
    >
      <div className="timeline-sticky-wrapper" ref={stageRef}>
        {/* Year arc with the dots */}
        <div className="timeline-arc-container">
          <svg className="timeline-svg timeline-svg-v" viewBox="0 0 100 800" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 0 0 Q 100 400 0 800" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </svg>
          <svg className="timeline-svg timeline-svg-h" viewBox="0 0 800 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 0 0 Q 400 100 800 0" fill="transparent" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          </svg>

          {timelineData.map((item, index) => (
            <button
              type="button"
              key={item.year}
              className={`timeline-dot ${active === index ? 'active' : ''}`}
              style={{
                '--dt': `${(index + 1) * (100 / (total + 1))}%`,
                '--dl': desktopLeft(index),
                '--mt': MOBILE_TOPS[index] ?? '50%',
                '--ml': `${(index + 0.5) * (100 / total)}%`
              } as React.CSSProperties}
              aria-current={active === index ? 'step' : undefined}
              aria-label={`Go to ${item.year}: ${item.title}`}
              onClick={() => goTo(index)}
            >
              <span className="dot-text">{item.year}</span>
            </button>
          ))}
        </div>

        {/* The year's story, one slide per year */}
        <div className="timeline-content-container">
          {timelineData.map((item, index) => (
            <div
              key={item.year}
              className={`timeline-content-slide ${active === index ? 'active-slide' : index < active ? 'past-slide' : ''}`}
            >
              <h3 className="phase-title">{item.title}</h3>
              <ul className="phase-desc">
                {item.desc.map(point => <li key={point}>{point}</li>)}
              </ul>
              <div className="phase-tags">
                {item.tags.map(tag => <span key={tag} className="phase-tag">{tag}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* Portrait: every image is stacked and cross-fades, so nothing reloads while scrolling */}
        <div className="timeline-visual-container">
          <div className={`visual-box visual-index-${active % 5}`}>
            {timelineData.map((item, index) => (
              <img
                key={item.year}
                src={item.image}
                alt={index === active ? item.title : ''}
                className={`timeline-image ${index === active ? 'active' : ''}`}
                decoding="async"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
