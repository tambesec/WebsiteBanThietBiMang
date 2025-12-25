-- AlterTable
ALTER TABLE `user_sessions` ADD COLUMN `previous_token_hash` VARCHAR(64) NULL,
    ADD COLUMN `rotated_at` DATETIME(0) NULL;

-- CreateIndex
CREATE INDEX `idx_previous_token` ON `user_sessions`(`previous_token_hash`);
