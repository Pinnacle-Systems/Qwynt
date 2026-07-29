/*
  Warnings:

  - You are about to drop the column `itemGroupId` on the `PoItems` table. All the data in the column will be lost.
  - You are about to drop the column `styleItemId` on the `PoItems` table. All the data in the column will be lost.
  - Added the required column `itemVariantId` to the `PoItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PoItems" DROP CONSTRAINT "PoItems_itemGroupId_fkey";

-- DropForeignKey
ALTER TABLE "PoItems" DROP CONSTRAINT "PoItems_styleItemId_fkey";

-- AlterTable
ALTER TABLE "PoItems" DROP COLUMN "itemGroupId",
DROP COLUMN "styleItemId",
ADD COLUMN     "itemVariantId" INTEGER NOT NULL,
ADD COLUMN     "printingDesignId" INTEGER;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_itemVariantId_fkey" FOREIGN KEY ("itemVariantId") REFERENCES "ItemVariantMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_printingDesignId_fkey" FOREIGN KEY ("printingDesignId") REFERENCES "PrintingDesign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
