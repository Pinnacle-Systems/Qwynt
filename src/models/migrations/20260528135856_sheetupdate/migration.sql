-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "storeId" INTEGER;

-- AlterTable
ALTER TABLE "SalesDelivery" ADD COLUMN     "bankId" INTEGER;

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "jobCardId" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
