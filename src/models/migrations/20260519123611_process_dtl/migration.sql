-- DropForeignKey
ALTER TABLE "ProductionInward" DROP CONSTRAINT "ProductionInward_jobCardId_fkey";

-- AlterTable
ALTER TABLE "ProductionInward" ALTER COLUMN "jobCardId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "InwardProcessDtl" (
    "id" SERIAL NOT NULL,
    "productionInwardDtlId" INTEGER NOT NULL,
    "processId" INTEGER,

    CONSTRAINT "InwardProcessDtl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductionInward" ADD CONSTRAINT "ProductionInward_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardProcessDtl" ADD CONSTRAINT "InwardProcessDtl_productionInwardDtlId_fkey" FOREIGN KEY ("productionInwardDtlId") REFERENCES "ProductionInwardDtl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardProcessDtl" ADD CONSTRAINT "InwardProcessDtl_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
