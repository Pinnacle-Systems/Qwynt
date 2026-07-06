-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "colorId" INTEGER;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;
