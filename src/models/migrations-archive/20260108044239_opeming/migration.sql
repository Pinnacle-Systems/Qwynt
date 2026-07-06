/*
  Warnings:

  - Made the column `partyId` on table `openingbalance` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `openingbalance` DROP FOREIGN KEY `OpeningBalance_partyId_fkey`;

-- AlterTable
ALTER TABLE `openingbalance` MODIFY `partyId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
