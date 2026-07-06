-- CreateTable
CREATE TABLE `Po` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `docDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `poType` VARCHAR(191) NULL,
    `taxTemplateId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `deliveryType` VARCHAR(191) NULL,
    `deliveryToId` INTEGER NULL,
    `deliveryBranchId` INTEGER NULL,
    `termsAndCondtion` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `supplierId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL,
    `taxPercent` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_deliveryToId_fkey` FOREIGN KEY (`deliveryToId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_deliveryBranchId_fkey` FOREIGN KEY (`deliveryBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
