-- AlterTable
ALTER TABLE `inwarditems` ADD COLUMN `gsmId` INTEGER NULL;

-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `gsmId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasebillentryitems` ADD COLUMN `gsmId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasecancelitems` ADD COLUMN `gsmId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasereturnitems` ADD COLUMN `gsmId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
