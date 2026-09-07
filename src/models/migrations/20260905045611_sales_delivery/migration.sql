/*
  Warnings:

  - You are about to drop the column `deliveryType` on the `SalesDelivery` table. All the data in the column will be lost.
  - You are about to drop the `SalesDeliveryItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesSizeBreakup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SalesDelivery" DROP CONSTRAINT "SalesDelivery_taxTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "SalesDeliveryItems" DROP CONSTRAINT "SalesDeliveryItems_hsnId_fkey";

-- DropForeignKey
ALTER TABLE "SalesDeliveryItems" DROP CONSTRAINT "SalesDeliveryItems_salesDeliveryId_fkey";

-- DropForeignKey
ALTER TABLE "SalesDeliveryItems" DROP CONSTRAINT "SalesDeliveryItems_styleItemId_fkey";

-- DropForeignKey
ALTER TABLE "SalesDeliveryItems" DROP CONSTRAINT "SalesDeliveryItems_uomId_fkey";

-- DropForeignKey
ALTER TABLE "SalesSizeBreakup" DROP CONSTRAINT "SalesSizeBreakup_salesDeliveryItemId_fkey";

-- DropForeignKey
ALTER TABLE "SalesSizeBreakup" DROP CONSTRAINT "SalesSizeBreakup_sizeId_fkey";

-- AlterTable
ALTER TABLE "SalesDelivery" DROP COLUMN "deliveryType",
ADD COLUMN     "carriageTax" INTEGER,
ADD COLUMN     "finYearId" INTEGER,
ADD COLUMN     "userDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "SalesDeliveryItems";

-- DropTable
DROP TABLE "SalesSizeBreakup";

-- CreateTable
CREATE TABLE "SaledBox" (
    "id" SERIAL NOT NULL,
    "salesDeliveryId" INTEGER NOT NULL,
    "boxId" INTEGER,
    "packingBoxItemsId" INTEGER,

    CONSTRAINT "SaledBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaledItems" (
    "id" SERIAL NOT NULL,
    "saledBoxId" INTEGER NOT NULL,
    "stockId" INTEGER,
    "itemVariantId" INTEGER,
    "styleId" INTEGER,
    "hsnId" INTEGER,
    "printingDesignId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "uomId" INTEGER,
    "wholeSalePrice" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,

    CONSTRAINT "SaledItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledBox" ADD CONSTRAINT "SaledBox_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledBox" ADD CONSTRAINT "SaledBox_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledBox" ADD CONSTRAINT "SaledBox_packingBoxItemsId_fkey" FOREIGN KEY ("packingBoxItemsId") REFERENCES "PackingBoxItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledItems" ADD CONSTRAINT "SaledItems_saledBoxId_fkey" FOREIGN KEY ("saledBoxId") REFERENCES "SaledBox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledItems" ADD CONSTRAINT "SaledItems_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledItems" ADD CONSTRAINT "SaledItems_itemVariantId_fkey" FOREIGN KEY ("itemVariantId") REFERENCES "ItemVariantMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledItems" ADD CONSTRAINT "SaledItems_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "StyleMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledItems" ADD CONSTRAINT "SaledItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledItems" ADD CONSTRAINT "SaledItems_printingDesignId_fkey" FOREIGN KEY ("printingDesignId") REFERENCES "PrintingDesign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledItems" ADD CONSTRAINT "SaledItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledItems" ADD CONSTRAINT "SaledItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaledItems" ADD CONSTRAINT "SaledItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
