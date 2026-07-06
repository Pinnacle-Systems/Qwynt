-- AlterTable
ALTER TABLE `purchaseledger` ADD COLUMN `purchaseInwardId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `gsmId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseLedger` ADD CONSTRAINT `PurchaseLedger_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
