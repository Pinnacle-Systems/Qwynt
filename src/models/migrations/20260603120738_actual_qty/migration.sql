-- AlterTable
ALTER TABLE "ProcessRoute" ADD COLUMN     "actualQty" INTEGER,
ADD COLUMN     "pendingQty" INTEGER,
ADD COLUMN     "wastageQty" INTEGER;
