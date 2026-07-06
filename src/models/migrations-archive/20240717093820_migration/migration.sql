/*
  Warnings:

  - You are about to drop the column `uomId` on the `pobillitems` table. All the data in the column will be lost.
  - You are about to drop the column `salePrice` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `uomId` on the `stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `pobillitems` DROP FOREIGN KEY `PoBillItems_uomId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_uomId_fkey`;

-- AlterTable
ALTER TABLE `pobillitems` DROP COLUMN `uomId`;

-- AlterTable
ALTER TABLE `stock` DROP COLUMN `salePrice`,
    DROP COLUMN `uomId`;
