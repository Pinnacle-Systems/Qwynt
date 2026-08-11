/*
  Warnings:

  - You are about to drop the column `batchNo` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `invNo` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `processName` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `qty` on the `Stock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "batchNo",
DROP COLUMN "invNo",
DROP COLUMN "processName",
DROP COLUMN "qty",
ADD COLUMN     "itemStatus" TEXT,
ADD COLUMN     "poId" INTEGER,
ADD COLUMN     "poItemsId" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poItemsId_fkey" FOREIGN KEY ("poItemsId") REFERENCES "PoItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
