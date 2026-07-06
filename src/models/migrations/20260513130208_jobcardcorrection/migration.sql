-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "blockDate" TIMESTAMP(3),
ADD COLUMN     "labelSizeId" INTEGER;

-- AlterTable
ALTER TABLE "Machine" ADD COLUMN     "sizeId" INTEGER;

-- AlterTable
ALTER TABLE "MachineDetails" ADD COLUMN     "macId" INTEGER;

-- CreateTable
CREATE TABLE "FinishingProcess" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,

    CONSTRAINT "FinishingProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintingDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,

    CONSTRAINT "PrintingDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlateDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "plateName" TEXT,
    "qty" INTEGER,

    CONSTRAINT "PlateDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_labelSizeId_fkey" FOREIGN KEY ("labelSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishingProcess" ADD CONSTRAINT "FinishingProcess_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishingProcess" ADD CONSTRAINT "FinishingProcess_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintingDetails" ADD CONSTRAINT "PrintingDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintingDetails" ADD CONSTRAINT "PrintingDetails_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlateDetails" ADD CONSTRAINT "PlateDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineDetails" ADD CONSTRAINT "MachineDetails_macId_fkey" FOREIGN KEY ("macId") REFERENCES "Machine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
