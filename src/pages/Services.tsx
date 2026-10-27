import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useContent } from '../content/ContentContext';
import PageHero from '../components/PageHero';
import CtaBand from '../components/CtaBand';
import StickyServicesSection from '../components/StickyServicesSection';
import './Services.css';

export default function Services() {
  const { services: servicesData } = useContent();
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('service');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [requested]);

  return (
    <div className="services-page">
      <PageHero
        title="What I can"
        accent="do for you"
        subtitle="End-to-end digital engineering, native mobile apps, software quality assurance, database management, and organic search growth."
      />

      <div className="services-deck-wrap">
        <StickyServicesSection
          services={servicesData}
          initialServiceId={requested}
          showIntro={false}
        />
      </div>

      <div className="container" style={{ paddingBottom: '5rem', maxWidth: '1240px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <CtaBand
          title="Not sure which service you need?"
          text="Tell me about your business and I will recommend the simplest way to get results."
        />
      </div>
    </div>
  );
}
