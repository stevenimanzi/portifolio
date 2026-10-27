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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'stivenimanzi1@gmail.com','$2y$12$eiBSDwfKwm4J9Z.TFo6lNu/uoYfWW.iZaXeiLYXfwOIpDh6wMNhOS','Steven IMANZI','2026-10-27 13:22:17');
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
INSERT INTO `projects` VALUES ('bms','BMS System','Business System','A system that helps businesses manage their daily work, sales, and reports automatically.','https://bms.icyerekezodigital.com','[\"builtin:projects/bms/bms_1.png\", \"builtin:projects/bms/bms_2.png\", \"builtin:projects/bms/bms_3.png\", \"builtin:projects/bms/bms_4.png\", \"builtin:projects/bms/bms_5.png\", \"builtin:projects/bms/bms_6.png\"]',20,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('clear_finance','Clear Finance','Financial Management System','A personal finance management system that tracks income, expenses, and budgets with real-time reports and smart decision support.','https://clearfinance.web.app/','[\"builtin:projects/Clear_Finance/screen1.png\", \"builtin:projects/Clear_Finance/screen2.png\", \"builtin:projects/Clear_Finance/screen3.png\", \"builtin:projects/Clear_Finance/screen4.png\", \"builtin:projects/Clear_Finance/screen5.png\", \"builtin:projects/Clear_Finance/screen6.png\", \"builtin:projects/Clear_Finance/screen7.png\", \"builtin:projects/Clear_Finance/screen8.png\", \"builtin:projects/Clear_Finance/screen9.png\", \"builtin:projects/Clear_Finance/screen10.png\", \"builtin:projects/Clear_Finance/screen11.png\"]',80,1,0,'2026-10-27 13:48:33','2026-10-27 13:48:33'),('e_commerce','E-Commerce Market','E-Commerce','A popular online market in Rwanda where people can buy and sell things like electronics and food.','https://icyerekezodigital.online','[\"builtin:projects/market/market_1.png\", \"builtin:projects/market/market_2.png\", \"builtin:projects/market/market_3.png\", \"builtin:projects/market/market_4.png\", \"builtin:projects/market/market_5.png\", \"builtin:projects/market/market_6.png\"]',30,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('icyerekezo','Icyerekezo Digital','Web App','A top software company in Kigali, Rwanda that builds custom tools for businesses.','https://icyerekezodigital.com','[\"builtin:projects/icyerekezo/icyerekezo_1.png\", \"builtin:projects/icyerekezo/icyerekezo_2.png\", \"builtin:projects/icyerekezo/icyerekezo_3.png\", \"builtin:projects/icyerekezo/icyerekezo_4.png\", \"builtin:projects/icyerekezo/icyerekezo_5.png\", \"builtin:projects/icyerekezo/icyerekezo_6.png\"]',10,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('noguchi','Noguchi','Web App','A beautiful and easy-to-use website with a clean and modern design.','#','[\"builtin:projects/noguchi/noguchi_1.png\", \"builtin:projects/noguchi/noguchi_2.png\", \"builtin:projects/noguchi/noguchi_3.png\", \"builtin:projects/noguchi/noguchi_4.png\", \"builtin:projects/noguchi/noguchi_5.png\", \"builtin:projects/noguchi/noguchi_6.png\"]',40,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('oms','OMS','Business System','A system that helps factories easily manage their orders, machines, and daily work.','https://icyerekezooms.com','[\"builtin:projects/oms/oms_1.png\", \"builtin:projects/oms/oms_2.png\", \"builtin:projects/oms/oms_3.png\", \"builtin:projects/oms/oms_4.png\", \"builtin:projects/oms/oms_5.png\"]',50,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('star_news_africa','Star News Africa','Newsletter Platform','A leading digital news publication and newsletter platform delivering authentic, independent news and stories across Africa.','https://starnewsafrica.com','[\"builtin:projects/Star_News_Africa/screen1.png\", \"builtin:projects/Star_News_Africa/screen2.png\", \"builtin:projects/Star_News_Africa/screen3.png\", \"builtin:projects/Star_News_Africa/screen4.png\", \"builtin:projects/Star_News_Africa/screen5.png\", \"builtin:projects/Star_News_Africa/screen6.png\", \"builtin:projects/Star_News_Africa/screen7.png\"]',70,1,0,'2026-10-27 13:39:35','2026-10-27 13:39:35'),('thelight','The Light','Web App','A platform where people can find real jobs, scholarships, and career advice in Africa.','https://thelightofengineer.com','[\"builtin:projects/thelight/thelight_1.png\", \"builtin:projects/thelight/thelight_2.png\", \"builtin:projects/thelight/thelight_3.png\", \"builtin:projects/thelight/thelight_4.png\", \"builtin:projects/thelight/thelight_5.png\", \"builtin:projects/thelight/thelight_6.png\"]',60,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18');
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
INSERT INTO `services` VALUES ('ai','Artificial Intelligence','Automation','Using smart computer tools to save you time and do the heavy lifting.','I set up smart AI systems that can do your boring, repetitive work for you. This means you can get more done, save money, and let the computer answer customer questions automatically.','builtin:services/ai',20,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('cctv','CCTV Camera Installation','Security','Setting up reliable security cameras for your home or business.','Keep your property safe with modern security cameras. I handle the entire setup so you can easily watch everything live right from your phone, wherever you are.','builtin:services/cctv',40,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('seo','SEO & Digital Marketing','Marketing','Helping more people find your business on Google and social media.','Having a website isn\'t enough if no one sees it. I help your website show up higher on Google and run online ads so you can reach more paying customers.','builtin:services/seo',30,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('social','Social Media Management','Social Media','Creating great posts and managing your pages to grow your audience.','I help your business grow on platforms like Instagram, Facebook, and LinkedIn. I create the posts, schedule them, and talk to your followers so you don\'t have to worry about it.','builtin:services/social',50,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18'),('web-dev','Web & App Development','Development','Fast and beautiful websites that work perfectly on phones and computers.','I build all kinds of websites from scratch. Whether you need an online store, a business site, or a custom system, I make sure it is easy to use and runs smoothly without crashing.','builtin:services/web-dev',10,1,0,'2026-10-27 13:22:18','2026-10-27 13:22:18');
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
INSERT INTO `settings` VALUES ('seo','{\"pages\": {\"home\": {\"image\": \"\", \"title\": \"Steven Imanzi | Web & Software Developer in Kigali, Rwanda\", \"description\": \"Leading Web and Software Developer in Kigali, Rwanda offering full-stack solutions, SEO, and AI automation.\"}, \"skills\": {\"image\": \"\", \"title\": \"Skills & Tech Stack | Steven Imanzi\", \"description\": \"The tools, languages and frameworks Steven Imanzi uses to build fast, scalable web applications, plus his education and certifications.\"}, \"contact\": {\"image\": \"\", \"title\": \"Contact Steven Imanzi | Web Developer in Kigali\", \"description\": \"Have a project in mind? Contact Steven Imanzi by message, email, phone or WhatsApp. Based in Kigali, Rwanda.\"}, \"projects\": {\"image\": \"\", \"title\": \"Projects & Portfolio | Steven Imanzi\", \"description\": \"Systems, platforms and websites built by Steven Imanzi to solve real business problems across Rwanda.\"}, \"services\": {\"image\": \"\", \"title\": \"Web, SEO, AI & CCTV Services in Rwanda | Steven Imanzi\", \"description\": \"Simple, reliable digital services for businesses in Rwanda: websites and apps, AI automation, SEO and marketing, CCTV installation and social media management.\"}}, \"author\": \"Steven Imanzi\", \"ogImage\": \"/steven_imanzi.png\", \"orgCity\": \"Kigali\", \"orgName\": \"Steven Imanzi\", \"keywords\": \"Software Developer Kigali, Web Developer Rwanda, IT Services Rwanda, Steven Imanzi, AI Automation, CCTV Installation Rwanda, SEO Services Kigali\", \"siteName\": \"Steven Imanzi\", \"orgCountry\": \"RW\", \"description\": \"Steven Imanzi is a leading Web and Software Developer based in Kigali, Rwanda, offering expert services in full-stack web development, SEO, AI automation, and CCTV installation.\", \"robotsIndex\": true, \"canonicalUrl\": \"https://stevenimanzi.com\", \"twitterHandle\": \"@StivenImanzi\", \"googleVerification\": \"EZr_p_be_WwibXUZipjmZEq4qiDRIFPNoYiJdnxpVPI\"}','2026-10-27 13:22:18'),('site','{\"x\": \"https://x.com/StivenImanzi\", \"role\": \"Expert Software & Web Developer, based in Kigali, Rwanda\", \"email\": \"stivenimanzi1@gmail.com\", \"phone\": \"+250 796 194 401\", \"github\": \"https://github.com/stevenimanzi\", \"linkedin\": \"https://www.linkedin.com/in/steven-imanzi/\", \"location\": \"Kigali, Rwanda\", \"whatsapp\": \"250796194401\", \"heroQuote\": \"\\\" STOP LOSING CUSTOMERS TO SLOW\\nAND OLD SYSTEMS. I BUILD\\nFAST WEBSITES THAT HELP YOU\\nMAKE MORE MONEY, SAVE TIME,\\nAND GROW YOUR BUSINESS. \\\"\", \"instagram\": \"https://www.instagram.com/stevenimanzi/\", \"footerText\": \"Expert Web & Software Developer specializing in modern web applications, SEO, and AI automation.\", \"yearsStart\": 2024}','2026-10-27 13:22:18');
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

-- Dump completed on 2026-10-27 15:48:50
