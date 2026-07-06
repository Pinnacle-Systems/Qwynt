-- CreateTable
CREATE TABLE `PurchaseBillEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `finYearId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `remarks` LONGTEXT NULL,
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseBillEntryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseBillEntryId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `inwardQty` DOUBLE NULL,
    `invNo` VARCHAR(191) NULL,
    `dcNo` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_purchaseBillEntryId_fkey` FOREIGN KEY (`purchaseBillEntryId`) REFERENCES `PurchaseBillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
