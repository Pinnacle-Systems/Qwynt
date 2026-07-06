-- AlterTable
ALTER TABLE `purchasebillentry` ADD COLUMN `companyId` INTEGER NULL,
    ADD COLUMN `vehicleNo` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
