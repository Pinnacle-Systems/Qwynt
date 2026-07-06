-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_jobCardId_fkey";

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
