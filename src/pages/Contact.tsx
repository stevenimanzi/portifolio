import { useState, useEffect } from 'react';
import './Contact.css';
import { MapPinIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import PageHero from '../components/PageHero';
import { submitMessage } from '../lib/publicApi';
import { useContent } from '../content/ContentContext';
import type { SiteSettings } from '../content/model';

const getDetails = (site: SiteSettings) => [
  { label: 'Location', value: site.location, href: undefined as string | undefined, icon: MapPinIcon },
  { label: 'Email', value: site.email, href: `mailto:${site.email}`, icon: EnvelopeIcon },
  { label: 'Phone', value: site.phone, href: `tel:${site.phone.replace(/[^+\d]/g, '')}`, icon: PhoneIcon }
];

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true
};

const socials = [
  {
    label: 'LinkedIn',
    key: 'linkedin' as const,
    icon: (
      <svg {...iconProps}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
    )
  },
  {
    label: 'GitHub',
    key: 'github' as const,
    icon: (
      <svg {...iconProps}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
    )
  },
  {
    label: 'X (Twitter)',
    key: 'x' as const,
    icon: (
      <svg {...iconProps}><path d="M4 4l11.733 16h4.267l-11.733-16z" /><path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772" /></svg>
    )
  },
  {
    label: 'Instagram',
    key: 'instagram' as const,
    icon: (
      <svg {...iconProps}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
    )
  }
];

export default function Contact() {
  const { site } = useContent();
  const contactDetails = getDetails(site);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [website, setWebsite] = useState(''); // honeypot: real people never see or fill this
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (website) {
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      return;
    }

    try {
      const last = Number(localStorage.getItem('sm_last_msg') || 0);
      if (Date.now() - last < 30_000) {
        setSubmitStatus('error');
        return;
      }
    } catch {
      /* storage unavailable: skip the limit */
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await submitMessage(formData);
      try {
        localStorage.setItem('sm_last_msg', String(Date.now()));
      } catch {
        /* ignore */
      }
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <PageHero
        title="Get In"
        accent="Touch"
        subtitle="Have a project in mind or want to discuss a partnership? I'd love to hear from you."
      />

      <div className="page-body contact-container">
        
        <div className="contact-info-section reveal" style={{ '--delay': '0.1s' } as React.CSSProperties}>
          {contactDetails.map(({ label, value, href, icon: Icon }) => {
            const body = (
              <>
                <div className="info-icon">
                  <Icon aria-hidden="true" />
                </div>
                <div>
                  <h3>{label}</h3>
                  <p>{value}</p>
                </div>
              </>
            );
            return href ? (
              <a key={label} href={href} className="info-card info-card-link">{body}</a>
            ) : (
              <div key={label} className="info-card">{body}</div>
            );
          })}

          <div className="social-links-card">
            <h3>Follow me</h3>
            <div className="contact-socials">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={site[s.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link"
                  aria-label={s.label}
                  title={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        
        <div className="contact-form-section reveal" style={{ '--delay': '0.2s' } as React.CSSProperties}>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-hp" aria-hidden="true">
              <label htmlFor="website">Leave this empty</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>
            <h2>Send a message</h2>
            <p className="contact-form-lead">Tell me a little about your idea and I will get back to you soon.</p>

            <div className="form-row">
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  id="name"
                  maxLength={100}
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="name">Your Name</label>
              </div>

              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  maxLength={200}
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="email">Your Email</label>
              </div>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="subject"
                id="subject"
                maxLength={150}
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder=" "
              />
              <label htmlFor="subject">Subject</label>
            </div>

            <div className="input-group">
              <textarea
                name="message"
                id="message"
                maxLength={5000}
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder=" "
              ></textarea>
              <label htmlFor="message">Your Message</label>
            </div>

            <button
              type="submit"
              className={`btn-neon btn-submit ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : <>Send message <span aria-hidden="true">→</span></>}
            </button>

            {submitStatus === 'error' && (
              <div className="form-message error" role="alert">
                Your message could not be sent right now. Please wait a moment and try again, or reach me on WhatsApp at +250 796 194 401.
              </div>
            )}

            {submitStatus === 'success' && (
              <div className="form-message success" role="status">
                Message sent successfully! I will get back to you soon.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
