-- AlterTable
ALTER TABLE "Process" ADD COLUMN     "isOutsideJob" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "ProductionAllocation" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "jobCardId" INTEGER NOT NULL,
    "remarks" TEXT,
    "styleItemId" INTEGER,

    CONSTRAINT "ProductionAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionAllocationDtl" (
    "id" SERIAL NOT NULL,
    "productionAllocationId" INTEGER NOT NULL,
    "isInHouse" BOOLEAN NOT NULL DEFAULT false,
    "isOutSide" BOOLEAN NOT NULL DEFAULT false,
    "processId" INTEGER,
    "type" TEXT,
    "sequence" INTEGER,

    CONSTRAINT "ProductionAllocationDtl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocation" ADD CONSTRAINT "ProductionAllocation_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocationDtl" ADD CONSTRAINT "ProductionAllocationDtl_productionAllocationId_fkey" FOREIGN KEY ("productionAllocationId") REFERENCES "ProductionAllocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionAllocationDtl" ADD CONSTRAINT "ProductionAllocationDtl_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
