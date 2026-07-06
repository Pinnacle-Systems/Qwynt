-- AlterTable
ALTER TABLE "ProductionAllocation" ADD COLUMN     "branchId" INTEGER;

-- CreateTable
CREATE TABLE "ProductionOutward" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "jobCardId" INTEGER NOT NULL,
    "productionAllocationId" INTEGER,
    "supplierId" INTEGER,
    "remarks" TEXT,
    "branchId" INTEGER,

    CONSTRAINT "ProductionOutward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOutwardDtl" (
    "id" SERIAL NOT NULL,
    "productionOutwardId" INTEGER NOT NULL,
    "processId" INTEGER,
    "sentQty" DOUBLE PRECISION,
    "sequence" INTEGER,
    "productionAllocationDtlId" INTEGER,

    CONSTRAINT "ProductionOutwardDtl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_productionAllocationId_fkey" FOREIGN KEY ("productionAllocationId") REFERENCES "ProductionAllocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutward" ADD CONSTRAINT "ProductionOutward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutwardDtl" ADD CONSTRAINT "ProductionOutwardDtl_productionOutwardId_fkey" FOREIGN KEY ("productionOutwardId") REFERENCES "ProductionOutward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutwardDtl" ADD CONSTRAINT "ProductionOutwardDtl_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOutwardDtl" ADD CONSTRAINT "ProductionOutwardDtl_productionAllocationDtlId_fkey" FOREIGN KEY ("productionAllocationDtlId") REFERENCES "ProductionAllocationDtl"("id") ON DELETE SET NULL ON UPDATE CASCADE;
