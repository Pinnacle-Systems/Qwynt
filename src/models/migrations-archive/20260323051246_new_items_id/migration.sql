-- AlterTable
ALTER TABLE `inwarditems` ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `itemGroupId` INTEGER NULL,
    ADD COLUMN `sizeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasebillentryitems` ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `itemGroupId` INTEGER NULL,
    ADD COLUMN `sizeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasecancelitems` ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `itemGroupId` INTEGER NULL,
    ADD COLUMN `sizeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `purchasereturnitems` ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `itemGroupId` INTEGER NULL,
    ADD COLUMN `sizeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `itemGroupId` INTEGER NULL,
    ADD COLUMN `sizeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
