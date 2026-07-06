/*
  Warnings:

  - Added the required column `createdById` to the `DeliveryChallan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `deliverychallan` ADD COLUMN `createdById` INTEGER NOT NULL,
    ADD COLUMN `updatedById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
