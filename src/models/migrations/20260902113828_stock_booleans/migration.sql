-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "isPacked" BOOLEAN DEFAULT false,
ADD COLUMN     "isPurchaseInward" BOOLEAN DEFAULT false,
ADD COLUMN     "isPurchaseOrder" BOOLEAN DEFAULT false,
ADD COLUMN     "isReturned" BOOLEAN DEFAULT false,
ADD COLUMN     "isSaled" BOOLEAN DEFAULT false;
