/*
  Warnings:

  - You are about to drop the `oauth_accounts` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password_hash` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `oauth_accounts` DROP FOREIGN KEY `fk_oauth_user`;

-- AlterTable
ALTER TABLE `product_reviews` ADD COLUMN `helpful_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `images` TEXT NULL,
    ADD COLUMN `replied_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `phone` VARCHAR(20) NOT NULL,
    MODIFY `password_hash` VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE `oauth_accounts`;
