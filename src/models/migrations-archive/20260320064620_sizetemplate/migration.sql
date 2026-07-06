-- AlterTable
ALTER TABLE `style` ADD COLUMN `gsmId` INTEGER NULL,
    ADD COLUMN `itemGroupId` INTEGER NULL,
    ADD COLUMN `sizeTemplateId` INTEGER NULL,
    ADD COLUMN `uomId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SizeTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SizeTemplateList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sizeTemplateId` INTEGER NULL,
    `sizeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplate` ADD CONSTRAINT `SizeTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplateList` ADD CONSTRAINT `SizeTemplateList_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplateList` ADD CONSTRAINT `SizeTemplateList_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
