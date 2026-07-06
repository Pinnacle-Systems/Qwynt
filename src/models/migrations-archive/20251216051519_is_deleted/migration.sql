-- DropForeignKey
ALTER TABLE `deliverychallanitems` DROP FOREIGN KEY `DeliveryChallanItems_deliveryChallanId_fkey`;

-- AlterTable
ALTER TABLE `deliverychallan` ADD COLUMN `isDeleted` BOOLEAN NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_deliveryChallanId_fkey` FOREIGN KEY (`deliveryChallanId`) REFERENCES `DeliveryChallan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
