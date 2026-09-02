-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_OpeningStockItemsId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_PurchaseInwardId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_inwardItemsId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_packingBoxItemsId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_poBillItemsId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_poId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_poItemsId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_poReturnItemsId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_purchaseReturnItemsId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_salesBillItemsId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_salesReturnItemsId_fkey";

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "packingId" INTEGER;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poItemsId_fkey" FOREIGN KEY ("poItemsId") REFERENCES "PoItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_inwardItemsId_fkey" FOREIGN KEY ("inwardItemsId") REFERENCES "InwardItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_PurchaseInwardId_fkey" FOREIGN KEY ("PurchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poBillItemsId_fkey" FOREIGN KEY ("poBillItemsId") REFERENCES "PoBillItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesBillItemsId_fkey" FOREIGN KEY ("salesBillItemsId") REFERENCES "SalesBillItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poReturnItemsId_fkey" FOREIGN KEY ("poReturnItemsId") REFERENCES "PoReturnItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesReturnItemsId_fkey" FOREIGN KEY ("salesReturnItemsId") REFERENCES "SalesReturnItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_OpeningStockItemsId_fkey" FOREIGN KEY ("OpeningStockItemsId") REFERENCES "OpeningStockItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_purchaseReturnItemsId_fkey" FOREIGN KEY ("purchaseReturnItemsId") REFERENCES "PurchaseReturnItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_packingId_fkey" FOREIGN KEY ("packingId") REFERENCES "Packing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_packingBoxItemsId_fkey" FOREIGN KEY ("packingBoxItemsId") REFERENCES "PackingBoxItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;
