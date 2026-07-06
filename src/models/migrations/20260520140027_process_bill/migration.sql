-- CreateTable
CREATE TABLE "ProcessBill" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "supplierId" INTEGER,
    "remarks" TEXT,
    "branchId" INTEGER,
    "netBillValue" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxTemplateId" INTEGER,

    CONSTRAINT "ProcessBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessBillDtl" (
    "id" SERIAL NOT NULL,
    "processBilldId" INTEGER NOT NULL,
    "acceptedQty" DOUBLE PRECISION,
    "billedQty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "jobCardId" INTEGER,
    "productionInwardId" INTEGER,

    CONSTRAINT "ProcessBillDtl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingProcess" (
    "id" SERIAL NOT NULL,
    "processBillDtlId" INTEGER NOT NULL,
    "processId" INTEGER,

    CONSTRAINT "BillingProcess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBill" ADD CONSTRAINT "ProcessBill_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBillDtl" ADD CONSTRAINT "ProcessBillDtl_processBilldId_fkey" FOREIGN KEY ("processBilldId") REFERENCES "ProcessBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBillDtl" ADD CONSTRAINT "ProcessBillDtl_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessBillDtl" ADD CONSTRAINT "ProcessBillDtl_productionInwardId_fkey" FOREIGN KEY ("productionInwardId") REFERENCES "ProductionInward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProcess" ADD CONSTRAINT "BillingProcess_processBillDtlId_fkey" FOREIGN KEY ("processBillDtlId") REFERENCES "ProcessBillDtl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProcess" ADD CONSTRAINT "BillingProcess_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
