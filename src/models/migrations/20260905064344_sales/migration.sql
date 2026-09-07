-- AlterTable
ALTER TABLE "SalesDelivery" ADD COLUMN     "carriageTaxType" TEXT,
ADD COLUMN     "deliveryType" TEXT,
ALTER COLUMN "carriageTax" SET DATA TYPE DOUBLE PRECISION;
