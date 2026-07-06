-- AlterTable
ALTER TABLE "BoardQuality" ADD COLUMN     "fullBoardId" INTEGER,
ADD COLUMN     "gsmId" INTEGER,
ADD COLUMN     "noOfSheets" INTEGER;

-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "splitType" TEXT;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_fullBoardId_fkey" FOREIGN KEY ("fullBoardId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
