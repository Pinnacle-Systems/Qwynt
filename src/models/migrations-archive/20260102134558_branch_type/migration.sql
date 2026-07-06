-- AlterTable
ALTER TABLE `party` ADD COLUMN `parentId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `BranchType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `aliasName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
