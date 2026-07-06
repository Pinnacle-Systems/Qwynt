-- AlterTable
ALTER TABLE `po` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` DOUBLE NULL,
    ADD COLUMN `quoteVersion` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `taxPercent` DOUBLE NULL;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `quoteVersion` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `QuoteVersion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poId` INTEGER NULL,
    `quoteVersion` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TermsAndConditions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` LONGTEXT NULL,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `days` INTEGER NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `aliasName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuoteVersion` ADD CONSTRAINT `QuoteVersion_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayTerm` ADD CONSTRAINT `PayTerm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
