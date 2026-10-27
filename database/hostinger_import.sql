-- MySQL dump 10.13  Distrib 9.7.1, for Win64 (x86_64)
--
-- Host: localhost    Database: stevenimanzi_db
-- ------------------------------------------------------
-- Server version	9.7.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Steven Imanzi',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'stivenimanzi1@gmail.com','$2y$12$ROxGgUS8fSAK2/06debxPuDg0PNEwDrp4K1a30IShsGkyGkwvMlFy','Steven IMANZI','2026-10-27 13:22:17'),(5,'info@stevenimanzi.info','$2y$12$jM3UDJNepF8/wh8fmPGHtuysTCjbHin02s6OflUxFI9IQXSHvyhA2','Steven IMANZI','2026-10-27 14:29:36');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_created` (`created_at`),
  KEY `idx_messages_read` (`is_read`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,'Test User','test@example.com','Test Subject','This is a test message to MySQL.',0,'2026-10-27 13:28:34');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `description` text COLLATE utf8mb4_unicode_ci,
  `link` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `images` json NOT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES ('clear_finance','Clear Finance','Personal Financial Management System','A personal finance management system that tracks income, expenses, and budgets with real-time reports and smart decision support.','https://clearfinance.web.app/','[\"builtin:projects/Clear_Finance/screen1.png\", \"builtin:projects/Clear_Finance/screen2.png\", \"builtin:projects/Clear_Finance/screen3.png\", \"builtin:projects/Clear_Finance/screen4.png\", \"builtin:projects/Clear_Finance/screen5.png\", \"builtin:projects/Clear_Finance/screen6.png\", \"builtin:projects/Clear_Finance/screen7.png\", \"builtin:projects/Clear_Finance/screen8.png\", \"builtin:projects/Clear_Finance/screen9.png\", \"builtin:projects/Clear_Finance/screen10.png\", \"builtin:projects/Clear_Finance/screen11.png\"]',10,1,0,'2026-10-27 15:34:21','2026-10-27 15:34:21'),('e_commerce','Icyerekezo E-Commerce','Multi-Vendor E-Commerce Platform','A popular online marketplace in Rwanda where people can buy and sell electronics, groceries, and everyday essentials with mobile money payments.','https://icyerekezodigital.online','[\"builtin:projects/e_commerce/market_1.png\", \"builtin:projects/e_commerce/market_2.png\", \"builtin:projects/e_commerce/market_3.png\", \"builtin:projects/e_commerce/market_4.png\", \"builtin:projects/e_commerce/market_5.png\", \"builtin:projects/e_commerce/market_6.png\"]',70,1,0,'2026-10-27 15:34:21','2026-10-27 15:34:21'),('icyerekezo_bms','Icyerekezo BMS','Business Management System','An enterprise business management system automating sales tracking, financial accounting, inventory, and analytics reporting.','https://bms.icyerekezodigital.com','[\"builtin:projects/icyerekezo_bms/bms_1.png\", \"builtin:projects/icyerekezo_bms/bms_2.png\", \"builtin:projects/icyerekezo_bms/bms_3.png\", \"builtin:projects/icyerekezo_bms/bms_4.png\", \"builtin:projects/icyerekezo_bms/bms_5.png\", \"builtin:projects/icyerekezo_bms/bms_6.png\"]',40,1,0,'2026-10-27 15:34:21','2026-10-27 15:34:21'),('icyerekezo_digital_innovation','Icyerekezo Digital Innovation','Software & Technology Agency','Official platform for Icyerekezo Digital Innovation, showcasing enterprise software engineering, digital transformation, and client solutions.','https://icyerekezodigital.com','[\"builtin:projects/icyerekezo_digital_innovation/icyerekezo_1.png\", \"builtin:projects/icyerekezo_digital_innovation/icyerekezo_2.png\", \"builtin:projects/icyerekezo_digital_innovation/icyerekezo_3.png\", \"builtin:projects/icyerekezo_digital_innovation/icyerekezo_4.png\", \"builtin:projects/icyerekezo_digital_innovation/icyerekezo_5.png\", \"builtin:projects/icyerekezo_digital_innovation/icyerekezo_6.png\"]',30,1,0,'2026-10-27 15:34:21','2026-10-27 15:34:21'),('icyerekezo_oms','Icyerekezo OMS','Operations & Machine System','A comprehensive operations and manufacturing system for managing workflow pipelines, equipment diagnostics, and machine maintenance.','https://icyerekezooms.com','[\"builtin:projects/icyerekezo_oms/oms_1.png\", \"builtin:projects/icyerekezo_oms/oms_2.png\", \"builtin:projects/icyerekezo_oms/oms_3.png\", \"builtin:projects/icyerekezo_oms/oms_4.png\", \"builtin:projects/icyerekezo_oms/oms_5.png\"]',50,1,0,'2026-10-27 15:34:21','2026-10-27 15:34:21'),('noguchi_holding_ltd','Noguchi Holding Ltd','Corporate Investment Platform','Modern corporate platform representing multinational holding operations, investment portfolios, and strategic ventures.','#','[\"builtin:projects/noguchi_holding_ltd/noguchi_1.png\", \"builtin:projects/noguchi_holding_ltd/noguchi_2.png\", \"builtin:projects/noguchi_holding_ltd/noguchi_3.png\", \"builtin:projects/noguchi_holding_ltd/noguchi_4.png\", \"builtin:projects/noguchi_holding_ltd/noguchi_5.png\", \"builtin:projects/noguchi_holding_ltd/noguchi_6.png\"]',60,1,0,'2026-10-27 15:34:21','2026-10-27 15:34:21'),('star_news_africa','Star News Africa','Newsletter Platform','A leading digital news publication and newsletter platform delivering authentic, independent news and stories across Africa.','https://starnewsafrica.com','[\"builtin:projects/Star_News_Africa/screen1.png\", \"builtin:projects/Star_News_Africa/screen2.png\", \"builtin:projects/Star_News_Africa/screen3.png\", \"builtin:projects/Star_News_Africa/screen4.png\", \"builtin:projects/Star_News_Africa/screen5.png\", \"builtin:projects/Star_News_Africa/screen6.png\", \"builtin:projects/Star_News_Africa/screen7.png\"]',20,1,0,'2026-10-27 15:34:21','2026-10-27 15:34:21'),('the_light_of_engineering','The Light of Engineering','Career & Engineering Portal','An interactive platform where engineers and students find verified job openings, international scholarships, and professional mentorship across Africa.','https://thelightofengineer.com','[\"builtin:projects/the_light_of_engineering/thelight_1.png\", \"builtin:projects/the_light_of_engineering/thelight_2.png\", \"builtin:projects/the_light_of_engineering/thelight_3.png\", \"builtin:projects/the_light_of_engineering/thelight_4.png\", \"builtin:projects/the_light_of_engineering/thelight_5.png\", \"builtin:projects/the_light_of_engineering/thelight_6.png\"]',80,1,0,'2026-10-27 15:34:21','2026-10-27 15:34:21');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `summary` text COLLATE utf8mb4_unicode_ci,
  `details` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `order_index` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES ('database-design','Database Design & Management','Data Architecture','Scalable relational and NoSQL database schemas, query optimization, and secure data backups.','Architect clean, robust, and scalable database systems using MySQL, PostgreSQL, MongoDB, and Firebase. I specialize in schema normalization, complex query optimization, automated daily backup pipelines, indexing strategies, and enterprise-grade data protection to keep your business data fast and secure.','builtin:services/database-design',60,1,0,'2026-10-27 15:10:53','2026-10-27 15:10:53'),('ecommerce','E-Commerce Setup & Solutions','Online Stores','Full-featured online shops with local payment gateways (MTN MoMo, Airtel) and global checkouts.','Launch high-converting e-commerce stores designed to sell 24/7. I implement secure checkouts with local mobile money (MTN MoMo, Airtel Money), Stripe, PayPal, multi-currency support, automated inventory management, and customer accounts to maximize sales and order volume.','builtin:services/ecommerce',50,1,0,'2026-10-27 15:10:53','2026-10-27 15:10:53'),('mobile-dev','Mobile App Development','iOS & Android','Native and cross-platform mobile apps built with Flutter and React Native.','I develop intuitive, high-performance mobile applications that run smoothly on both Android and iOS devices. With offline-first data synchronization, seamless API integrations, push notifications, and polished UI/UX, I deliver apps ready for Google Play and Apple App Store deployment.','builtin:services/mobile-dev',20,1,0,'2026-10-27 15:10:53','2026-10-27 15:10:53'),('seo','Search Engine Optimization (SEO)','Organic Growth','Data-driven on-page SEO, technical audits, and high-converting keyword rankings on Google.','Transform organic search into your most consistent source of paying clients. I conduct deep technical SEO audits, implement structured schema markup, optimize Core Web Vitals performance, and craft semantic content strategies that elevate your website to the top of Google search results in Rwanda and globally.','builtin:services/seo',30,1,0,'2026-10-27 13:22:18','2026-10-27 15:10:53'),('software-testing','Software Testing & QA','Quality Assurance','Automated testing suites, vulnerability scans, and comprehensive quality assurance.','Ensure your software operates reliably without bugs, bottlenecks, or security holes. I provide automated testing, API validation, regression testing, user acceptance testing (UAT), stress testing, and code quality audits to guarantee production-ready reliability and zero downtime.','builtin:services/software-testing',40,1,0,'2026-10-27 15:10:53','2026-10-27 15:10:53'),('web-dev','Web Development','Web & Cloud','Custom high-performance web applications, responsive websites, and enterprise cloud platforms.','I design and build tailored websites and web applications from the ground up using React, TypeScript, Node.js, and modern backends. From high-converting business platforms to complex cloud-hosted web apps, every product is optimized for speed, security, and exceptional user experience across all devices.','builtin:services/web-dev',10,1,0,'2026-10-27 13:22:18','2026-10-27 15:10:53');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('seo','{\"pages\": {\"home\": {\"image\": \"\", \"title\": \"Steven Imanzi | Full-Stack Web & Mobile Developer, Software QA & SEO in Rwanda\", \"description\": \"Top-rated Full-Stack Web & Mobile Developer, Software QA Specialist, and SEO Expert in Kigali, Rwanda. Building scalable web applications, mobile apps, and robust databases.\"}, \"skills\": {\"image\": \"\", \"title\": \"Skills & Tech Stack | Steven Imanzi\", \"description\": \"Explore the technical proficiencies of Steven Imanzi: React, Flutter, Node.js, Python, TypeScript, MySQL, PostgreSQL, QA Automation, and Cloud Infrastructure.\"}, \"contact\": {\"image\": \"\", \"title\": \"Contact Steven Imanzi | Software & Web Developer in Kigali\", \"description\": \"Ready to build high-performance software or elevate your online presence? Contact Steven Imanzi for consultations, project estimates, or technical partnerships.\"}, \"projects\": {\"image\": \"\", \"title\": \"Projects & Portfolio | Steven Imanzi\", \"description\": \"Explore enterprise systems, web applications, and digital platforms engineered by Steven Imanzi for leading businesses across Rwanda and internationally.\"}, \"services\": {\"image\": \"\", \"title\": \"Services | What I Can Do For You | Steven Imanzi\", \"description\": \"Explore professional digital engineering services: Web Development, Mobile App Development, SEO, Software Testing & QA, E-Commerce Setup, and Database Design & Management in Kigali, Rwanda.\"}}, \"author\": \"Steven Imanzi\", \"ogImage\": \"/steven_imanzi.png\", \"orgCity\": \"Kigali\", \"orgName\": \"Steven Imanzi\", \"keywords\": \"Software Developer Kigali, Web Developer Rwanda, Mobile App Development Rwanda, Flutter Developer Kigali, Software Testing QA Rwanda, Database Management MySQL, SEO Services Kigali, E-Commerce Development Rwanda, Best Web Developer East Africa, Steven Imanzi\", \"siteName\": \"Steven Imanzi\", \"orgCountry\": \"RW\", \"description\": \"Steven Imanzi is a top-rated Full-Stack Web & Mobile App Developer, Software QA Engineer, and SEO Specialist based in Kigali, Rwanda. Transforming businesses with custom web apps, mobile solutions, software testing, database architecture, and high-converting search rankings.\", \"robotsIndex\": true, \"canonicalUrl\": \"https://stevenimanzi.info\", \"twitterHandle\": \"@StivenImanzi\", \"googleVerification\": \"EZr_p_be_WwibXUZipjmZEq4qiDRIFPNoYiJdnxpVPI\"}','2026-10-27 15:10:53'),('site','{\"x\": \"https://x.com/StivenImanzi\", \"role\": \"Expert Software & Web Developer, based in Kigali, Rwanda\", \"email\": \"stivenimanzi1@gmail.com\", \"phone\": \"+250 796 194 401\", \"github\": \"https://github.com/stevenimanzi\", \"linkedin\": \"https://www.linkedin.com/in/steven-imanzi/\", \"location\": \"Kigali, Rwanda\", \"whatsapp\": \"250796194401\", \"heroQuote\": \"\\\" STOP LOSING CUSTOMERS TO SLOW\\nAND OLD SYSTEMS. I BUILD\\nFAST WEBSITES THAT HELP YOU\\nMAKE MORE MONEY, SAVE TIME,\\nAND GROW YOUR BUSINESS. \\\"\", \"instagram\": \"https://www.instagram.com/stevenimanzi/\", \"footerText\": \"Expert Full-Stack Web & Mobile App Developer, Software QA & SEO Specialist based in Kigali, Rwanda.\", \"yearsStart\": 2024}','2026-10-27 15:10:53');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `text` text COLLATE utf8mb4_unicode_ci,
  `order_index` int NOT NULL DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES ('alice','Alice','Boutique Owner','Steven helped my clothing shop get found online on Google. Now, I have so many more customers visiting my store.',80,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('didiel','Didiel','Pharmacy Owner','Steven installed high-quality security cameras for my pharmacy. I can now watch everything from my phone perfectly.',30,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('eric','Eric','Founder, The Light of Engineer','Working with Steven was great. He built our job platform quickly and it looks amazing on both phones and computers.',20,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('jean-paul','Jean Paul','School Director','He developed a beautiful and fast website for our school. Parents love how easy it is to find information now.',90,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('kamanzi','Kamanzi','Real Estate Agent','Steven manages my social media perfectly. He creates great posts that show off my houses and bring in real buyers.',100,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('maritha','INGABIRE Maritha','Homeowner','I feel so much safer after Steven set up my home security cameras. The installation was very clean and professional.',40,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('oliane','Oliane','Marketing, ICYEREKEZO DIGITAL','Steven builds websites that look so good. His designs make my job of marketing to customers much easier.',60,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('robert','Robert','Finance, ICYEREKEZO DIGITAL','He understands the business side. Steven builds systems that actually help the company save money and work faster.',70,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('samuel','Samuel','Manager, Noguchi Factory','Steven built our factory management system. It\'s so easy to use and has saved us countless hours of manual work.',10,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('sylvestre','Sylvestre','Leadership, ICYEREKEZO DIGITAL','Steven is brilliant. He takes very hard problems and turns them into fast, simple software that just works.',50,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visits`
--

DROP TABLE IF EXISTS `visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `path` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referrer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `is_new_visitor` tinyint(1) NOT NULL DEFAULT '1',
  `device` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'desktop',
  `lang` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `country` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `lat` decimal(9,6) DEFAULT NULL,
  `lng` decimal(9,6) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_visits_created` (`created_at`),
  KEY `idx_visits_country` (`country`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
INSERT INTO `visits` VALUES (1,'/','',1,'desktop','en','RW','Kigali',-1.950000,30.060000,'2026-10-27 13:29:39');
/*!40000 ALTER TABLE `visits` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-27 17:34:29
