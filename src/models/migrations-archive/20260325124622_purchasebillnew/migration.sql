-- AlterTable
ALTER TABLE `purchasebillentry` ADD COLUMN `billType` VARCHAR(191) NULL,
    ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` DOUBLE NULL,
    ADD COLUMN `taxTemplateId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasebillentryitems` ADD COLUMN `discountType` VARCHAR(191) NULL,
    ADD COLUMN `discountValue` DOUBLE NULL,
    ADD COLUMN `taxPercent` DOUBLE NULL;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
