-- AlterTable
ALTER TABLE `deliverychallan` ADD COLUMN `dcDate` DATETIME(3) NULL,
    ADD COLUMN `dcNo` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `deliverychallanitems` ADD COLUMN `colorId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
