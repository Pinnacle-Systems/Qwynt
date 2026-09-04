/*
  Warnings:

  - You are about to drop the column `styleMasterId` on the `InwardItems` table. All the data in the column will be lost.
  - You are about to drop the column `styleMasterId` on the `PoItems` table. All the data in the column will be lost.
  - You are about to drop the column `styleMasterId` on the `Stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InwardItems" DROP CONSTRAINT "InwardItems_styleMasterId_fkey";

-- DropForeignKey
ALTER TABLE "PoItems" DROP CONSTRAINT "PoItems_styleMasterId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_styleMasterId_fkey";

-- AlterTable
ALTER TABLE "InwardItems" DROP COLUMN "styleMasterId",
ADD COLUMN     "styleId" INTEGER;

-- AlterTable
ALTER TABLE "PoItems" DROP COLUMN "styleMasterId",
ADD COLUMN     "styleId" INTEGER;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "styleMasterId",
ADD COLUMN     "styleId" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "StyleMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "StyleMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "StyleMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
