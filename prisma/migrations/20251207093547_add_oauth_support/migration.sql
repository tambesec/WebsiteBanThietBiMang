-- AlterTable
ALTER TABLE `users` MODIFY `phone` VARCHAR(20) NULL,
    MODIFY `password_hash` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `oauth_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `provider` ENUM('google', 'facebook', 'github', 'apple') NOT NULL,
    `provider_user_id` VARCHAR(255) NOT NULL,
    `provider_email` VARCHAR(320) NULL,
    `provider_username` VARCHAR(150) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `is_primary` TINYINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_oauth_user`(`user_id`),
    INDEX `idx_provider_email`(`provider_email`),
    UNIQUE INDEX `unique_provider_user`(`provider`, `provider_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `oauth_accounts` ADD CONSTRAINT `fk_oauth_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
