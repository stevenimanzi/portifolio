import type { ProjectItem, SeoSettings, ServiceItem, SiteSettings, TestimonialItem } from './model';

import srvWebDev from '../assets/services/web_development.jpg';
import srvMobileDev from '../assets/services/mobile_app_development.jpg';
import srvSeo from '../assets/services/seo_optimization.jpg';
import srvTesting from '../assets/services/software_testing.jpg';
import srvEcommerce from '../assets/services/ecommerce_setup.jpg';
import srvDatabase from '../assets/services/database_design.jpg';

/* ---------- Images shipped with the site ----------
   Content stores image "tokens" like `builtin:projects/bms/bms_1.png`, so they keep working after a
   rebuild (file names get a new hash every build). Tokens are resolved to real URLs at display time. */
const projectFiles = import.meta.glob<string>('../assets/projects/*/*.png', {
  eager: true,
  import: 'default',
  query: '?url'
});

export const assetMap: Record<string, string> = {
  'services/web-dev': srvWebDev,
  'services/mobile-dev': srvMobileDev,
  'services/seo': srvSeo,
  'services/software-testing': srvTesting,
  'services/ecommerce': srvEcommerce,
  'services/database-design': srvDatabase
};
Object.entries(projectFiles).forEach(([path, url]) => {
  assetMap[path.replace('../assets/', '')] = url;
});

export function resolveImage(token: string): string {
  if (!token) return '';
  if (token.startsWith('builtin:')) return assetMap[token.slice('builtin:'.length)] ?? '';
  return token;
}

const projectTokens = (folder: string) =>
  Object.keys(assetMap)
    .filter(k => k.startsWith(`projects/${folder}/`))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(k => `builtin:${k}`);

const base = { source: 'builtin' as const, published: true, deleted: false };

export const defaultServices: ServiceItem[] = [
  {
    ...base,
    id: 'web-dev',
    order: 10,
    title: 'Web Development',
    tag: 'Web & Cloud',
    summary: 'Custom high-performance web applications, responsive websites, and enterprise cloud platforms.',
    details: 'I design and build tailored websites and web applications from the ground up using React, TypeScript, Node.js, and modern backends. From high-converting business platforms to complex cloud-hosted web apps, every product is optimized for speed, security, and exceptional user experience across all devices.',
    image: 'builtin:services/web-dev'
  },
  {
    ...base,
    id: 'mobile-dev',
    order: 20,
    title: 'Mobile App Development',
    tag: 'iOS & Android',
    summary: 'Native and cross-platform mobile apps built with Flutter and React Native.',
    details: 'I develop intuitive, high-performance mobile applications that run smoothly on both Android and iOS devices. With offline-first data synchronization, seamless API integrations, push notifications, and polished UI/UX, I deliver apps ready for Google Play and Apple App Store deployment.',
    image: 'builtin:services/mobile-dev'
  },
  {
    ...base,
    id: 'seo',
    order: 30,
    title: 'Search Engine Optimization (SEO)',
    tag: 'Organic Growth',
    summary: 'Data-driven on-page SEO, technical audits, and high-converting keyword rankings on Google.',
    details: 'Transform organic search into your most consistent source of paying clients. I conduct deep technical SEO audits, implement structured schema markup, optimize Core Web Vitals performance, and craft semantic content strategies that elevate your website to the top of Google search results in Rwanda and globally.',
    image: 'builtin:services/seo'
  },
  {
    ...base,
    id: 'software-testing',
    order: 40,
    title: 'Software Testing & QA',
    tag: 'Quality Assurance',
    summary: 'Automated testing suites, vulnerability scans, and comprehensive quality assurance.',
    details: 'Ensure your software operates reliably without bugs, bottlenecks, or security holes. I provide automated testing, API validation, regression testing, user acceptance testing (UAT), stress testing, and code quality audits to guarantee production-ready reliability and zero downtime.',
    image: 'builtin:services/software-testing'
  },
  {
    ...base,
    id: 'ecommerce',
    order: 50,
    title: 'E-Commerce Setup & Solutions',
    tag: 'Online Stores',
    summary: 'Full-featured online shops with local payment gateways (MTN MoMo, Airtel) and global checkouts.',
    details: 'Launch high-converting e-commerce stores designed to sell 24/7. I implement secure checkouts with local mobile money (MTN MoMo, Airtel Money), Stripe, PayPal, multi-currency support, automated inventory management, and customer accounts to maximize sales and order volume.',
    image: 'builtin:services/ecommerce'
  },
  {
    ...base,
    id: 'database-design',
    order: 60,
    title: 'Database Design & Management',
    tag: 'Data Architecture',
    summary: 'Scalable relational and NoSQL database schemas, query optimization, and secure data backups.',
    details: 'Architect clean, robust, and scalable database systems using MySQL, PostgreSQL, MongoDB, and Firebase. I specialize in schema normalization, complex query optimization, automated daily backup pipelines, indexing strategies, and enterprise-grade data protection to keep your business data fast and secure.',
    image: 'builtin:services/database-design'
  }
];

export const defaultProjects: ProjectItem[] = [
  { ...base, id: 'clear_finance', order: 10, name: 'Clear Finance', type: 'Personal Financial Management System', description: 'A personal finance management system that tracks income, expenses, and budgets with real-time reports and smart decision support.', link: 'https://clearfinance.web.app/', images: projectTokens('Clear_Finance') },
  { ...base, id: 'star_news_africa', order: 20, name: 'Star News Africa', type: 'Newsletter Platform', description: 'A leading digital news publication and newsletter platform delivering authentic, independent news and stories across Africa.', link: 'https://starnewsafrica.com', images: projectTokens('Star_News_Africa') },
  { ...base, id: 'icyerekezo_digital_innovation', order: 30, name: 'Icyerekezo Digital Innovation', type: 'Software & Technology Agency', description: 'Official platform for Icyerekezo Digital Innovation, showcasing enterprise software engineering, digital transformation, and client solutions.', link: 'https://icyerekezodigital.com', images: projectTokens('icyerekezo_digital_innovation') },
  { ...base, id: 'icyerekezo_bms', order: 40, name: 'Icyerekezo BMS', type: 'Business Management System', description: 'An enterprise business management system automating sales tracking, financial accounting, inventory, and analytics reporting.', link: 'https://bms.icyerekezodigital.com', images: projectTokens('icyerekezo_bms') },
  { ...base, id: 'icyerekezo_oms', order: 50, name: 'Icyerekezo OMS', type: 'Operations & Machine System', description: 'A comprehensive operations and manufacturing system for managing workflow pipelines, equipment diagnostics, and machine maintenance.', link: 'https://icyerekezooms.com', images: projectTokens('icyerekezo_oms') },
  { ...base, id: 'noguchi_holding_ltd', order: 60, name: 'Noguchi Holding Ltd', type: 'Corporate Investment Platform', description: 'Modern corporate platform representing multinational holding operations, investment portfolios, and strategic ventures.', link: '#', images: projectTokens('noguchi_holding_ltd') },
  { ...base, id: 'e_commerce', order: 70, name: 'Icyerekezo E-Commerce', type: 'Multi-Vendor E-Commerce Platform', description: 'A popular online marketplace in Rwanda where people can buy and sell electronics, groceries, and everyday essentials with mobile money payments.', link: 'https://icyerekezodigital.online', images: projectTokens('e_commerce') },
  { ...base, id: 'the_light_of_engineering', order: 80, name: 'The Light of Engineering', type: 'Career & Engineering Portal', description: 'An interactive platform where engineers and students find verified job openings, international scholarships, and professional mentorship across Africa.', link: 'https://thelightofengineer.com', images: projectTokens('the_light_of_engineering') }
];

const t = (id: string, order: number, name: string, role: string, text: string): TestimonialItem =>
  ({ ...base, id, order, name, role, text });

export const defaultTestimonials: TestimonialItem[] = [
  t('samuel', 10, 'Samuel', 'Manager, Noguchi Factory', "Steven built our factory management system. It's so easy to use and has saved us countless hours of manual work."),
  t('eric', 20, 'Eric', 'Founder, The Light of Engineer', 'Working with Steven was great. He built our job platform quickly and it looks amazing on both phones and computers.'),
  t('didiel', 30, 'Didiel', 'Pharmacy Owner', 'Steven installed high-quality security cameras for my pharmacy. I can now watch everything from my phone perfectly.'),
  t('maritha', 40, 'INGABIRE Maritha', 'Homeowner', 'I feel so much safer after Steven set up my home security cameras. The installation was very clean and professional.'),
  t('sylvestre', 50, 'Sylvestre', 'Leadership, ICYEREKEZO DIGITAL', 'Steven is brilliant. He takes very hard problems and turns them into fast, simple software that just works.'),
  t('oliane', 60, 'Oliane', 'Marketing, ICYEREKEZO DIGITAL', 'Steven builds websites that look so good. His designs make my job of marketing to customers much easier.'),
  t('robert', 70, 'Robert', 'Finance, ICYEREKEZO DIGITAL', 'He understands the business side. Steven builds systems that actually help the company save money and work faster.'),
  t('alice', 80, 'Alice', 'Boutique Owner', 'Steven helped my clothing shop get found online on Google. Now, I have so many more customers visiting my store.'),
  t('jean-paul', 90, 'Jean Paul', 'School Director', 'He developed a beautiful and fast website for our school. Parents love how easy it is to find information now.'),
  t('kamanzi', 100, 'Kamanzi', 'Real Estate Agent', 'Steven manages my social media perfectly. He creates great posts that show off my houses and bring in real buyers.')
];

export const defaultSite: SiteSettings = {
  heroQuote: '" STOP LOSING CUSTOMERS TO SLOW\nAND OLD SYSTEMS. I BUILD\nFAST WEBSITES THAT HELP YOU\nMAKE MORE MONEY, SAVE TIME,\nAND GROW YOUR BUSINESS. "',
  role: 'Expert Software & Web Developer, based in Kigali, Rwanda',
  email: 'stivenimanzi1@gmail.com',
  phone: '+250 796 194 401',
  whatsapp: '250796194401',
  location: 'Kigali, Rwanda',
  github: 'https://github.com/stevenimanzi',
  linkedin: 'https://www.linkedin.com/in/steven-imanzi/',
  x: 'https://x.com/StivenImanzi',
  instagram: 'https://www.instagram.com/stevenimanzi/',
  footerText: 'Expert Full-Stack Web & Mobile App Developer, Software QA & SEO Specialist based in Kigali, Rwanda.',
  yearsStart: 2024
};

export const defaultSeo: SeoSettings = {
  siteName: 'Steven Imanzi',
  description: 'Steven Imanzi is a top-rated Full-Stack Web & Mobile App Developer, Software QA Engineer, and SEO Specialist based in Kigali, Rwanda. Transforming businesses with custom web apps, mobile solutions, software testing, database architecture, and high-converting search rankings.',
  keywords: 'Software Developer Kigali, Web Developer Rwanda, Mobile App Development Rwanda, Flutter Developer Kigali, Software Testing QA Rwanda, Database Management MySQL, SEO Services Kigali, E-Commerce Development Rwanda, Best Web Developer East Africa, Steven Imanzi',
  author: 'Steven Imanzi',
  canonicalUrl: 'https://stevenimanzi.info',
  ogImage: '/steven_imanzi.png',
  twitterHandle: '@StivenImanzi',
  robotsIndex: true,
  googleVerification: 'EZr_p_be_WwibXUZipjmZEq4qiDRIFPNoYiJdnxpVPI',
  orgName: 'Steven Imanzi',
  orgCity: 'Kigali',
  orgCountry: 'RW',
  pages: {
    home: {
      title: 'Steven Imanzi | Full-Stack Web & Mobile Developer, Software QA & SEO in Rwanda',
      description: 'Top-rated Full-Stack Web & Mobile Developer, Software QA Specialist, and SEO Expert in Kigali, Rwanda. Building scalable web applications, mobile apps, and robust databases.',
      image: ''
    },
    skills: {
      title: 'Skills & Tech Stack | Steven Imanzi',
      description: 'Explore the technical proficiencies of Steven Imanzi: React, Flutter, Node.js, Python, TypeScript, MySQL, PostgreSQL, QA Automation, and Cloud Infrastructure.',
      image: ''
    },
    services: {
      title: 'Services | What I Can Do For You | Steven Imanzi',
      description: 'Explore professional digital engineering services: Web Development, Mobile App Development, SEO, Software Testing & QA, E-Commerce Setup, and Database Design & Management in Kigali, Rwanda.',
      image: ''
    },
    projects: {
      title: 'Projects & Portfolio | Steven Imanzi',
      description: 'Explore enterprise systems, web applications, and digital platforms engineered by Steven Imanzi for leading businesses across Rwanda and internationally.',
      image: ''
    },
    contact: {
      title: 'Contact Steven Imanzi | Software & Web Developer in Kigali',
      description: 'Ready to build high-performance software or elevate your online presence? Contact Steven Imanzi for consultations, project estimates, or technical partnerships.',
      image: ''
    }
  }
};
