-- AlterTable
ALTER TABLE `inwarditems` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` DOUBLE NULL,
    ADD COLUMN `taxPercent` DOUBLE NULL;

-- AlterTable
ALTER TABLE `purchaseinward` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` DOUBLE NULL,
    ADD COLUMN `netBillValue` DOUBLE NULL,
    ADD COLUMN `receiptType` VARCHAR(191) NULL,
    ADD COLUMN `taxTemplateId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
