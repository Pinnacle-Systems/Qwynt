-- AlterTable
ALTER TABLE `purchasecancel` ADD COLUMN `termsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchaseinwardreturn` ADD COLUMN `termsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_termsId_fkey` FOREIGN KEY (`termsId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_termsId_fkey` FOREIGN KEY (`termsId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
