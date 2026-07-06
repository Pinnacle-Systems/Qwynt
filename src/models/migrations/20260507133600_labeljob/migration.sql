-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "block" TEXT,
ADD COLUMN     "cutAndSeal" TEXT,
ADD COLUMN     "cuttingSizeId" INTEGER,
ADD COLUMN     "followUpId" INTEGER,
ADD COLUMN     "fullBoardId" INTEGER,
ADD COLUMN     "itemGroupId" INTEGER,
ADD COLUMN     "itemType" TEXT,
ADD COLUMN     "labelQty" INTEGER,
ADD COLUMN     "labelQuality" TEXT,
ADD COLUMN     "productionType" TEXT,
ADD COLUMN     "rollQty" INTEGER,
ADD COLUMN     "styleItemId" INTEGER,
ADD COLUMN     "totalPlatesets" TEXT,
ADD COLUMN     "trackingType" TEXT;

-- CreateTable
CREATE TABLE "JobCardSizeBreakup" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER NOT NULL,
    "sizeId" INTEGER,
    "qty" INTEGER,
    "barcodeFrom" TEXT,
    "barcodeTo" TEXT,

    CONSTRAINT "JobCardSizeBreakup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_fullBoardId_fkey" FOREIGN KEY ("fullBoardId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_cuttingSizeId_fkey" FOREIGN KEY ("cuttingSizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCardSizeBreakup" ADD CONSTRAINT "JobCardSizeBreakup_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCardSizeBreakup" ADD CONSTRAINT "JobCardSizeBreakup_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;
