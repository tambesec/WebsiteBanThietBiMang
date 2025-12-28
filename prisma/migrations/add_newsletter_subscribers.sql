-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(320) NOT NULL UNIQUE,
  `status` ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
  `subscribed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` DATETIME(0) NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
