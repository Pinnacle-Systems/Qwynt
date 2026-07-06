-- CreateTable
CREATE TABLE `Style` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `aliasName` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StyleItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `aliasName` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryChallan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `supplierId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `deliveryType` VARCHAR(191) NULL,
    `deliveryPartyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryChallanItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryChallanId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `noOfBox` VARCHAR(191) NULL,
    `uomId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_deliveryPartyId_fkey` FOREIGN KEY (`deliveryPartyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_deliveryChallanId_fkey` FOREIGN KEY (`deliveryChallanId`) REFERENCES `DeliveryChallan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
