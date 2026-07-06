-- AlterTable
ALTER TABLE "ProductionOutwardDtl" ADD COLUMN     "prevProcessId" INTEGER;

-- CreateTable
CREATE TABLE "ProductionInward" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "productionOutwardId" INTEGER,
    "supplierId" INTEGER,
    "remarks" TEXT,
    "branchId" INTEGER,
    "jobCardId" INTEGER NOT NULL,
    "inwardType" TEXT,

    CONSTRAINT "ProductionInward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionInwardDtl" (
    "id" SERIAL NOT NULL,
    "productionInwardId" INTEGER NOT NULL,
    "outwardDetailId" INTEGER,
    "receivedQty" DOUBLE PRECISION,
    "wastageQty" DOUBLE PRECISION,
    "acceptedQty" DOUBLE PRECISION,
    "processId" INTEGER,
    "price" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,

    CONSTRAINT "ProductionInwardDtl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductionOutwardDtl" ADD CONSTRAINT "ProductionOutwardDtl_prevProcessId_fkey" FOREIGN KEY ("prevProcessId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_productionOutwardId_fkey" FOREIGN KEY ("productionOutwardId") REFERENCES "ProductionOutward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_productionInwardId_fkey" FOREIGN KEY ("productionInwardId") REFERENCES "ProductionInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_outwardDetailId_fkey" FOREIGN KEY ("outwardDetailId") REFERENCES "ProductionOutwardDtl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
