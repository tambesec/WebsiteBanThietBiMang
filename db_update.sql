-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: networkstore
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `recipient_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address_line` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_type` enum('home','office','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'home',
  `is_default` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_user_default` (`user_id`,`is_default`),
  CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,4,'Trần Thị B','0923456789','789 Trần Hưng Đạo','Hồ Chí Minh','Quận 1','Phường Cầu Ông Lãnh','700000','home',1,'2025-12-27 07:59:08','2025-12-27 07:59:08'),(2,3,'Nguyễn Văn Test (Văn phòng)','0912345678','456 Lê Lợi','Hồ Chí Minh','Quận 1','Phường Bến Thành','700000','home',0,'2025-12-27 07:59:08','2025-12-27 07:59:08'),(3,3,'Nguyễn Văn Test','0912345678','123 Nguyễn Huệ','Hồ Chí Minh','Quận 1','Phường Bến Nghé','700000','home',1,'2025-12-27 07:59:08','2025-12-27 07:59:08'),(4,1,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','home',1,'2025-12-27 08:05:11','2025-12-27 08:05:11');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `added_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cart_product` (`cart_id`,`product_id`),
  KEY `idx_cart` (`cart_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `fk_cart_item_cart` FOREIGN KEY (`cart_id`) REFERENCES `shopping_carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,2,8,2,'2025-12-27 07:59:08'),(2,2,1,1,'2025-12-27 07:59:08');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_active_order` (`is_active`,`display_order`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_slug` (`slug`),
  CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,NULL,'Access Point','access-point','Access Point WiFi 6, WiFi 5, Indoor, Outdoor cho doanh nghiệp',NULL,3,1),(2,NULL,'Cáp & Adapter','cable-adapter','Cáp mạng Cat5e, Cat6, Cat6a, Adapter USB, SFP Module',NULL,6,1),(3,NULL,'Modem','modem','Modem ADSL, Modem 4G/5G, Modem cáp quang GPON',NULL,5,1),(4,NULL,'Firewall','firewall','Firewall phần cứng, UTM, Next-Gen Firewall bảo mật mạng',NULL,4,1),(5,NULL,'Công cụ mạng','network-tool','Máy test mạng, Crimping tool, Cable tester, Network analyzer',NULL,7,1),(6,NULL,'Switch','switch','Switch quản lý, Switch không quản lý, Switch PoE, Switch công nghiệp',NULL,2,1),(7,NULL,'PoE & Power','poe-injector','PoE Injector, PoE Splitter, UPS cho thiết bị mạng',NULL,8,1),(8,NULL,'Router','router','Router WiFi, Router băng tần kép, Router Mesh cho gia đình và doanh nghiệp',NULL,1,1);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','read','replied','resolved','spam') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new',
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_status` (`status`),
  KEY `idx_contact_read` (`is_read`),
  KEY `idx_contact_date` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (2,'dfsdsf','sfsddf','test@gmail.com','0703370223','fdsfsdf','sdfsdfsdfdsfsd','new',NULL,0,'2025-12-27 12:17:34','2025-12-27 12:17:34'),(3,'Test','User','test@example.com',NULL,NULL,'Test message from API','spam','',1,'2025-12-27 12:25:44','2025-12-27 12:37:11'),(4,'fsdfsdfsdf','dsfsdfsdf','test1@gmail.com','0703370223','sàgdfsagfdgfdg','dfsgfdgdfsgdsfsg','new',NULL,0,'2025-12-27 12:36:55','2025-12-27 12:36:55'),(5,'fadasf','fassfasfa','test@gmail.com','0703370223','fdsfsdfssdf','ffsdfdsfds','new',NULL,0,'2025-12-27 12:50:54','2025-12-27 12:50:54');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount_codes`
--

DROP TABLE IF EXISTS `discount_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `discount_type` enum('percentage','fixed_amount') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `max_uses` int DEFAULT NULL,
  `max_uses_per_user` int DEFAULT '1',
  `used_count` int NOT NULL DEFAULT '0',
  `starts_at` datetime NOT NULL,
  `ends_at` datetime NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code_active` (`code`,`is_active`),
  KEY `idx_dates` (`starts_at`,`ends_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_codes`
--

LOCK TABLES `discount_codes` WRITE;
/*!40000 ALTER TABLE `discount_codes` DISABLE KEYS */;
INSERT INTO `discount_codes` VALUES (1,'ABCAVX',NULL,'fixed_amount',100.00,10.00,1.00,1,1,0,'2025-12-27 00:00:00','2026-02-05 00:00:00',1,'2025-12-27 08:19:11','2025-12-27 08:19:11');
/*!40000 ALTER TABLE `discount_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discount_usage`
--

DROP TABLE IF EXISTS `discount_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discount_usage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discount_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `used_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_discount` (`discount_id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_usage_discount` FOREIGN KEY (`discount_id`) REFERENCES `discount_codes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usage_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discount_usage`
--

LOCK TABLES `discount_usage` WRITE;
/*!40000 ALTER TABLE `discount_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `discount_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','unsubscribed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `subscribed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletter_subscribers_email_key` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
INSERT INTO `newsletter_subscribers` VALUES (1,'test@gmmail.com','active','2025-12-27 12:43:59',NULL),(3,'GDFGFD@gmail.com','active','2025-12-27 12:53:43',NULL);
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `oauth_accounts`
--

DROP TABLE IF EXISTS `oauth_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `oauth_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `provider` enum('google','facebook','github','apple') COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_user_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_email` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_username` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_primary` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_provider_user` (`provider`,`provider_user_id`),
  KEY `idx_oauth_user` (`user_id`),
  KEY `idx_provider_email` (`provider_email`),
  CONSTRAINT `fk_oauth_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `oauth_accounts`
--

LOCK TABLES `oauth_accounts` WRITE;
/*!40000 ALTER TABLE `oauth_accounts` DISABLE KEYS */;
INSERT INTO `oauth_accounts` VALUES (1,1,'google','106655357510710208147','tttkiller2004@gmail.com','linux killer','https://lh3.googleusercontent.com/a/ACg8ocK6hWYgIKio1GJo2WQjRG9mKO3MR_D2Esj6qc9Zcx0XqSV2=s96-c',1,'2025-12-27 07:44:54','2025-12-27 07:44:54');
/*!40000 ALTER TABLE `oauth_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_history`
--

DROP TABLE IF EXISTS `order_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status_id` int NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `changed_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_history_user` (`changed_by`),
  KEY `idx_order` (`order_id`),
  KEY `idx_status` (`status_id`),
  CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_status` FOREIGN KEY (`status_id`) REFERENCES `order_statuses` (`id`),
  CONSTRAINT `fk_history_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_history`
--

LOCK TABLES `order_history` WRITE;
/*!40000 ALTER TABLE `order_history` DISABLE KEYS */;
INSERT INTO `order_history` VALUES (1,1,5,'Delivered successfully',2,'2025-12-25 07:59:08'),(2,1,4,'Shipped via Viettel Post',2,'2025-12-22 07:59:08'),(3,1,2,'Order confirmed by admin',2,'2025-12-18 07:59:08'),(4,1,1,'Order created',3,'2025-12-17 07:59:08'),(5,1,3,'Processing order',2,'2025-12-20 07:59:08'),(6,2,2,'Order confirmed, preparing items',2,'2025-12-25 07:59:08'),(7,2,1,'Order created',3,'2025-12-24 07:59:08'),(8,2,3,'Packing items for shipment',2,'2025-12-26 07:59:08'),(9,3,1,'Order created, awaiting confirmation',4,'2025-12-27 01:59:08'),(10,4,1,'Order created',1,'2025-12-27 08:05:11'),(11,5,1,'Order created',1,'2025-12-27 08:07:02'),(12,6,1,'Order created',1,'2025-12-27 08:16:48'),(13,7,1,'Order created',1,'2025-12-27 08:19:49'),(14,8,1,'Order created',1,'2025-12-27 08:24:25'),(15,9,1,'Order created',1,'2025-12-27 08:42:25'),(16,10,1,'Order created',1,'2025-12-27 08:44:22'),(17,11,1,'Order created',1,'2025-12-27 08:51:05'),(18,12,1,'Order created',1,'2025-12-27 08:59:19'),(19,12,2,'Thanh toán MoMo thành công. Mã giao dịch: 4636969351',1,'2025-12-27 09:00:22'),(20,13,1,'Order created',1,'2025-12-27 13:12:24'),(21,13,2,'Thanh toán MoMo thành công. Mã giao dịch: 4636973318',1,'2025-12-27 13:13:21');
/*!40000 ALTER TABLE `order_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,5,'Ubiquiti UniFi Dream Machine Pro','UBIQUITI-UDM-PRO','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,12990000.00,12990000.00),(2,2,4,'ASUS RT-AX86U Gaming Router WiFi 6','ASUS-RT-AX86U','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,5490000.00,5490000.00),(3,2,13,'TP-Link TL-SG108E 8-Port Gigabit Easy Smart Switch','TP-TL-SG108E','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,690000.00,690000.00),(4,3,1,'TP-Link Archer AX3000 WiFi 6 Router','TP-AX3000','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1890000.00,1890000.00),(5,4,2,'Fortinet FortiGate 60F Next-Gen Firewall','fortinet-fortigate-60f-ngfw','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,28990000.00,28990000.00),(6,5,3,'Ubiquiti UniFi Switch 24 Port PoE (Gen2)','ubiquiti-unifi-switch-24-poe-gen2','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',2,11990000.00,23980000.00),(7,6,1,'TP-Link Archer AX3000 WiFi 6 Router','tp-link-archer-ax3000-wifi-6','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1.00,1.00),(8,7,1,'TP-Link Archer AX3000 WiFi 6 Router','tp-link-archer-ax3000-wifi-6','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1.00,1.00),(9,8,1,'TP-Link Archer AX3000 WiFi 6 Router','tp-link-archer-ax3000-wifi-6','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1.00,1.00),(10,9,3,'Ubiquiti UniFi Switch 24 Port PoE (Gen2)','ubiquiti-unifi-switch-24-poe-gen2','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,11990000.00,11990000.00),(11,10,2,'Fortinet FortiGate 60F Next-Gen Firewall','fortinet-fortigate-60f-ngfw','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,28990000.00,28990000.00),(12,11,2,'Fortinet FortiGate 60F Next-Gen Firewall','fortinet-fortigate-60f-ngfw','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,28990000.00,28990000.00),(13,12,1,'TP-Link Archer AX3000 WiFi 6 Router','tp-link-archer-ax3000-wifi-6','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1.00,1.00),(14,13,4,'ASUS RT-AX86U Gaming Router WiFi 6','asus-rt-ax86u-gaming-router','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,5490000.00,5490000.00),(15,13,5,'Ubiquiti UniFi Dream Machine Pro','ubiquiti-unifi-dream-machine-pro','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',3,12990000.00,38970000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_statuses`
--

DROP TABLE IF EXISTS `order_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int NOT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_statuses`
--

LOCK TABLES `order_statuses` WRITE;
/*!40000 ALTER TABLE `order_statuses` DISABLE KEYS */;
INSERT INTO `order_statuses` VALUES (1,'Pending','Order received, awaiting confirmation',1,'#FFA500'),(2,'Confirmed','Order confirmed by admin',2,'#00FF00'),(3,'Processing','Order is being prepared',3,'#0000FF'),(4,'Shipped','Order has been shipped',4,'#800080'),(5,'Delivered','Order delivered successfully',5,'#008000'),(6,'Cancelled','Order cancelled',6,'#FF0000'),(7,'Returned','Order returned',7,'#A52A2A');
/*!40000 ALTER TABLE `order_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `status_id` int NOT NULL DEFAULT '1',
  `customer_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(320) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_address_id` int DEFAULT NULL,
  `billing_address_id` int DEFAULT NULL,
  `shipping_recipient` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipping_district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_ward` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_recipient` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `billing_district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_ward` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` enum('unpaid','pending','paid','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `paid_at` datetime DEFAULT NULL,
  `payment_time` datetime DEFAULT NULL,
  `momo_trans_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `momo_result_code` int DEFAULT NULL,
  `momo_message` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tracking_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `shipping_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL,
  `customer_note` text COLLATE utf8mb4_unicode_ci,
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_billing_address` (`billing_address_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_shipping_address` (`shipping_address_id`),
  KEY `idx_status` (`status_id`),
  KEY `idx_user_created` (`user_id`,`created_at`),
  CONSTRAINT `fk_order_billing_address` FOREIGN KEY (`billing_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_shipping_address` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_status` FOREIGN KEY (`status_id`) REFERENCES `order_statuses` (`id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-20251227-0001',3,5,'Nguyễn Văn Test','customer@test.com','0912345678',3,3,'Nguyễn Văn Test','0912345678','123 Nguyễn Huệ','Hồ Chí Minh','Quận 1','Phường Bến Nghé','700000','Nguyễn Văn Test','0912345678','123 Nguyễn Huệ','Hồ Chí Minh','Quận 1','Phường Bến Nghé','700000','bank_transfer','paid','2025-12-20 07:59:08',NULL,NULL,NULL,NULL,'express','VTP20251128001','2025-12-22 07:59:08','2025-12-25 07:59:08',12990000.00,0.00,0.00,NULL,1299000.00,14289000.00,'Please deliver after 5 PM',NULL,'2025-12-17 07:59:08','2025-12-27 07:59:08'),(2,'ORD-20251227-0002',3,3,'Nguyễn Văn Test','customer@test.com','0912345678',2,3,'Nguyễn Văn Test (Văn phòng)','0912345678','456 Lê Lợi','Hồ Chí Minh','Quận 1','Phường Bến Thành','700000','Nguyễn Văn Test','0912345678','123 Nguyễn Huệ','Hồ Chí Minh','Quận 1','Phường Bến Nghé','700000','cod','unpaid',NULL,NULL,NULL,NULL,NULL,'standard',NULL,NULL,NULL,6180000.00,0.00,0.00,NULL,618000.00,6798000.00,'Deliver to office during business hours',NULL,'2025-12-24 07:59:08','2025-12-27 07:59:08'),(3,'ORD-20251227-0003',4,1,'Trần Thị B','customer@example.com','0923456789',1,1,'Trần Thị B','0923456789','789 Trần Hưng Đạo','Hồ Chí Minh','Quận 1','Phường Cầu Ông Lãnh','700000','Trần Thị B','0923456789','789 Trần Hưng Đạo','Hồ Chí Minh','Quận 1','Phường Cầu Ông Lãnh','700000','momo','unpaid',NULL,NULL,NULL,NULL,NULL,'same_day',NULL,NULL,NULL,1890000.00,80000.00,0.00,NULL,189000.00,2159000.00,'Need urgent delivery',NULL,'2025-12-27 01:59:08','2025-12-27 07:59:08'),(4,'ORD-20251227-150510-038',1,1,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','unpaid',NULL,NULL,NULL,NULL,NULL,'standard',NULL,NULL,NULL,28990000.00,0.00,0.00,NULL,2899000.00,31889000.00,NULL,NULL,'2025-12-27 08:05:11','2025-12-27 08:05:11'),(5,'ORD-20251227-150702-376',1,1,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','unpaid',NULL,NULL,NULL,NULL,NULL,'express',NULL,NULL,NULL,23980000.00,0.00,0.00,NULL,2398000.00,26378000.00,NULL,NULL,'2025-12-27 08:07:02','2025-12-27 08:07:02'),(6,'ORD-20251227-151647-814',1,1,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','unpaid',NULL,NULL,NULL,NULL,NULL,'standard',NULL,NULL,NULL,1.00,30000.00,0.00,NULL,0.00,30001.00,NULL,NULL,'2025-12-27 08:16:48','2025-12-27 08:16:48'),(7,'ORD-20251227-151948-719',1,1,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','unpaid',NULL,NULL,NULL,NULL,NULL,'standard',NULL,NULL,NULL,1.00,30000.00,0.00,NULL,0.00,30001.00,NULL,NULL,'2025-12-27 08:19:49','2025-12-27 08:19:49'),(8,'ORD-20251227-152425-388',1,1,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','unpaid',NULL,NULL,NULL,NULL,NULL,'standard',NULL,NULL,NULL,1.00,30000.00,0.00,NULL,0.00,30001.00,NULL,NULL,'2025-12-27 08:24:25','2025-12-27 08:24:25'),(9,'ORD-20251227-154225-309',1,1,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','unpaid',NULL,NULL,NULL,NULL,NULL,'standard',NULL,NULL,NULL,11990000.00,0.00,0.00,NULL,1199000.00,13189000.00,NULL,NULL,'2025-12-27 08:42:25','2025-12-27 08:42:25'),(10,'ORD-20251227-154422-083',1,1,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','unpaid',NULL,NULL,NULL,NULL,NULL,'standard',NULL,NULL,NULL,28990000.00,0.00,0.00,NULL,2899000.00,31889000.00,NULL,NULL,'2025-12-27 08:44:22','2025-12-27 08:44:22'),(11,'ORD-20251227-155105-082',1,1,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','unpaid',NULL,NULL,NULL,NULL,NULL,'standard',NULL,NULL,NULL,28990000.00,0.00,0.00,NULL,2899000.00,31889000.00,NULL,NULL,'2025-12-27 08:51:05','2025-12-27 08:51:05'),(12,'ORD-20251227-155918-760',1,2,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','paid',NULL,'2025-12-27 09:00:22','4636969351',0,'Successful.','standard',NULL,NULL,NULL,1.00,30000.00,0.00,NULL,0.00,30001.00,NULL,NULL,'2025-12-27 08:59:19','2025-12-27 08:59:19'),(13,'ORD-20251227-201223-588',1,2,'linux killer','tttkiller2004@gmail.com','0703370223',4,4,'đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','đâs','0703370223','fsdf','sfs','dsfsd','fdsf','555555','momo','paid',NULL,'2025-12-27 13:13:21','4636973318',0,'Successful.','standard',NULL,NULL,NULL,44460000.00,0.00,0.00,NULL,4446000.00,48906000.00,NULL,NULL,'2025-12-27 13:12:24','2025-12-27 13:12:24');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_history`
--

DROP TABLE IF EXISTS `password_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`created_at`),
  CONSTRAINT `fk_password_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_history`
--

LOCK TABLES `password_history` WRITE;
/*!40000 ALTER TABLE `password_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_product_order` (`product_id`,`display_order`),
  CONSTRAINT `fk_image_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `rating` tinyint NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `images` text COLLATE utf8mb4_unicode_ci,
  `is_verified_purchase` tinyint NOT NULL DEFAULT '0',
  `is_approved` tinyint NOT NULL DEFAULT '0',
  `helpful_count` int NOT NULL DEFAULT '0',
  `admin_reply` text COLLATE utf8mb4_unicode_ci,
  `replied_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product_approved` (`product_id`,`is_approved`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_review_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
INSERT INTO `product_reviews` VALUES (1,9,1,NULL,5,'DSFDS','FDSFDSFSSDFSDF',NULL,0,0,0,NULL,NULL,'2025-12-27 13:03:35','2025-12-27 13:03:35'),(2,2,1,NULL,1,'fdssdf','dsfsd',NULL,0,0,0,NULL,NULL,'2025-12-27 13:08:12','2025-12-27 13:08:12');
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(350) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL,
  `compare_at_price` decimal(12,2) DEFAULT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `specifications` text COLLATE utf8mb4_unicode_ci,
  `primary_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `is_featured` tinyint NOT NULL DEFAULT '0',
  `warranty_months` int NOT NULL DEFAULT '12',
  `meta_title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_brand` (`brand`),
  KEY `idx_category_active` (`category_id`,`is_active`),
  KEY `idx_featured` (`is_featured`,`is_active`),
  KEY `idx_sku` (`sku`),
  KEY `idx_slug` (`slug`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,8,'TP-Link Archer AX3000 WiFi 6 Router','tp-link-archer-ax3000-wifi-6','TP-Link','Archer AX3000','Router WiFi 6 dual-band tốc độ 3.0 Gbps, hỗ trợ OFDMA, MU-MIMO, bảo mật WPA3',1.00,1.00,'TP-AX3000',41,'{\"wifi_standard\":\"WiFi 6 (802.11ax)\",\"speed\":\"3.0 Gbps (574 Mbps @ 2.4GHz + 2402 Mbps @ 5GHz)\",\"antennas\":\"4 external high-gain antennas\",\"ports\":\"1x Gigabit WAN + 4x Gigabit LAN\",\"cpu\":\"Dual-core 1.5GHz processor\",\"memory\":\"256MB RAM, 128MB Flash\",\"features\":\"OFDMA, MU-MIMO, Beamforming, Smart Connect\",\"security\":\"WPA3, VPN Server, Firewall\",\"coverage\":\"Up to 3500 sq ft (325 m²)\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,24,'TP-Link Archer AX3000 - Router WiFi 6 Dual-Band','Router WiFi 6 TP-Link AX3000 tốc độ 3.0Gbps, công nghệ OFDMA, MU-MIMO, bảo mật WPA3','2025-12-27 07:59:08','2025-12-27 08:16:21'),(2,4,'Fortinet FortiGate 60F Next-Gen Firewall','fortinet-fortigate-60f-ngfw','Fortinet','FortiGate 60F','Next-Generation Firewall, SD-WAN, IPS, SSL Inspection, 10 Gbps throughput',28990000.00,32990000.00,'FORTINET-FG-60F',5,'{\"firewall_throughput\":\"10 Gbps\",\"ngfw_throughput\":\"1.8 Gbps\",\"ips_throughput\":\"1.5 Gbps\",\"ssl_inspection\":\"850 Mbps\",\"ports\":\"10x GE RJ45 + 2x GE SFP\",\"vpn\":\"IPsec VPN, SSL VPN\",\"features\":\"SD-WAN, IPS, Application Control, Web Filtering, Anti-Malware\",\"users\":\"Recommended for 50-200 users\",\"management\":\"FortiOS, FortiManager, FortiAnalyzer\",\"warranty\":\"1 year hardware + UTM bundle\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,12,'Fortinet FortiGate 60F - Next-Gen Firewall SMB','FortiGate 60F NGFW, SD-WAN, IPS, 10Gbps throughput, 50-200 users','2025-12-27 07:59:08','2025-12-27 07:59:08'),(3,6,'Ubiquiti UniFi Switch 24 Port PoE (Gen2)','ubiquiti-unifi-switch-24-poe-gen2','Ubiquiti','USW-24-PoE','Switch UniFi 24 cổng Gigabit PoE+, 400W budget, 2x SFP+, UniFi Controller',11990000.00,13990000.00,'UBNT-USW-24-POE',15,'{\"ports\":\"24x Gigabit RJ45 PoE+ + 2x 10G SFP+\",\"poe_ports\":\"24 ports PoE+ (802.3at)\",\"poe_budget\":\"400W total\",\"switching_capacity\":\"68 Gbps\",\"forwarding_rate\":\"50.6 Mpps\",\"vlan\":\"4K VLANs\",\"features\":\"UniFi Controller Integration, Storm Control, Port Isolation\",\"management\":\"UniFi Network Controller\",\"power\":\"100-240V AC\",\"rack_mountable\":\"1U 19-inch rack\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,12,'Ubiquiti UniFi Switch 24 PoE - Switch PoE 400W','UniFi Switch 24 PoE Gen2, 400W budget, 2x SFP+ 10G, UniFi Controller','2025-12-27 07:59:08','2025-12-27 07:59:08'),(4,8,'ASUS RT-AX86U Gaming Router WiFi 6','asus-rt-ax86u-gaming-router','ASUS','RT-AX86U','Router gaming WiFi 6 chuyên nghiệp, AiMesh, Gaming Port 2.5G, Mobile Game Mode',5490000.00,6290000.00,'ASUS-RT-AX86U',27,'{\"wifi_standard\":\"WiFi 6 (802.11ax)\",\"speed\":\"5700 Mbps (861 Mbps @ 2.4GHz + 4804 Mbps @ 5GHz)\",\"antennas\":\"3 external + 1 internal\",\"ports\":\"1x 2.5G WAN + 1x Gigabit WAN/LAN + 4x Gigabit LAN + 2x USB 3.2\",\"cpu\":\"Quad-core 1.8GHz\",\"memory\":\"1GB RAM, 256MB Flash\",\"features\":\"AiMesh, Mobile Game Mode, VPN Fusion, Adaptive QoS\",\"security\":\"AiProtection Pro, WPA3\",\"coverage\":\"Up to 5000 sq ft (464 m²)\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,36,'ASUS RT-AX86U - Gaming Router WiFi 6 Chuyên Nghiệp','Router gaming ASUS RT-AX86U WiFi 6, AiMesh, Gaming Port 2.5G, Mobile Game Mode','2025-12-27 07:59:08','2025-12-27 07:59:08'),(5,8,'Ubiquiti UniFi Dream Machine Pro','ubiquiti-unifi-dream-machine-pro','Ubiquiti','UDM-Pro','Router doanh nghiệp all-in-one, Gateway, Switch, Controller, NVR, IDS/IPS',12990000.00,14990000.00,'UBIQUITI-UDM-PRO',12,'{\"type\":\"Enterprise Gateway + Switch + Controller\",\"throughput\":\"3.5 Gbps with IDS/IPS\",\"ports\":\"1x 10G SFP+, 1x Gigabit WAN, 8x Gigabit LAN PoE+\",\"poe_budget\":\"54W total PoE+ budget\",\"cpu\":\"Quad-core ARM Cortex-A57\",\"memory\":\"4GB DDR4 RAM\",\"storage\":\"1TB HDD (expandable)\",\"features\":\"UniFi Controller, IDS/IPS, DPI, VPN, VLAN\",\"max_devices\":\"500+ concurrent clients\",\"rack_mountable\":\"1U 19-inch rack\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,12,'Ubiquiti UniFi Dream Machine Pro - Enterprise Gateway','UniFi Dream Machine Pro all-in-one, IDS/IPS, PoE+, 10G SFP+, NVR cho doanh nghiệp','2025-12-27 07:59:08','2025-12-27 07:59:08'),(6,1,'Ubiquiti UniFi 6 Lite Access Point WiFi 6','ubiquiti-unifi-6-lite-ap','Ubiquiti','U6-Lite','Access Point WiFi 6 dual-band, 1.5 Gbps throughput, UniFi Controller, PoE',2790000.00,3290000.00,'UBNT-U6-LITE',65,'{\"wifi_standard\":\"WiFi 6 (802.11ax)\",\"speed\":\"1500 Mbps (300 Mbps @ 2.4GHz + 1200 Mbps @ 5GHz)\",\"concurrent_clients\":\"300+\",\"max_range\":\"122m (400 ft)\",\"power\":\"PoE+ (802.3at) or 802.3af\",\"mounting\":\"Ceiling/Wall mount\",\"antennas\":\"2x2 MU-MIMO\",\"features\":\"OFDMA, BSS Coloring, WPA3\",\"management\":\"UniFi Network Controller\",\"dimensions\":\"160 x 160 x 32.65 mm\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,12,'Ubiquiti UniFi 6 Lite - Access Point WiFi 6','UniFi 6 Lite WiFi 6 AP, 1.5Gbps, 300+ clients, PoE, UniFi Controller','2025-12-27 07:59:08','2025-12-27 07:59:08'),(7,4,'Netgate pfSense SG-1100 Security Gateway','netgate-pfsense-sg-1100','Netgate','SG-1100','pfSense Security Gateway, Firewall, VPN, QoS, cho gia đình và SOHO',4990000.00,5990000.00,'PFSENSE-SG-1100',16,'{\"throughput\":\"460 Mbps\",\"vpn_throughput\":\"160 Mbps (AES-128-CBC)\",\"ports\":\"3x Gigabit Ethernet\",\"cpu\":\"Dual-core ARM Cortex-A53\",\"memory\":\"1GB DDR3 RAM\",\"storage\":\"8GB eMMC\",\"features\":\"Firewall, VPN, QoS, Traffic Shaping, Captive Portal\",\"os\":\"pfSense Plus\",\"users\":\"Recommended for 10-25 users\",\"power\":\"12V 1A DC\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,0,12,'Netgate pfSense SG-1100 - Security Gateway SOHO','pfSense SG-1100 firewall, VPN, QoS, cho gia đình và văn phòng nhỏ','2025-12-27 07:59:08','2025-12-27 07:59:08'),(8,6,'Cisco SG350-28P 28-Port Gigabit PoE Managed Switch','cisco-sg350-28p-poe-switch','Cisco','SG350-28P','Switch quản lý 28 cổng Gigabit PoE+, Layer 3, 195W budget, lifetime warranty',15990000.00,18990000.00,'CISCO-SG350-28P',22,'{\"ports\":\"24x Gigabit PoE+ + 2x Gigabit Combo + 2x SFP\",\"poe_ports\":\"24 ports PoE+ (802.3at)\",\"poe_budget\":\"195W total\",\"switching_capacity\":\"56 Gbps\",\"layer\":\"Layer 3 (Static routing, RIP)\",\"vlan\":\"4K VLANs\",\"qos\":\"Advanced QoS, 8 queues\",\"features\":\"ACL, DHCP Server, IPv6, Spanning Tree, Link Aggregation\",\"management\":\"CLI, Web GUI, SNMP\",\"warranty\":\"Lifetime Limited\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,120,'Cisco SG350-28P - Switch PoE 28 Port Layer 3','Switch Cisco SG350-28P PoE+ 195W, Layer 3, 28 cổng Gigabit, lifetime warranty','2025-12-27 07:59:08','2025-12-27 07:59:08'),(9,3,'Viettel G97RG6M Modem GPON WiFi 6 Dual Band','viettel-g97rg6m-gpon-wifi6','Viettel','G97RG6M','Modem quang GPON WiFi 6 AX3000, 4 cổng LAN Gigabit, 2 cổng điện thoại',1490000.00,1990000.00,'VIETTEL-G97RG6M',85,'{\"type\":\"GPON ONU\",\"wifi\":\"WiFi 6 Dual Band AX3000\",\"speed\":\"3000 Mbps (574 Mbps @ 2.4GHz + 2402 Mbps @ 5GHz)\",\"ports\":\"4x Gigabit LAN + 2x FXS + 1x USB 2.0\",\"wan\":\"1x GPON SC/APC\",\"antennas\":\"4 internal antennas\",\"features\":\"IPTV, VoIP, TR-069, WPS\",\"power\":\"12V 1.5A\",\"dimensions\":\"220 x 148 x 38 mm\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,0,12,'Viettel G97RG6M - Modem GPON WiFi 6 Dual Band','Modem quang Viettel G97RG6M WiFi 6 AX3000, 4 LAN Gigabit, IPTV','2025-12-27 07:59:08','2025-12-27 07:59:08'),(10,7,'APC Back-UPS BX650LI-MS 650VA UPS','apc-back-ups-bx650li-ms','APC','BX650LI-MS','Bộ lưu điện UPS 650VA/325W cho thiết bị mạng, AVR, 4 ổ cắm',1490000.00,1790000.00,'APC-BX650LI-MS',42,'{\"capacity\":\"650VA / 325W\",\"topology\":\"Line Interactive\",\"battery\":\"12V 7Ah sealed lead-acid\",\"runtime\":\"10 min @ 50% load, 3 min @ full load\",\"outlets\":\"4x Universal (with surge protection)\",\"avr\":\"Automatic Voltage Regulation\",\"input_voltage\":\"160-290V AC\",\"output_voltage\":\"230V AC ±10%\",\"features\":\"Audible alarm, LED status, Replaceable battery\",\"dimensions\":\"280 x 100 x 142 mm\",\"weight\":\"4.2 kg\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,0,24,'APC Back-UPS BX650LI-MS - UPS 650VA Cho Thiết Bị Mạng','UPS APC BX650LI-MS 650VA/325W, AVR, 4 ổ cắm, cho router, switch','2025-12-27 07:59:08','2025-12-27 07:59:08'),(11,5,'Fluke Networks MicroScanner2 Cable Verifier','fluke-microscanner2-cable-tester','Fluke Networks','MS2-100','Máy test cáp mạng chuyên nghiệp, kiểm tra Cat5e/6/6A, wiremap, length, PoE',8990000.00,10990000.00,'FLUKE-MS2-100',8,'{\"test_cables\":\"Cat5e, Cat6, Cat6A, Coax\",\"tests\":\"Wiremap, Length, Distance to Fault, PoE detection\",\"poe_detection\":\"802.3af/at/bt (up to 90W)\",\"display\":\"Color LCD\",\"reporting\":\"PC reporting software included\",\"battery\":\"Rechargeable Li-ion (8 hours)\",\"features\":\"Tone Generator, IntelliTone support\",\"certification\":\"CE, FCC\",\"warranty\":\"2 years\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,24,'Fluke MicroScanner2 - Máy Test Cáp Mạng Chuyên Nghiệp','Fluke MicroScanner2 test cáp Cat5e/6/6A, wiremap, length, PoE','2025-12-27 07:59:08','2025-12-27 07:59:08'),(12,2,'TP-Link UE300 USB 3.0 to Gigabit Ethernet Adapter','tp-link-ue300-usb-ethernet','TP-Link','UE300','Adapter USB 3.0 sang Gigabit Ethernet, tốc độ 1000 Mbps, plug and play',190000.00,290000.00,'TP-UE300',250,'{\"interface\":\"USB 3.0 Type-A\",\"ethernet\":\"1x Gigabit RJ45\",\"speed\":\"10/100/1000 Mbps auto-negotiation\",\"chipset\":\"Realtek RTL8153\",\"os_support\":\"Windows, macOS, Linux, Chrome OS\",\"features\":\"Plug and Play, Wake-on-LAN\",\"led\":\"1x Link/Activity LED\",\"cable_length\":\"12cm integrated USB cable\",\"dimensions\":\"58 x 24 x 15 mm\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,0,24,'TP-Link UE300 - Adapter USB 3.0 to Gigabit','Adapter USB TP-Link UE300, USB 3.0 to Gigabit Ethernet 1000Mbps','2025-12-27 07:59:08','2025-12-27 07:59:08'),(13,6,'TP-Link TL-SG108E 8-Port Gigabit Easy Smart Switch','tp-link-tl-sg108e-8-port','TP-Link','TL-SG108E','Switch quản lý 8 cổng Gigabit, VLAN, QoS, IGMP Snooping, web-based management',690000.00,890000.00,'TP-TL-SG108E',120,'{\"ports\":\"8x 10/100/1000 Mbps RJ45\",\"switching_capacity\":\"16 Gbps\",\"forwarding_rate\":\"11.9 Mpps\",\"mac_address_table\":\"4K\",\"vlan\":\"802.1Q VLAN, MTU VLAN\",\"qos\":\"802.1p CoS, DSCP\",\"features\":\"IGMP Snooping, Port Mirroring, Cable Diagnostics\",\"management\":\"Web-based GUI\",\"power\":\"100-240V AC, 50/60Hz\",\"fanless\":\"Yes (silent operation)\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,0,36,'TP-Link TL-SG108E - Switch 8 Port Gigabit Quản Lý','Switch TP-Link SG108E 8 cổng Gigabit có quản lý, VLAN, QoS, web management','2025-12-27 07:59:08','2025-12-27 07:59:08'),(14,5,'Pro\'sKit MT-7062 RJ45 Crimping Tool Kit','proskit-mt7062-crimping-tool','Pro\'sKit','MT-7062','Bộ dụng cụ bấm mạng RJ45/RJ11, cắt, tuốt dây, kèm cable tester',350000.00,490000.00,'PROSKIT-MT-7062',156,'{\"crimping\":\"RJ45, RJ12, RJ11 (8P8C, 6P6C, 6P4C, 6P2C)\",\"cutting\":\"Integrated wire cutter\",\"stripping\":\"Cable stripper for round/flat cables\",\"tester\":\"Basic cable tester included\",\"material\":\"Carbon steel with comfort grip\",\"ratchet\":\"Ratchet mechanism for consistent crimps\",\"kit_includes\":\"Crimper, Tester, 10x RJ45 connectors, 10x boots\",\"weight\":\"320g\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,0,12,'Pro\'sKit MT-7062 - Bộ Dụng Cụ Bấm Mạng RJ45','Bộ bấm mạng Pro\'sKit MT-7062, RJ45/RJ11, kèm cable tester','2025-12-27 07:59:08','2025-12-27 07:59:08'),(15,7,'Ubiquiti PoE Injector 48V 24W 802.3at','ubiquiti-poe-injector-48v-24w','Ubiquiti','POE-48-24W','PoE+ Injector 48V 24W 802.3at cho UniFi Access Points, Gigabit Ethernet',290000.00,390000.00,'UBNT-POE-48-24W',142,'{\"standard\":\"802.3at PoE+\",\"power_output\":\"24W\",\"voltage\":\"48V DC\",\"ports\":\"1x Data In + 1x PoE Out (Gigabit)\",\"ethernet\":\"Gigabit 10/100/1000 Mbps\",\"max_distance\":\"100m\",\"input\":\"100-240V AC 50/60Hz\",\"compatible\":\"UniFi AP-AC-Lite, AP-AC-LR, AP-AC-Pro\",\"dimensions\":\"95 x 45 x 28 mm\",\"weight\":\"135g\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,0,12,'Ubiquiti PoE Injector 48V 24W - 802.3at PoE+','PoE+ Injector Ubiquiti 48V 24W 802.3at, Gigabit, cho UniFi AP','2025-12-27 07:59:08','2025-12-27 07:59:08'),(16,3,'D-Link DWR-2101 5G NR Mobile Router','dlink-dwr-2101-5g-router','D-Link','DWR-2101','Router 5G NR, WiFi 6 AX1800, 4G/5G Dual SIM, tốc độ download 3.4 Gbps',8990000.00,10990000.00,'DLINK-DWR-2101-5G',12,'{\"cellular\":\"5G NR + 4G LTE Dual SIM\",\"download_speed\":\"Up to 3.4 Gbps (5G)\",\"upload_speed\":\"Up to 450 Mbps\",\"wifi\":\"WiFi 6 AX1800 Dual Band\",\"ports\":\"2x Gigabit LAN + 1x Gigabit WAN/LAN\",\"sim\":\"2x Nano SIM (failover)\",\"features\":\"VPN, Firewall, DDNS, Port Forwarding\",\"battery\":\"Optional (external)\",\"antennas\":\"4x external detachable\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,24,'D-Link DWR-2101 - Router 5G NR WiFi 6','Router 5G D-Link DWR-2101, WiFi 6 AX1800, 3.4Gbps, Dual SIM','2025-12-27 07:59:08','2025-12-27 07:59:08'),(17,2,'CommScope Cat6A S/FTP Cable 305m','commscope-cat6a-sftp-305m','CommScope','Cat6A S/FTP','Cáp mạng Cat6A S/FTP chống nhiễu, 10 Gbps, 500MHz, LSZH',4290000.00,4990000.00,'COMMSCOPE-CAT6A-STP',18,'{\"category\":\"Cat6A S/FTP (Shielded)\",\"conductor\":\"23 AWG Bare Copper\",\"pairs\":\"4 pairs individually shielded + overall shield\",\"bandwidth\":\"500 MHz\",\"speed\":\"10 Gbps (10 Gigabit Ethernet)\",\"max_length\":\"100m per segment\",\"jacket\":\"LSZH (Low Smoke Zero Halogen)\",\"color\":\"Gray\",\"standard\":\"ISO/IEC 11801, TIA-568.2-D\",\"packaging\":\"305m/box\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,15,'CommScope Cat6A S/FTP - Cáp 10 Gigabit Chống Nhiễu','Cáp CommScope Cat6A S/FTP 305m, 10Gbps, 500MHz, LSZH, chống nhiễu','2025-12-27 07:59:08','2025-12-27 07:59:08'),(18,2,'Cáp mạng AMP Cat6 UTP 305m (1 thùng)','cap-mang-amp-cat6-utp-305m','AMP','Cat6 UTP','Cáp mạng Cat6 UTP 4 đôi, tốc độ 1 Gbps, 250MHz, chuẩn TIA/EIA-568-B',1890000.00,2290000.00,'AMP-CAT6-UTP-305M',35,'{\"category\":\"Cat6 UTP\",\"conductor\":\"23 AWG Bare Copper\",\"pairs\":\"4 pairs (8 conductors)\",\"bandwidth\":\"250 MHz\",\"speed\":\"1000 Mbps (1 Gigabit)\",\"max_length\":\"100m per segment\",\"jacket\":\"PVC\",\"color\":\"Blue\",\"standard\":\"TIA/EIA-568-B.2-1\",\"packaging\":\"305m/box\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,0,12,'Cáp Mạng AMP Cat6 UTP 305m - Gigabit Ethernet','Cáp mạng AMP Cat6 UTP 305m, 23AWG bare copper, 1Gbps, 250MHz','2025-12-27 07:59:08','2025-12-27 07:59:08'),(19,7,'TP-Link TL-POE150S PoE Injector Adapter','tp-link-tl-poe150s-injector','TP-Link','TL-POE150S','PoE Injector 48V 15.4W, 802.3af, cấp nguồn cho Access Point, IP Camera',190000.00,290000.00,'TP-TL-POE150S',185,'{\"standard\":\"802.3af PoE\",\"power_output\":\"15.4W\",\"voltage\":\"48V DC\",\"ports\":\"1x Data In + 1x PoE Out\",\"ethernet\":\"Gigabit 10/100/1000 Mbps\",\"max_distance\":\"100m\",\"input\":\"100-240V AC 50/60Hz\",\"protection\":\"Short circuit, Overload, Overcurrent\",\"led\":\"Power, PoE\",\"plug_and_play\":\"Yes\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,0,24,'TP-Link TL-POE150S - PoE Injector 802.3af 15.4W','PoE Injector TP-Link TL-POE150S 48V 15.4W, 802.3af, Gigabit','2025-12-27 07:59:08','2025-12-27 07:59:08'),(20,1,'TP-Link EAP660 HD WiFi 6 AX3600 Access Point','tp-link-eap660-hd-wifi6','TP-Link','EAP660 HD','Access Point WiFi 6 AX3600, 2.5G Ethernet, Omada Controller, 1024-QAM',4290000.00,4990000.00,'TP-EAP660HD',42,'{\"wifi_standard\":\"WiFi 6 (802.11ax)\",\"speed\":\"3600 Mbps (574 Mbps @ 2.4GHz + 2882 Mbps @ 5GHz)\",\"ethernet\":\"1x 2.5 Gigabit RJ45 + 1x Gigabit RJ45\",\"concurrent_clients\":\"512+\",\"power\":\"PoE+ (802.3at)\",\"antennas\":\"4x4 MU-MIMO\",\"features\":\"OFDMA, 1024-QAM, Airtime Fairness, Band Steering\",\"management\":\"Omada Controller\",\"mounting\":\"Ceiling mount\",\"coverage\":\"200m² (2150 sq ft)\"}','https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg',1,1,36,'TP-Link EAP660 HD - WiFi 6 AX3600 Access Point','TP-Link EAP660 HD WiFi 6, 3600Mbps, 2.5G port, Omada Controller','2025-12-27 07:59:08','2025-12-27 07:59:08');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `security_logs`
--

DROP TABLE IF EXISTS `security_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `security_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_date` (`event_type`,`created_at`),
  KEY `idx_user_date` (`user_id`,`created_at`),
  CONSTRAINT `fk_security_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `security_logs`
--

LOCK TABLES `security_logs` WRITE;
/*!40000 ALTER TABLE `security_logs` DISABLE KEYS */;
INSERT INTO `security_logs` VALUES (1,1,'oauth_user_registered',NULL,'{\"provider\":\"google\",\"email\":\"tttkiller2004@gmail.com\"}','2025-12-27 07:44:54'),(2,2,'login_success','::ffff:127.0.0.1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 08:14:24'),(3,2,'login_success','::ffff:127.0.0.1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 09:52:15'),(4,2,'login_success','::ffff:127.0.0.1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 10:11:14'),(5,2,'login_success','::ffff:127.0.0.1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 12:22:01'),(6,2,'login_success','::1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 12:32:59'),(7,2,'login_success','::ffff:127.0.0.1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 12:34:17'),(8,2,'login_success','::1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 12:46:49'),(9,2,'login_success','::1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 12:47:01'),(10,2,'login_success','::ffff:127.0.0.1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 12:47:12'),(11,2,'login_success','::1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 12:47:12'),(12,2,'login_success','::ffff:127.0.0.1','{\"email\":\"admin@networkstore.com\"}','2025-12-27 13:07:05');
/*!40000 ALTER TABLE `security_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopping_carts`
--

DROP TABLE IF EXISTS `shopping_carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopping_carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopping_carts`
--

LOCK TABLES `shopping_carts` WRITE;
/*!40000 ALTER TABLE `shopping_carts` DISABLE KEYS */;
INSERT INTO `shopping_carts` VALUES (1,3,NULL,'2025-12-27 07:59:08','2025-12-27 07:59:08'),(2,4,NULL,'2025-12-27 07:59:08','2025-12-27 07:59:08'),(3,1,'fo3NiFqOwenIj8q-ELBmjdFLQhpz9Fh3','2025-12-27 08:02:58','2025-12-27 09:42:30');
/*!40000 ALTER TABLE `shopping_carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `setting_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  `description` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `previous_token_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rotated_at` datetime DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_token` (`token_hash`),
  KEY `idx_previous_token` (`previous_token_hash`),
  KEY `idx_user_expires` (`user_id`,`expires_at`),
  CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES (1,1,'e5090390961dfd9c571afc8234dc9fd72736b8dc7be159c2557c629056327b7f','d14e2ad6bed4daf06c7324412bd04b2f509465609fb342b13c433561b38ee2b9','2025-12-27 13:19:32',NULL,NULL,'2026-01-03 07:44:54','2025-12-27 07:44:54'),(12,2,'099fb066074f9faaa238ae35f58d3d2c156e6d04881613f9e485f703cba4655a',NULL,NULL,'::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0','2026-01-03 13:07:05','2025-12-27 13:07:05');
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('customer','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `is_email_verified` tinyint NOT NULL DEFAULT '0',
  `failed_login_attempts` int NOT NULL DEFAULT '0',
  `locked_until` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'linux killer','tttkiller2004@gmail.com',NULL,NULL,'customer',1,1,0,NULL,'2025-12-27 07:44:54','2025-12-27 07:44:54','2025-12-27 07:44:54'),(2,'Network Store Admin','admin@networkstore.com','0987654321','$2b$10$Tw7z1.MLoNJTTuw2V9ywHOeQgsJTYThzdvP4IJHFo8zY2WBf3Ex/K','admin',1,1,0,NULL,'2025-12-27 13:07:05','2025-12-27 07:59:08','2025-12-27 07:59:08'),(3,'Nguyễn Văn Test','customer@test.com','0912345678','$2b$10$rodlk0Fm7kmOR9Jmfj3C7ONz5NqSSMTD8jXOu5QO41pEJBrjgGFw.','customer',1,1,0,NULL,NULL,'2025-12-27 07:59:08','2025-12-27 07:59:08'),(4,'Trần Thị B','customer@example.com','0923456789','$2b$10$z3.t7kFiQBlv9pihTc8seeqeqNoEu9dsLHgre28x/hUqEj6aq2w6i','customer',1,1,0,NULL,NULL,'2025-12-27 07:59:08','2025-12-27 07:59:08');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_tokens`
--

DROP TABLE IF EXISTS `verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_type` enum('email_verification','password_reset') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token` (`token_hash`),
  KEY `idx_user_type` (`user_id`,`token_type`,`expires_at`),
  CONSTRAINT `fk_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_tokens`
--

LOCK TABLES `verification_tokens` WRITE;
/*!40000 ALTER TABLE `verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-27 20:21:25
