-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "isRepeatedJobCard" BOOLEAN DEFAULT false,
ADD COLUMN     "refJobCardId" INTEGER;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_refJobCardId_fkey" FOREIGN KEY ("refJobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
