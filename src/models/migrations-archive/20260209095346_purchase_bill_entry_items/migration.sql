-- AlterTable
ALTER TABLE `purchasebillentryitems` ADD COLUMN `purchaseInwardId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
