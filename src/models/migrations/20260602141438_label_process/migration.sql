-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "labelItemId" INTEGER;

-- CreateTable
CREATE TABLE "LabelPrintingDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,

    CONSTRAINT "LabelPrintingDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_labelItemId_fkey" FOREIGN KEY ("labelItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelPrintingDetails" ADD CONSTRAINT "LabelPrintingDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelPrintingDetails" ADD CONSTRAINT "LabelPrintingDetails_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
