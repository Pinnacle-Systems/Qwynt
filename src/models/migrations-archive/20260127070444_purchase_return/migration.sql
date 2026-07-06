-- AlterTable
ALTER TABLE `inwarditems` ADD COLUMN `batchNo` VARCHAR(191) NULL,
    ADD COLUMN `invNo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `purchaseinward` ADD COLUMN `invNo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `batchNo` VARCHAR(191) NULL,
    ADD COLUMN `invNo` VARCHAR(191) NULL,
    ADD COLUMN `purchaseReturnItemsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `PurchaseInwardReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `supplierId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `termsAndCondition` VARCHAR(191) NULL,
    `remarks` LONGTEXT NULL,
    `returnType` VARCHAR(191) NULL,
    `storeId` INTEGER NULL,
    `locationId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseInwardReturnId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `poQty` DOUBLE NULL,
    `returnQty` DOUBLE NULL,
    `returnType` VARCHAR(191) NULL,
    `purchaseInwardId` INTEGER NULL,
    `batchNo` VARCHAR(191) NULL,
    `invNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_purchaseReturnItemsId_fkey` FOREIGN KEY (`purchaseReturnItemsId`) REFERENCES `PurchaseReturnItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_purchaseInwardReturnId_fkey` FOREIGN KEY (`purchaseInwardReturnId`) REFERENCES `PurchaseInwardReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
