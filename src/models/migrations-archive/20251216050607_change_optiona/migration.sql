-- DropForeignKey
ALTER TABLE `deliverychallan` DROP FOREIGN KEY `DeliveryChallan_createdById_fkey`;

-- AlterTable
ALTER TABLE `deliverychallan` MODIFY `docId` VARCHAR(191) NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT false,
    MODIFY `createdById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
