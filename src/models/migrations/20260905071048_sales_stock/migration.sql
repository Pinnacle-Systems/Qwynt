-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "saledBoxId" INTEGER,
ADD COLUMN     "salesDeliveryId" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_saledBoxId_fkey" FOREIGN KEY ("saledBoxId") REFERENCES "SaledBox"("id") ON DELETE SET NULL ON UPDATE CASCADE;
