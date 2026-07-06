-- CreateTable
CREATE TABLE `PurchaseCancel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `termsAndCondition` VARCHAR(191) NULL,
    `remarks` LONGTEXT NULL,
    `poType` VARCHAR(191) NULL,
    `storeId` INTEGER NULL,
    `locationId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseCancelItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseCancelId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `cancelQty` DOUBLE NULL,
    `poType` VARCHAR(191) NULL,
    `poId` INTEGER NULL,
    `batchNo` VARCHAR(191) NULL,
    `invNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_purchaseCancelId_fkey` FOREIGN KEY (`purchaseCancelId`) REFERENCES `PurchaseCancel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
