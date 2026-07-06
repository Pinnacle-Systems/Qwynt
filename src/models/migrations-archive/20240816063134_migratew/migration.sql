/*
  Warnings:

  - You are about to alter the column `paidAmount` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `totalBillAmount` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `discount` on the `payment` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `payment` MODIFY `paidAmount` INTEGER NULL DEFAULT 0,
    MODIFY `totalBillAmount` INTEGER NULL,
    MODIFY `discount` INTEGER NULL DEFAULT 0;
