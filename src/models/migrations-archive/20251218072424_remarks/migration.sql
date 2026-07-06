-- DropForeignKey
ALTER TABLE `deliveryinvoiceitems` DROP FOREIGN KEY `DeliveryInvoiceItems_deliveryInvoiceId_fkey`;

-- AlterTable
ALTER TABLE `deliveryinvoice` ADD COLUMN `remarks` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_deliveryInvoiceId_fkey` FOREIGN KEY (`deliveryInvoiceId`) REFERENCES `DeliveryInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
