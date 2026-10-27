import type { ProjectItem, SeoSettings, ServiceItem, SiteSettings, TestimonialItem } from './model';

const srvWebDev = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800';
const srvSeo = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800';
const srvCctv = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800';

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
  'services/seo': srvSeo,
  'services/cctv': srvCctv
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
    title: 'Web & App Development',
    tag: 'Development',
    summary: 'Fast and beautiful websites that work perfectly on phones and computers.',
    details: 'I build all kinds of websites from scratch. Whether you need an online store, a business site, or a custom system, I make sure it is easy to use and runs smoothly without crashing.',
    image: 'builtin:services/web-dev'
  },
  {
    ...base,
    id: 'seo',
    order: 20,
    title: 'SEO & Digital Marketing',
    tag: 'Marketing',
    summary: 'Helping more people find your business on Google and social media.',
    details: "Having a website isn't enough if no one sees it. I help your website show up higher on Google and run online ads so you can reach more paying customers.",
    image: 'builtin:services/seo'
  },
  {
    ...base,
    id: 'cctv',
    order: 30,
    title: 'CCTV Camera Installation',
    tag: 'Security',
    summary: 'Setting up reliable security cameras for your home or business.',
    details: 'Keep your property safe with modern security cameras. I handle the entire setup so you can easily watch everything live right from your phone, wherever you are.',
    image: 'builtin:services/cctv'
  }
];

export const defaultProjects: ProjectItem[] = [
  { ...base, id: 'icyerekezo', order: 10, name: 'Icyerekezo Digital', type: 'Web App', description: 'A top software company in Kigali, Rwanda that builds custom tools for businesses.', link: 'https://icyerekezodigital.com', images: projectTokens('icyerekezo') },
  { ...base, id: 'bms', order: 20, name: 'BMS System', type: 'Business System', description: 'A system that helps businesses manage their daily work, sales, and reports automatically.', link: 'https://bms.icyerekezodigital.com', images: projectTokens('bms') },
  { ...base, id: 'e_commerce', order: 30, name: 'E-Commerce Market', type: 'E-Commerce', description: 'A popular online market in Rwanda where people can buy and sell things like electronics and food.', link: 'https://icyerekezodigital.online', images: projectTokens('e_commerce') },
  { ...base, id: 'noguchi', order: 40, name: 'Noguchi', type: 'Web App', description: 'A beautiful and easy-to-use website with a clean and modern design.', link: '#', images: projectTokens('noguchi') },
  { ...base, id: 'oms', order: 50, name: 'OMS', type: 'Business System', description: 'A system that helps factories easily manage their orders, machines, and daily work.', link: 'https://icyerekezooms.com', images: projectTokens('oms') },
  { ...base, id: 'thelight', order: 60, name: 'The Light', type: 'Web App', description: 'A platform where people can find real jobs, scholarships, and career advice in Africa.', link: 'https://thelightofengineer.com', images: projectTokens('thelight') },
  { ...base, id: 'star_news_africa', order: 70, name: 'Star News Africa', type: 'Newsletter Platform', description: 'A leading digital news publication and newsletter platform delivering authentic, independent news and stories across Africa.', link: 'https://starnewsafrica.com', images: projectTokens('Star_News_Africa') },
  { ...base, id: 'clear_finance', order: 80, name: 'Clear Finance', type: 'Financial Management System', description: 'A personal finance management system that tracks income, expenses, and budgets with real-time reports and smart decision support.', link: 'https://clearfinance.web.app/', images: projectTokens('Clear_Finance') }
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
  footerText: 'Expert Web & Software Developer specializing in modern web applications, SEO, and CCTV installation.',
  yearsStart: 2024
};

export const defaultSeo: SeoSettings = {
  siteName: 'Steven Imanzi',
  description: 'Steven Imanzi is a leading Web and Software Developer based in Kigali, Rwanda, offering expert services in full-stack web development, SEO, and CCTV installation.',
  keywords: 'Software Developer Kigali, Web Developer Rwanda, IT Services Rwanda, Steven Imanzi, CCTV Installation Rwanda, SEO Services Kigali',
  author: 'Steven Imanzi',
  canonicalUrl: 'https://stevenimanzi.com',
  ogImage: '/steven_imanzi.png',
  twitterHandle: '@StivenImanzi',
  robotsIndex: true,
  googleVerification: 'EZr_p_be_WwibXUZipjmZEq4qiDRIFPNoYiJdnxpVPI',
  orgName: 'Steven Imanzi',
  orgCity: 'Kigali',
  orgCountry: 'RW',
  pages: {
    home: {
      title: 'Steven Imanzi | Web & Software Developer in Kigali, Rwanda',
      description: 'Leading Web and Software Developer in Kigali, Rwanda offering full-stack solutions, SEO, and CCTV installation.',
      image: ''
    },
    skills: {
      title: 'Skills & Tech Stack | Steven Imanzi',
      description: 'The tools, languages and frameworks Steven Imanzi uses to build fast, scalable web applications, plus his education and certifications.',
      image: ''
    },
    services: {
      title: 'Web, SEO & CCTV Services in Rwanda | Steven Imanzi',
      description: 'Simple, reliable digital services for businesses in Rwanda: websites and apps, SEO and marketing, and CCTV camera installation.',
      image: ''
    },
    projects: {
      title: 'Projects & Portfolio | Steven Imanzi',
      description: 'Systems, platforms and websites built by Steven Imanzi to solve real business problems across Rwanda.',
      image: ''
    },
    contact: {
      title: 'Contact Steven Imanzi | Web Developer in Kigali',
      description: 'Have a project in mind? Contact Steven Imanzi by message, email, phone or WhatsApp. Based in Kigali, Rwanda.',
      image: ''
    }
  }
};
