-- AlterTable
ALTER TABLE "ProductionInward" ADD COLUMN     "dcDate" TIMESTAMP(3),
ADD COLUMN     "discountType" TEXT,
ADD COLUMN     "discountValue" DOUBLE PRECISION,
ADD COLUMN     "invNo" TEXT,
ADD COLUMN     "netBillValue" DOUBLE PRECISION,
ADD COLUMN     "receiptType" TEXT,
ADD COLUMN     "taxTemplateId" INTEGER;

-- AlterTable
ALTER TABLE "ProductionInwardDtl" ADD COLUMN     "jobCardId" INTEGER,
ADD COLUMN     "productionOutwardId" INTEGER;

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionInwardDtl" ADD CONSTRAINT "ProductionInwardDtl_productionOutwardId_fkey" FOREIGN KEY ("productionOutwardId") REFERENCES "ProductionOutward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
