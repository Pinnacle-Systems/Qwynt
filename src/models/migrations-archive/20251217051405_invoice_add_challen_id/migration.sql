-- AlterTable
ALTER TABLE `deliveryinvoiceitems` ADD COLUMN `deliveryChallanId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_deliveryChallanId_fkey` FOREIGN KEY (`deliveryChallanId`) REFERENCES `DeliveryChallan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
