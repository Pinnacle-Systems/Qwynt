-- AlterTable
ALTER TABLE `deliverychallan` ADD COLUMN `finYearId` INTEGER NULL;

-- AlterTable
ALTER TABLE `deliveryinvoice` ADD COLUMN `finYearId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
