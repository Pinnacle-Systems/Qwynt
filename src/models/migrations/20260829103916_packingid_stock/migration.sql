/*
  Warnings:

  - Added the required column `packingBoxItemsId` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "packingBoxItemsId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_packingBoxItemsId_fkey" FOREIGN KEY ("packingBoxItemsId") REFERENCES "PackingBoxItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
