-- AlterTable
ALTER TABLE "OrderEntry" ADD COLUMN     "termsAndCondition" TEXT,
ADD COLUMN     "termsId" INTEGER;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
