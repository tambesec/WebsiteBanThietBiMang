-- Add MoMo payment fields to orders table
ALTER TABLE `orders` 
ADD COLUMN `payment_time` DATETIME NULL AFTER `paid_at`,
ADD COLUMN `momo_trans_id` VARCHAR(100) NULL AFTER `payment_time`,
ADD COLUMN `momo_result_code` INT NULL AFTER `momo_trans_id`,
ADD COLUMN `momo_message` VARCHAR(500) NULL AFTER `momo_result_code`;

-- Add index for momo_trans_id
CREATE INDEX `idx_momo_trans_id` ON `orders` (`momo_trans_id`);
