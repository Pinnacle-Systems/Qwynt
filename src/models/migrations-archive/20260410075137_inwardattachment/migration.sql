-- AlterTable
ALTER TABLE `attachments` ADD COLUMN `purchaseInwardId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
