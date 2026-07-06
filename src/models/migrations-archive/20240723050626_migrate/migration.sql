-- CreateTable
CREATE TABLE `OpeningStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierDcNo` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `address` VARCHAR(191) NULL,
    `place` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATE NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `netBillValue` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpeningStockItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `OpeningStockId` INTEGER NULL,
    `box` DOUBLE NULL,
    `productId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `stockId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OpeningStock` ADD CONSTRAINT `OpeningStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStock` ADD CONSTRAINT `OpeningStock_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_OpeningStockId_fkey` FOREIGN KEY (`OpeningStockId`) REFERENCES `OpeningStock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
