/*
  Warnings:

  - You are about to drop the column `active` on the `openingstock` table. All the data in the column will be lost.
  - You are about to drop the column `netBillValue` on the `openingstock` table. All the data in the column will be lost.
  - You are about to drop the column `supplierDcNo` on the `openingstock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[OpeningStockItemsId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `openingstockitems` DROP FOREIGN KEY `OpeningStockItems_stockId_fkey`;

-- AlterTable
ALTER TABLE `openingstock` DROP COLUMN `active`,
    DROP COLUMN `netBillValue`,
    DROP COLUMN `supplierDcNo`;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `OpeningStockItemsId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Stock_OpeningStockItemsId_key` ON `Stock`(`OpeningStockItemsId`);

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_OpeningStockItemsId_fkey` FOREIGN KEY (`OpeningStockItemsId`) REFERENCES `OpeningStockItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
