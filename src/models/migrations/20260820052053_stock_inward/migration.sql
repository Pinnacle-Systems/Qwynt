-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "PurchaseInwardId" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_PurchaseInwardId_fkey" FOREIGN KEY ("PurchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
