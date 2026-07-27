/*
  Warnings:

  - Made the column `hsnId` on table `ItemVariantMaster` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ItemVariantMaster" DROP CONSTRAINT "ItemVariantMaster_hsnId_fkey";

-- AlterTable
ALTER TABLE "ItemVariantMaster" ALTER COLUMN "hsnId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
