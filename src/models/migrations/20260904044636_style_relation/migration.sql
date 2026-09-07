-- AlterTable
ALTER TABLE "InwardItems" ADD COLUMN     "styleMasterId" INTEGER;

-- AlterTable
ALTER TABLE "PoItems" ADD COLUMN     "styleMasterId" INTEGER;

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "styleMasterId" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_styleMasterId_fkey" FOREIGN KEY ("styleMasterId") REFERENCES "StyleMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_styleMasterId_fkey" FOREIGN KEY ("styleMasterId") REFERENCES "StyleMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_styleMasterId_fkey" FOREIGN KEY ("styleMasterId") REFERENCES "StyleMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
