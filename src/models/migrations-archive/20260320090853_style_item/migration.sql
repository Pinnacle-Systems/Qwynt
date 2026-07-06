-- AlterTable
ALTER TABLE `styleitem` ADD COLUMN `gsmId` INTEGER NULL,
    ADD COLUMN `itemGroupId` INTEGER NULL,
    ADD COLUMN `sizeTemplateId` INTEGER NULL,
    ADD COLUMN `uomId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
