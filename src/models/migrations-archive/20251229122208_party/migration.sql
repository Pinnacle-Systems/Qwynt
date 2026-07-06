-- DropForeignKey
ALTER TABLE `attachments` DROP FOREIGN KEY `attachments_partyId_fkey`;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
