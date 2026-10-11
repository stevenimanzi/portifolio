import './PageHero.css';

interface PageHeroProps {
  /** White part of the headline */
  title: string;
  /** Neon-green part of the headline */
  accent: string;
  subtitle: string;
}

export default function PageHero({ title, accent, subtitle }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-content">
        <div className="page-hero-main">
          <h1 className="page-hero-title reveal">
            {title} <span className="page-hero-accent">{accent}</span>
          </h1>
          <p className="page-hero-subtitle reveal" style={{ '--delay': '0.15s' } as React.CSSProperties}>
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
