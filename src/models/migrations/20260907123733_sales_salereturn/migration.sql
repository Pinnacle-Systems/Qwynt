-- DropForeignKey
ALTER TABLE "SalesReturnBox" DROP CONSTRAINT "SalesReturnBox_packingId_fkey";

-- AlterTable
ALTER TABLE "SalesReturnBox" ADD COLUMN     "saledBoxId" INTEGER,
ALTER COLUMN "packingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SalesReturnBox" ADD CONSTRAINT "SalesReturnBox_saledBoxId_fkey" FOREIGN KEY ("saledBoxId") REFERENCES "SaledBox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnBox" ADD CONSTRAINT "SalesReturnBox_packingId_fkey" FOREIGN KEY ("packingId") REFERENCES "Packing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
