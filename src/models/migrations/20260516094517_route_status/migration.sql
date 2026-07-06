-- AlterTable
ALTER TABLE "ProcessRoute" ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "ProductionAllocationDtl" ADD COLUMN     "supplierId" INTEGER;

-- AddForeignKey
ALTER TABLE "ProductionAllocationDtl" ADD CONSTRAINT "ProductionAllocationDtl_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;
