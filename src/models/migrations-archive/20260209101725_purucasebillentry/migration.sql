/*
  Warnings:

  - You are about to drop the column `purchaseInwardId` on the `purchasebillentryitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `purchasebillentryitems` DROP FOREIGN KEY `PurchaseBillEntryItems_purchaseInwardId_fkey`;

-- AlterTable
ALTER TABLE `purchasebillentryitems` DROP COLUMN `purchaseInwardId`;
