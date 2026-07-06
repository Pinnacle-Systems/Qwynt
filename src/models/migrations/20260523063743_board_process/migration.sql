-- AlterTable
ALTER TABLE "BoardQuality" ADD COLUMN     "processId" INTEGER;

-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "otherBoardId" INTEGER;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_otherBoardId_fkey" FOREIGN KEY ("otherBoardId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
