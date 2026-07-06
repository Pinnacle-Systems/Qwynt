/*
  Warnings:

  - You are about to drop the column `amount` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentRefNo` on the `payment` table. All the data in the column will be lost.
  - Added the required column `cvv` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentType` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `amount`,
    DROP COLUMN `paymentRefNo`,
    ADD COLUMN `cvv` DATETIME(3) NOT NULL,
    ADD COLUMN `paidAmount` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `paymentType` VARCHAR(191) NOT NULL;
