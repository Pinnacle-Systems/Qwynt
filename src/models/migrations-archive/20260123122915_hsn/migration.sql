-- AlterTable
ALTER TABLE `purchaseinward` ADD COLUMN `inwardType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `hsnId` INTEGER NULL,
    ADD COLUMN `inwardItemsId` INTEGER NULL,
    ADD COLUMN `styleItemId` INTEGER NULL,
    ADD COLUMN `uomId` INTEGER NULL;

-- AlterTable
ALTER TABLE `styleitem` ADD COLUMN `hsnId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_inwardItemsId_fkey` FOREIGN KEY (`inwardItemsId`) REFERENCES `InwardItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
