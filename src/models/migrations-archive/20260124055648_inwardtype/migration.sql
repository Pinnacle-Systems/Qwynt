-- AlterTable
ALTER TABLE `inwarditems` ADD COLUMN `inwardType` VARCHAR(191) NULL,
    ADD COLUMN `poId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchaseinward` ADD COLUMN `locationId` INTEGER NULL,
    ADD COLUMN `storeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `inwardType` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
