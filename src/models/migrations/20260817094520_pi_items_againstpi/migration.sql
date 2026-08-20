-- AlterTable
ALTER TABLE "InwardItems" ADD COLUMN     "batchNo" TEXT,
ADD COLUMN     "poId" INTEGER,
ADD COLUMN     "poItemsId" INTEGER,
ADD COLUMN     "poQty" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PurchaseInward" ADD COLUMN     "finYearId" INTEGER,
ADD COLUMN     "poId" INTEGER;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_poItemsId_fkey" FOREIGN KEY ("poItemsId") REFERENCES "PoItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;
