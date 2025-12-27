-- Add missing fields to product_reviews table
ALTER TABLE `product_reviews` 
ADD COLUMN `images` TEXT NULL AFTER `comment`,
ADD COLUMN `helpful_count` INT NOT NULL DEFAULT 0 AFTER `is_approved`,
ADD COLUMN `replied_at` DATETIME(0) NULL AFTER `admin_reply`;
