/*
  Warnings:

  - You are about to drop the column `barCode` on the `InwardItems` table. All the data in the column will be lost.
  - You are about to drop the column `barCode` on the `ItemVariantMasterDetails` table. All the data in the column will be lost.
  - You are about to drop the column `itemGroupId` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `jobCardId` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `styleItemId` on the `Stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_itemGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_productId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_styleItemId_fkey";

-- AlterTable
ALTER TABLE "InwardItems" DROP COLUMN "barCode",
ADD COLUMN     "dcNo" TEXT,
ADD COLUMN     "invNo" TEXT,
ADD COLUMN     "inwardType" TEXT,
ADD COLUMN     "qrCode" TEXT;

-- AlterTable
ALTER TABLE "ItemVariantMasterDetails" DROP COLUMN "barCode",
ADD COLUMN     "qrCode" TEXT;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "itemGroupId",
DROP COLUMN "jobCardId",
DROP COLUMN "productId",
DROP COLUMN "styleItemId",
ADD COLUMN     "itemVariantId" INTEGER,
ADD COLUMN     "printingDesignId" INTEGER,
ADD COLUMN     "qrCode" TEXT;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_itemVariantId_fkey" FOREIGN KEY ("itemVariantId") REFERENCES "ItemVariantMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_printingDesignId_fkey" FOREIGN KEY ("printingDesignId") REFERENCES "PrintingDesign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
