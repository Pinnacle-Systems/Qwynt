/*
  Warnings:

  - You are about to drop the column `batchNo` on the `InwardItems` table. All the data in the column will be lost.
  - You are about to drop the column `dcNo` on the `InwardItems` table. All the data in the column will be lost.
  - You are about to drop the column `invNo` on the `InwardItems` table. All the data in the column will be lost.
  - You are about to drop the column `inwardType` on the `InwardItems` table. All the data in the column will be lost.
  - You are about to drop the column `itemGroupId` on the `InwardItems` table. All the data in the column will be lost.
  - You are about to drop the column `poId` on the `InwardItems` table. All the data in the column will be lost.
  - You are about to drop the column `poQty` on the `InwardItems` table. All the data in the column will be lost.
  - You are about to drop the column `styleItemId` on the `InwardItems` table. All the data in the column will be lost.
  - Added the required column `itemVariantId` to the `InwardItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InwardItems" DROP CONSTRAINT "InwardItems_itemGroupId_fkey";

-- DropForeignKey
ALTER TABLE "InwardItems" DROP CONSTRAINT "InwardItems_poId_fkey";

-- DropForeignKey
ALTER TABLE "InwardItems" DROP CONSTRAINT "InwardItems_styleItemId_fkey";

-- AlterTable
ALTER TABLE "InwardItems" DROP COLUMN "batchNo",
DROP COLUMN "dcNo",
DROP COLUMN "invNo",
DROP COLUMN "inwardType",
DROP COLUMN "itemGroupId",
DROP COLUMN "poId",
DROP COLUMN "poQty",
DROP COLUMN "styleItemId",
ADD COLUMN     "barCode" TEXT,
ADD COLUMN     "itemVariantId" INTEGER NOT NULL,
ADD COLUMN     "printingDesignId" INTEGER;

-- AlterTable
ALTER TABLE "ItemVariantMaster" ADD COLUMN     "gsmId" INTEGER,
ADD COLUMN     "hsnId" INTEGER,
ADD COLUMN     "uomId" INTEGER;

-- AlterTable
ALTER TABLE "ItemVariantMasterDetails" ADD COLUMN     "barCode" TEXT,
ADD COLUMN     "gsmId" INTEGER,
ADD COLUMN     "hsnId" INTEGER,
ADD COLUMN     "uomId" INTEGER;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_itemVariantId_fkey" FOREIGN KEY ("itemVariantId") REFERENCES "ItemVariantMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_printingDesignId_fkey" FOREIGN KEY ("printingDesignId") REFERENCES "PrintingDesign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMasterDetails" ADD CONSTRAINT "ItemVariantMasterDetails_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMasterDetails" ADD CONSTRAINT "ItemVariantMasterDetails_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMasterDetails" ADD CONSTRAINT "ItemVariantMasterDetails_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
