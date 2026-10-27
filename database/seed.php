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

// 1. Seed Admin User
$adminEmail = 'stivenimanzi1@gmail.com';
$adminPass = 'Enterin@12';
$passwordHash = password_hash($adminPass, PASSWORD_BCRYPT);

$stmt = $pdo->prepare("
    INSERT INTO admins (email, password_hash, display_name)
    VALUES (?, ?, 'Steven IMANZI')
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), display_name = VALUES(display_name)
");
$stmt->execute([$adminEmail, $passwordHash]);
echo "Admin user ($adminEmail) created/updated.\n";

// 2. Seed Services
$services = [
    [
        'id' => 'web-dev',
        'order_index' => 10,
        'title' => 'Web & App Development',
        'tag' => 'Development',
        'summary' => 'Fast and beautiful websites that work perfectly on phones and computers.',
        'details' => 'I build all kinds of websites from scratch. Whether you need an online store, a business site, or a custom system, I make sure it is easy to use and runs smoothly without crashing.',
        'image' => 'builtin:services/web-dev'
    ],
    [
        'id' => 'ai',
        'order_index' => 20,
        'title' => 'Artificial Intelligence',
        'tag' => 'Automation',
        'summary' => 'Using smart computer tools to save you time and do the heavy lifting.',
        'details' => 'I set up smart AI systems that can do your boring, repetitive work for you. This means you can get more done, save money, and let the computer answer customer questions automatically.',
        'image' => 'builtin:services/ai'
    ],
    [
        'id' => 'seo',
        'order_index' => 30,
        'title' => 'SEO & Digital Marketing',
        'tag' => 'Marketing',
        'summary' => 'Helping more people find your business on Google and social media.',
        'details' => "Having a website isn't enough if no one sees it. I help your website show up higher on Google and run online ads so you can reach more paying customers.",
        'image' => 'builtin:services/seo'
    ],
    [
        'id' => 'cctv',
        'order_index' => 40,
        'title' => 'CCTV Camera Installation',
        'tag' => 'Security',
        'summary' => 'Setting up reliable security cameras for your home or business.',
        'details' => 'Keep your property safe with modern security cameras. I handle the entire setup so you can easily watch everything live right from your phone, wherever you are.',
        'image' => 'builtin:services/cctv'
    ],
    [
        'id' => 'social',
        'order_index' => 50,
        'title' => 'Social Media Management',
        'tag' => 'Social Media',
        'summary' => 'Creating great posts and managing your pages to grow your audience.',
        'details' => "I help your business grow on platforms like Instagram, Facebook, and LinkedIn. I create the posts, schedule them, and talk to your followers so you don't have to worry about it.",
        'image' => 'builtin:services/social'
    ]
];

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
$projects = [
    [
        'id' => 'icyerekezo',
        'order_index' => 10,
        'name' => 'Icyerekezo Digital',
        'type' => 'Web App',
        'description' => 'A top software company in Kigali, Rwanda that builds custom tools for businesses.',
        'link' => 'https://icyerekezodigital.com',
        'images' => [
            'builtin:projects/icyerekezo/icyerekezo_1.png',
            'builtin:projects/icyerekezo/icyerekezo_2.png',
            'builtin:projects/icyerekezo/icyerekezo_3.png',
            'builtin:projects/icyerekezo/icyerekezo_4.png',
            'builtin:projects/icyerekezo/icyerekezo_5.png',
            'builtin:projects/icyerekezo/icyerekezo_6.png'
        ]
    ],
    [
        'id' => 'bms',
        'order_index' => 20,
        'name' => 'BMS System',
        'type' => 'Business System',
        'description' => 'A system that helps businesses manage their daily work, sales, and reports automatically.',
        'link' => 'https://bms.icyerekezodigital.com',
        'images' => [
            'builtin:projects/bms/bms_1.png',
            'builtin:projects/bms/bms_2.png',
            'builtin:projects/bms/bms_3.png',
            'builtin:projects/bms/bms_4.png',
            'builtin:projects/bms/bms_5.png',
            'builtin:projects/bms/bms_6.png'
        ]
    ],
    [
        'id' => 'e_commerce',
        'order_index' => 30,
        'name' => 'E-Commerce Market',
        'type' => 'E-Commerce',
        'description' => 'A popular online market in Rwanda where people can buy and sell things like electronics and food.',
        'link' => 'https://icyerekezodigital.online',
        'images' => [
            'builtin:projects/market/market_1.png',
            'builtin:projects/market/market_2.png',
            'builtin:projects/market/market_3.png',
            'builtin:projects/market/market_4.png',
            'builtin:projects/market/market_5.png',
            'builtin:projects/market/market_6.png'
        ]
    ],
    [
        'id' => 'noguchi',
        'order_index' => 40,
        'name' => 'Noguchi',
        'type' => 'Web App',
        'description' => 'A beautiful and easy-to-use website with a clean and modern design.',
        'link' => '#',
        'images' => [
            'builtin:projects/noguchi/noguchi_1.png',
            'builtin:projects/noguchi/noguchi_2.png',
            'builtin:projects/noguchi/noguchi_3.png',
            'builtin:projects/noguchi/noguchi_4.png',
            'builtin:projects/noguchi/noguchi_5.png',
            'builtin:projects/noguchi/noguchi_6.png'
        ]
    ],
    [
        'id' => 'oms',
        'order_index' => 50,
        'name' => 'OMS',
        'type' => 'Business System',
        'description' => 'A system that helps factories easily manage their orders, machines, and daily work.',
        'link' => 'https://icyerekezooms.com',
        'images' => [
            'builtin:projects/oms/oms_1.png',
            'builtin:projects/oms/oms_2.png',
            'builtin:projects/oms/oms_3.png',
            'builtin:projects/oms/oms_4.png',
            'builtin:projects/oms/oms_5.png'
        ]
    ],
    [
        'id' => 'thelight',
        'order_index' => 60,
        'name' => 'The Light',
        'type' => 'Web App',
        'description' => 'A platform where people can find real jobs, scholarships, and career advice in Africa.',
        'link' => 'https://thelightofengineer.com',
        'images' => [
            'builtin:projects/thelight/thelight_1.png',
            'builtin:projects/thelight/thelight_2.png',
            'builtin:projects/thelight/thelight_3.png',
            'builtin:projects/thelight/thelight_4.png',
            'builtin:projects/thelight/thelight_5.png',
            'builtin:projects/thelight/thelight_6.png'
        ]
    ],
    [
        'id' => 'star_news_africa',
        'order_index' => 70,
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
        'id' => 'clear_finance',
        'order_index' => 80,
        'name' => 'Clear Finance',
        'type' => 'Financial Management System',
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
    'footerText' => 'Expert Web & Software Developer specializing in modern web applications, SEO, and AI automation.',
    'yearsStart' => 2024
];

$seoSettings = [
    'siteName' => 'Steven Imanzi',
    'description' => 'Steven Imanzi is a leading Web and Software Developer based in Kigali, Rwanda, offering expert services in full-stack web development, SEO, AI automation, and CCTV installation.',
    'keywords' => 'Software Developer Kigali, Web Developer Rwanda, IT Services Rwanda, Steven Imanzi, AI Automation, CCTV Installation Rwanda, SEO Services Kigali',
    'author' => 'Steven Imanzi',
    'canonicalUrl' => 'https://stevenimanzi.com',
    'ogImage' => '/steven_imanzi.png',
    'twitterHandle' => '@StivenImanzi',
    'robotsIndex' => true,
    'googleVerification' => 'EZr_p_be_WwibXUZipjmZEq4qiDRIFPNoYiJdnxpVPI',
    'orgName' => 'Steven Imanzi',
    'orgCity' => 'Kigali',
    'orgCountry' => 'RW',
    'pages' => [
        'home' => [
            'title' => 'Steven Imanzi | Web & Software Developer in Kigali, Rwanda',
            'description' => 'Leading Web and Software Developer in Kigali, Rwanda offering full-stack solutions, SEO, and AI automation.',
            'image' => ''
        ],
        'skills' => [
            'title' => 'Skills & Tech Stack | Steven Imanzi',
            'description' => 'The tools, languages and frameworks Steven Imanzi uses to build fast, scalable web applications, plus his education and certifications.',
            'image' => ''
        ],
        'services' => [
            'title' => 'Web, SEO, AI & CCTV Services in Rwanda | Steven Imanzi',
            'description' => 'Simple, reliable digital services for businesses in Rwanda: websites and apps, AI automation, SEO and marketing, CCTV installation and social media management.',
            'image' => ''
        ],
        'projects' => [
            'title' => 'Projects & Portfolio | Steven Imanzi',
            'description' => 'Systems, platforms and websites built by Steven Imanzi to solve real business problems across Rwanda.',
            'image' => ''
        ],
        'contact' => [
            'title' => 'Contact Steven Imanzi | Web Developer in Kigali',
            'description' => 'Have a project in mind? Contact Steven Imanzi by message, email, phone or WhatsApp. Based in Kigali, Rwanda.',
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
