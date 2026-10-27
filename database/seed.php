<?php
// Seed script for stevenimanzi_db

$host = '127.0.0.1';
$dbname = 'stevenimanzi_db';
$user = 'root';
$pass = 'Enterin@12';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected successfully to MySQL ($dbname).\n";
} catch (\PDOException $e) {
    die("Connection failed: " . $e->getMessage() . "\n");
}

// 1. Seed Admin Users
$admins = [
    ['email' => 'info@stevenimanzi.info', 'pass' => 'Enterin@12', 'name' => 'Steven IMANZI'],
    ['email' => 'stivenimanzi1@gmail.com', 'pass' => 'Enterin@12', 'name' => 'Steven IMANZI']
];

$stmt = $pdo->prepare("
    INSERT INTO admins (email, password_hash, display_name)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), display_name = VALUES(display_name)
");

foreach ($admins as $adm) {
    $stmt->execute([$adm['email'], password_hash($adm['pass'], PASSWORD_BCRYPT), $adm['name']]);
    echo "Admin user ({$adm['email']}) created/updated.\n";
}

// 2. Seed Services
$services = [
    [
        'id' => 'web-dev',
        'order_index' => 10,
        'title' => 'Web Development',
        'tag' => 'Web & Cloud',
        'summary' => 'Custom high-performance web applications, responsive websites, and enterprise cloud platforms.',
        'details' => 'I design and build tailored websites and web applications from the ground up using React, TypeScript, Node.js, and modern backends. From high-converting business platforms to complex cloud-hosted web apps, every product is optimized for speed, security, and exceptional user experience across all devices.',
        'image' => 'builtin:services/web-dev'
    ],
    [
        'id' => 'mobile-dev',
        'order_index' => 20,
        'title' => 'Mobile App Development',
        'tag' => 'iOS & Android',
        'summary' => 'Native and cross-platform mobile apps built with Flutter and React Native.',
        'details' => 'I develop intuitive, high-performance mobile applications that run smoothly on both Android and iOS devices. With offline-first data synchronization, seamless API integrations, push notifications, and polished UI/UX, I deliver apps ready for Google Play and Apple App Store deployment.',
        'image' => 'builtin:services/mobile-dev'
    ],
    [
        'id' => 'seo',
        'order_index' => 30,
        'title' => 'Search Engine Optimization (SEO)',
        'tag' => 'Organic Growth',
        'summary' => 'Data-driven on-page SEO, technical audits, and high-converting keyword rankings on Google.',
        'details' => 'Transform organic search into your most consistent source of paying clients. I conduct deep technical SEO audits, implement structured schema markup, optimize Core Web Vitals performance, and craft semantic content strategies that elevate your website to the top of Google search results in Rwanda and globally.',
        'image' => 'builtin:services/seo'
    ],
    [
        'id' => 'software-testing',
        'order_index' => 40,
        'title' => 'Software Testing & QA',
        'tag' => 'Quality Assurance',
        'summary' => 'Automated testing suites, vulnerability scans, and comprehensive quality assurance.',
        'details' => 'Ensure your software operates reliably without bugs, bottlenecks, or security holes. I provide automated testing, API validation, regression testing, user acceptance testing (UAT), stress testing, and code quality audits to guarantee production-ready reliability and zero downtime.',
        'image' => 'builtin:services/software-testing'
    ],
    [
        'id' => 'ecommerce',
        'order_index' => 50,
        'title' => 'E-Commerce Setup & Solutions',
        'tag' => 'Online Stores',
        'summary' => 'Full-featured online shops with local payment gateways (MTN MoMo, Airtel) and global checkouts.',
        'details' => 'Launch high-converting e-commerce stores designed to sell 24/7. I implement secure checkouts with local mobile money (MTN MoMo, Airtel Money), Stripe, PayPal, multi-currency support, automated inventory management, and customer accounts to maximize sales and order volume.',
        'image' => 'builtin:services/ecommerce'
    ],
    [
        'id' => 'database-design',
        'order_index' => 60,
        'title' => 'Database Design & Management',
        'tag' => 'Data Architecture',
        'summary' => 'Scalable relational and NoSQL database schemas, query optimization, and secure data backups.',
        'details' => 'Architect clean, robust, and scalable database systems using MySQL, PostgreSQL, MongoDB, and Firebase. I specialize in schema normalization, complex query optimization, automated daily backup pipelines, indexing strategies, and enterprise-grade data protection to keep your business data fast and secure.',
        'image' => 'builtin:services/database-design'
    ]
];

// Clean up removed/replaced services
$pdo->exec("DELETE FROM services WHERE id IN ('ai', 'social', 'cctv')");

$svcStmt = $pdo->prepare("
    INSERT INTO services (id, order_index, title, tag, summary, details, image, published, deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)
    ON DUPLICATE KEY UPDATE 
        order_index = VALUES(order_index),
        title = VALUES(title),
        tag = VALUES(tag),
        summary = VALUES(summary),
        details = VALUES(details),
        image = VALUES(image)
");

foreach ($services as $s) {
    $svcStmt->execute([$s['id'], $s['order_index'], $s['title'], $s['tag'], $s['summary'], $s['details'], $s['image']]);
}
echo "Services seeded (" . count($services) . ").\n";

// 3. Seed Projects
$pdo->exec("DELETE FROM projects");

$projects = [
    [
        'id' => 'clear_finance',
        'order_index' => 10,
        'name' => 'Clear Finance',
        'type' => 'Personal Financial Management System',
        'description' => 'A personal finance management system that tracks income, expenses, and budgets with real-time reports and smart decision support.',
        'link' => 'https://clearfinance.web.app/',
        'images' => [
            'builtin:projects/Clear_Finance/screen1.png',
            'builtin:projects/Clear_Finance/screen2.png',
            'builtin:projects/Clear_Finance/screen3.png',
            'builtin:projects/Clear_Finance/screen4.png',
            'builtin:projects/Clear_Finance/screen5.png',
            'builtin:projects/Clear_Finance/screen6.png',
            'builtin:projects/Clear_Finance/screen7.png',
            'builtin:projects/Clear_Finance/screen8.png',
            'builtin:projects/Clear_Finance/screen9.png',
            'builtin:projects/Clear_Finance/screen10.png',
            'builtin:projects/Clear_Finance/screen11.png'
        ]
    ],
    [
        'id' => 'star_news_africa',
        'order_index' => 20,
        'name' => 'Star News Africa',
        'type' => 'Newsletter Platform',
        'description' => 'A leading digital news publication and newsletter platform delivering authentic, independent news and stories across Africa.',
        'link' => 'https://starnewsafrica.com',
        'images' => [
            'builtin:projects/Star_News_Africa/screen1.png',
            'builtin:projects/Star_News_Africa/screen2.png',
            'builtin:projects/Star_News_Africa/screen3.png',
            'builtin:projects/Star_News_Africa/screen4.png',
            'builtin:projects/Star_News_Africa/screen5.png',
            'builtin:projects/Star_News_Africa/screen6.png',
            'builtin:projects/Star_News_Africa/screen7.png'
        ]
    ],
    [
        'id' => 'icyerekezo_digital_innovation',
        'order_index' => 30,
        'name' => 'Icyerekezo Digital Innovation',
        'type' => 'Software & Technology Agency',
        'description' => 'Official platform for Icyerekezo Digital Innovation, showcasing enterprise software engineering, digital transformation, and client solutions.',
        'link' => 'https://icyerekezodigital.com',
        'images' => [
            'builtin:projects/icyerekezo_digital_innovation/icyerekezo_1.png',
            'builtin:projects/icyerekezo_digital_innovation/icyerekezo_2.png',
            'builtin:projects/icyerekezo_digital_innovation/icyerekezo_3.png',
            'builtin:projects/icyerekezo_digital_innovation/icyerekezo_4.png',
            'builtin:projects/icyerekezo_digital_innovation/icyerekezo_5.png',
            'builtin:projects/icyerekezo_digital_innovation/icyerekezo_6.png'
        ]
    ],
    [
        'id' => 'icyerekezo_bms',
        'order_index' => 40,
        'name' => 'Icyerekezo BMS',
        'type' => 'Business Management System',
        'description' => 'An enterprise business management system automating sales tracking, financial accounting, inventory, and analytics reporting.',
        'link' => 'https://bms.icyerekezodigital.com',
        'images' => [
            'builtin:projects/icyerekezo_bms/bms_1.png',
            'builtin:projects/icyerekezo_bms/bms_2.png',
            'builtin:projects/icyerekezo_bms/bms_3.png',
            'builtin:projects/icyerekezo_bms/bms_4.png',
            'builtin:projects/icyerekezo_bms/bms_5.png',
            'builtin:projects/icyerekezo_bms/bms_6.png'
        ]
    ],
    [
        'id' => 'icyerekezo_oms',
        'order_index' => 50,
        'name' => 'Icyerekezo OMS',
        'type' => 'Operations & Machine System',
        'description' => 'A comprehensive operations and manufacturing system for managing workflow pipelines, equipment diagnostics, and machine maintenance.',
        'link' => 'https://icyerekezooms.com',
        'images' => [
            'builtin:projects/icyerekezo_oms/oms_1.png',
            'builtin:projects/icyerekezo_oms/oms_2.png',
            'builtin:projects/icyerekezo_oms/oms_3.png',
            'builtin:projects/icyerekezo_oms/oms_4.png',
            'builtin:projects/icyerekezo_oms/oms_5.png'
        ]
    ],
    [
        'id' => 'noguchi_holding_ltd',
        'order_index' => 60,
        'name' => 'Noguchi Holding Ltd',
        'type' => 'Corporate Investment Platform',
        'description' => 'Modern corporate platform representing multinational holding operations, investment portfolios, and strategic ventures.',
        'link' => '#',
        'images' => [
            'builtin:projects/noguchi_holding_ltd/noguchi_1.png',
            'builtin:projects/noguchi_holding_ltd/noguchi_2.png',
            'builtin:projects/noguchi_holding_ltd/noguchi_3.png',
            'builtin:projects/noguchi_holding_ltd/noguchi_4.png',
            'builtin:projects/noguchi_holding_ltd/noguchi_5.png',
            'builtin:projects/noguchi_holding_ltd/noguchi_6.png'
        ]
    ],
    [
        'id' => 'e_commerce',
        'order_index' => 70,
        'name' => 'Icyerekezo E-Commerce',
        'type' => 'Multi-Vendor E-Commerce Platform',
        'description' => 'A popular online marketplace in Rwanda where people can buy and sell electronics, groceries, and everyday essentials with mobile money payments.',
        'link' => 'https://icyerekezodigital.online',
        'images' => [
            'builtin:projects/e_commerce/market_1.png',
            'builtin:projects/e_commerce/market_2.png',
            'builtin:projects/e_commerce/market_3.png',
            'builtin:projects/e_commerce/market_4.png',
            'builtin:projects/e_commerce/market_5.png',
            'builtin:projects/e_commerce/market_6.png'
        ]
    ],
    [
        'id' => 'the_light_of_engineering',
        'order_index' => 80,
        'name' => 'The Light of Engineering',
        'type' => 'Career & Engineering Portal',
        'description' => 'An interactive platform where engineers and students find verified job openings, international scholarships, and professional mentorship across Africa.',
        'link' => 'https://thelightofengineer.com',
        'images' => [
            'builtin:projects/the_light_of_engineering/thelight_1.png',
            'builtin:projects/the_light_of_engineering/thelight_2.png',
            'builtin:projects/the_light_of_engineering/thelight_3.png',
            'builtin:projects/the_light_of_engineering/thelight_4.png',
            'builtin:projects/the_light_of_engineering/thelight_5.png',
            'builtin:projects/the_light_of_engineering/thelight_6.png'
        ]
    ]
];

$projStmt = $pdo->prepare("
    INSERT INTO projects (id, order_index, name, type, description, link, images, published, deleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)
    ON DUPLICATE KEY UPDATE 
        order_index = VALUES(order_index),
        name = VALUES(name),
        type = VALUES(type),
        description = VALUES(description),
        link = VALUES(link),
        images = VALUES(images)
");

foreach ($projects as $p) {
    $projStmt->execute([
        $p['id'],
        $p['order_index'],
        $p['name'],
        $p['type'],
        $p['description'],
        $p['link'],
        json_encode($p['images'])
    ]);
}
echo "Projects seeded (" . count($projects) . ").\n";

// 4. Seed Testimonials
$testimonials = [
    ['samuel', 10, 'Samuel', 'Manager, Noguchi Factory', "Steven built our factory management system. It's so easy to use and has saved us countless hours of manual work."],
    ['eric', 20, 'Eric', 'Founder, The Light of Engineer', 'Working with Steven was great. He built our job platform quickly and it looks amazing on both phones and computers.'],
    ['didiel', 30, 'Didiel', 'Pharmacy Owner', 'Steven installed high-quality security cameras for my pharmacy. I can now watch everything from my phone perfectly.'],
    ['maritha', 40, 'INGABIRE Maritha', 'Homeowner', 'I feel so much safer after Steven set up my home security cameras. The installation was very clean and professional.'],
    ['sylvestre', 50, 'Sylvestre', 'Leadership, ICYEREKEZO DIGITAL', 'Steven is brilliant. He takes very hard problems and turns them into fast, simple software that just works.'],
    ['oliane', 60, 'Oliane', 'Marketing, ICYEREKEZO DIGITAL', 'Steven builds websites that look so good. His designs make my job of marketing to customers much easier.'],
    ['robert', 70, 'Robert', 'Finance, ICYEREKEZO DIGITAL', 'He understands the business side. Steven builds systems that actually help the company save money and work faster.'],
    ['alice', 80, 'Alice', 'Boutique Owner', 'Steven helped my clothing shop get found online on Google. Now, I have so many more customers visiting my store.'],
    ['jean-paul', 90, 'Jean Paul', 'School Director', 'He developed a beautiful and fast website for our school. Parents love how easy it is to find information now.'],
    ['kamanzi', 100, 'Kamanzi', 'Real Estate Agent', 'Steven manages my social media perfectly. He creates great posts that show off my houses and bring in real buyers.']
];

$testStmt = $pdo->prepare("
    INSERT INTO testimonials (id, order_index, name, role, text, published, deleted)
    VALUES (?, ?, ?, ?, ?, 1, 0)
    ON DUPLICATE KEY UPDATE
        order_index = VALUES(order_index),
        name = VALUES(name),
        role = VALUES(role),
        text = VALUES(text)
");

foreach ($testimonials as $t) {
    $testStmt->execute([$t[0], $t[1], $t[2], $t[3], $t[4]]);
}
echo "Testimonials seeded (" . count($testimonials) . ").\n";

// 5. Seed Settings (site & seo)
$siteSettings = [
    'heroQuote' => "\" STOP LOSING CUSTOMERS TO SLOW\nAND OLD SYSTEMS. I BUILD\nFAST WEBSITES THAT HELP YOU\nMAKE MORE MONEY, SAVE TIME,\nAND GROW YOUR BUSINESS. \"",
    'role' => 'Expert Software & Web Developer, based in Kigali, Rwanda',
    'email' => 'stivenimanzi1@gmail.com',
    'phone' => '+250 796 194 401',
    'whatsapp' => '250796194401',
    'location' => 'Kigali, Rwanda',
    'github' => 'https://github.com/stevenimanzi',
    'linkedin' => 'https://www.linkedin.com/in/steven-imanzi/',
    'x' => 'https://x.com/StivenImanzi',
    'instagram' => 'https://www.instagram.com/stevenimanzi/',
    'footerText' => 'Expert Full-Stack Web & Mobile App Developer, Software QA & SEO Specialist based in Kigali, Rwanda.',
    'yearsStart' => 2024
];

$seoSettings = [
    'siteName' => 'Steven Imanzi',
    'description' => 'Steven Imanzi is a top-rated Full-Stack Web & Mobile App Developer, Software QA Engineer, and SEO Specialist based in Kigali, Rwanda. Transforming businesses with custom web apps, mobile solutions, software testing, database architecture, and high-converting search rankings.',
    'keywords' => 'Software Developer Kigali, Web Developer Rwanda, Mobile App Development Rwanda, Flutter Developer Kigali, Software Testing QA Rwanda, Database Management MySQL, SEO Services Kigali, E-Commerce Development Rwanda, Best Web Developer East Africa, Steven Imanzi',
    'author' => 'Steven Imanzi',
    'canonicalUrl' => 'https://stevenimanzi.info',
    'ogImage' => '/steven_imanzi.png',
    'twitterHandle' => '@StivenImanzi',
    'robotsIndex' => true,
    'googleVerification' => 'EZr_p_be_WwibXUZipjmZEq4qiDRIFPNoYiJdnxpVPI',
    'orgName' => 'Steven Imanzi',
    'orgCity' => 'Kigali',
    'orgCountry' => 'RW',
    'pages' => [
        'home' => [
            'title' => 'Steven Imanzi | Full-Stack Web & Mobile Developer, Software QA & SEO in Rwanda',
            'description' => 'Top-rated Full-Stack Web & Mobile Developer, Software QA Specialist, and SEO Expert in Kigali, Rwanda. Building scalable web applications, mobile apps, and robust databases.',
            'image' => ''
        ],
        'skills' => [
            'title' => 'Skills & Tech Stack | Steven Imanzi',
            'description' => 'Explore the technical proficiencies of Steven Imanzi: React, Flutter, Node.js, Python, TypeScript, MySQL, PostgreSQL, QA Automation, and Cloud Infrastructure.',
            'image' => ''
        ],
        'services' => [
            'title' => 'Services | What I Can Do For You | Steven Imanzi',
            'description' => 'Explore professional digital engineering services: Web Development, Mobile App Development, SEO, Software Testing & QA, E-Commerce Setup, and Database Design & Management in Kigali, Rwanda.',
            'image' => ''
        ],
        'projects' => [
            'title' => 'Projects & Portfolio | Steven Imanzi',
            'description' => 'Explore enterprise systems, web applications, and digital platforms engineered by Steven Imanzi for leading businesses across Rwanda and internationally.',
            'image' => ''
        ],
        'contact' => [
            'title' => 'Contact Steven Imanzi | Software & Web Developer in Kigali',
            'description' => 'Ready to build high-performance software or elevate your online presence? Contact Steven Imanzi for consultations, project estimates, or technical partnerships.',
            'image' => ''
        ]
    ]
];

$setStmt = $pdo->prepare("
    INSERT INTO settings (id, data)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE data = VALUES(data)
");
$setStmt->execute(['site', json_encode($siteSettings)]);
$setStmt->execute(['seo', json_encode($seoSettings)]);
echo "Settings seeded (site & seo).\n";

echo "Database seeding finished successfully!\n";
