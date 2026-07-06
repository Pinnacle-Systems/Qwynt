/*
  Warnings:

  - You are about to alter the column `netBillValue` on the `salesbill` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `salesbill` MODIFY `netBillValue` INTEGER NULL;
