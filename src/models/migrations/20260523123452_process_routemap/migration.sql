-- AlterTable
ALTER TABLE "ProductionAllocationDtl" ADD COLUMN     "isFront" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFrontAndBack" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "processRouteId" INTEGER;

-- AddForeignKey
ALTER TABLE "ProductionAllocationDtl" ADD CONSTRAINT "ProductionAllocationDtl_processRouteId_fkey" FOREIGN KEY ("processRouteId") REFERENCES "ProcessRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
