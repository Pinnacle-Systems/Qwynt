/*
  Warnings:

  - You are about to drop the column `invoiceQty` on the `deliverychallanitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `deliverychallanitems` DROP COLUMN `invoiceQty`;

-- AlterTable
ALTER TABLE `deliveryinvoiceitems` ADD COLUMN `invoiceQty` DOUBLE NULL;
