-- AlterTable
ALTER TABLE "SalesDelivery" ADD COLUMN     "carriageCharge" DOUBLE PRECISION,
ADD COLUMN     "conversionType" TEXT,
ADD COLUMN     "currencyId" INTEGER,
ADD COLUMN     "weightInKg" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SalesDeliveryItems" ADD COLUMN     "trackingType" TEXT;

-- CreateTable
CREATE TABLE "SalesSizeBreakup" (
    "id" SERIAL NOT NULL,
    "salesDeliveryItemId" INTEGER NOT NULL,
    "sizeId" INTEGER,
    "qty" INTEGER,

    CONSTRAINT "SalesSizeBreakup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSizeBreakup" ADD CONSTRAINT "SalesSizeBreakup_salesDeliveryItemId_fkey" FOREIGN KEY ("salesDeliveryItemId") REFERENCES "SalesDeliveryItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesSizeBreakup" ADD CONSTRAINT "SalesSizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
