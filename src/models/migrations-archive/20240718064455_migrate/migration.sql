/*
  Warnings:

  - You are about to drop the column `salePrice` on the `salesbillitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `salesbill` ADD COLUMN `conform` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `salesbillitems` DROP COLUMN `salePrice`;
