import heroImg from '../assets/hero.jpg';
import './SiteBackground.css';

/**
 * Fixed full-screen backdrop shared by every page. It stays put while the page scrolls,
 * with the page content sitting on top of it.
 */
export default function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden="true">
      <img src={heroImg} alt="" />
      <div className="site-bg-overlay"></div>
      <span className="site-orb site-orb-a"></span>
      <span className="site-orb site-orb-b"></span>
    </div>
  );
}
