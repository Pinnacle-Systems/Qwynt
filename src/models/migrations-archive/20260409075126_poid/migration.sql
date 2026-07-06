-- AlterTable
ALTER TABLE `purchasebillentryitems` ADD COLUMN `poId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasereturnitems` ADD COLUMN `poId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
