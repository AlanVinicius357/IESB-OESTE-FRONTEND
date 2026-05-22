/*
  Warnings:

  - You are about to drop the column `is_completed` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tasks` DROP COLUMN `is_completed`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `focus_time` INTEGER NOT NULL DEFAULT 25,
    `short_break` INTEGER NOT NULL DEFAULT 5,
    `long_break` INTEGER NOT NULL DEFAULT 15,
    `user_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `settings_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
