-- AlterTable
ALTER TABLE `poitems` ADD COLUMN `colorId` INTEGER NULL,
    ADD COLUMN `itemGroupId` INTEGER NULL,
    ADD COLUMN `sizeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
