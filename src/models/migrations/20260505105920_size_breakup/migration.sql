-- AlterTable
ALTER TABLE "OrderEntry" ADD COLUMN     "proFormaId" INTEGER,
ADD COLUMN     "refNo" TEXT;

-- AlterTable
ALTER TABLE "OrderItems" ADD COLUMN     "hsnId" INTEGER,
ADD COLUMN     "itemGroupId" INTEGER,
ADD COLUMN     "sizeTemplateId" INTEGER,
ADD COLUMN     "trackingType" TEXT;

-- CreateTable
CREATE TABLE "OrderSizeBreakup" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "sizeId" INTEGER,
    "qty" INTEGER,
    "barcodeFrom" TEXT,
    "barcodeTo" TEXT,

    CONSTRAINT "OrderSizeBreakup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_proFormaId_fkey" FOREIGN KEY ("proFormaId") REFERENCES "ProformaInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_sizeTemplateId_fkey" FOREIGN KEY ("sizeTemplateId") REFERENCES "SizeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSizeBreakup" ADD CONSTRAINT "OrderSizeBreakup_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSizeBreakup" ADD CONSTRAINT "OrderSizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
