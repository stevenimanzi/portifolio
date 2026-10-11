import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import profileImg from '../assets/images/profile.jpg';
import { useContent } from '../content/ContentContext';
import { WhatsAppIcon, GitHubIcon, LinkedInIcon, XIcon, InstagramIcon } from './icons';
import './Header.css';

const links = [
  { to: '/', label: 'Home', title: 'Home Page' },
  { to: '/skills', label: 'Skills', title: 'My Skills' },
  { to: '/services', label: 'Services', title: 'Tech Solutions & Services' },
  { to: '/projects', label: 'Projects', title: 'My Projects & Portfolio' }
];

const mobileLinks = [...links, { to: '/contact', label: 'Contact', title: 'Contact Steven Imanzi' }];

const WHATSAPP_MESSAGE = "Hello Steven, I'd like to talk about a project.";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  const { site } = useContent();
  const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  // The menu counts as open only on the route it was opened on, so any navigation closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const isMobileMenuOpen = openOn === pathname;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock page scroll while the menu is open, and let Escape close it
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenOn(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isMobileMenuOpen]);

  const close = () => setOpenOn(null);
  const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active-link' : '');

  return (
    <div className="floating-header-wrapper">
      <nav
        className={`floating-header ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}
        aria-label="Main Navigation"
      >
        <div className="header-profile">
          <Link to="/" aria-label="Steven Imanzi Home" onClick={close}>
            <img
              src={profileImg}
              alt="Steven Imanzi - Web Software Developer in Kigali, Rwanda"
              className="header-profile-img"
              title="Steven Imanzi - Web Software Developer in Kigali, Rwanda"
            />
          </Link>
        </div>

        <span className="header-name">Steven Imanzi</span>

        {/* Desktop links */}
        <div className="header-links">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={navClass} title={l.title}>{l.label}</NavLink>
          ))}
        </div>

        <div className="header-right-actions">
          <Link to="/contact" className="header-contact-btn desktop-only-btn" title="Contact Steven Imanzi">
            Contact
          </Link>

          <button
            type="button"
            className={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setOpenOn(isMobileMenuOpen ? null : pathname)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu: a sibling of the nav, so the pill's blur never traps this fixed overlay */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
      >
        <span className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true"></span>
          Menu
        </span>

        <nav className="mobile-menu-links" aria-label="Mobile navigation">
          {mobileLinks.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={navClass}
              title={l.title}
              style={{ '--i': i } as React.CSSProperties}
              onClick={close}
            >
              <span className="mm-num">{String(i + 1).padStart(2, '0')}</span>
              {l.label}
              <span className="mm-arrow" aria-hidden="true">→</span>
            </NavLink>
          ))}
        </nav>

        <div className="mobile-menu-foot" style={{ '--i': 5 } as React.CSSProperties}>
          <a className="mm-wa" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Chat on WhatsApp
          </a>
          <div className="mm-socials">
            <a href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitHubIcon /></a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedInIcon /></a>
            <a href={site.x} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><XIcon /></a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
          </div>
          <a className="mm-mail" href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </div>
  );
}
