/*
  Warnings:

  - You are about to drop the column `conform` on the `salesbill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `salesbill` DROP COLUMN `conform`,
    ADD COLUMN `isOn` BOOLEAN NOT NULL DEFAULT true;
