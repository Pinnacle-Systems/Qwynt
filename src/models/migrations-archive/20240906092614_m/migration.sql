/*
  Warnings:

  - Made the column `productId` on table `pobillitems` required. This step will fail if there are existing NULL values in that column.
  - Made the column `productId` on table `salesbillitems` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `pobillitems` DROP FOREIGN KEY `PoBillItems_productId_fkey`;

-- DropForeignKey
ALTER TABLE `salesbillitems` DROP FOREIGN KEY `SalesBillItems_productId_fkey`;

-- AlterTable
ALTER TABLE `pobillitems` MODIFY `productId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `salesbillitems` MODIFY `productId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBillItems` ADD CONSTRAINT `SalesBillItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
