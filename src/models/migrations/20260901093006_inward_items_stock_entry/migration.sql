-- CreateTable
CREATE TABLE "InwardItemsStockEntry" (
    "id" SERIAL NOT NULL,
    "inwardItemId" INTEGER NOT NULL,
    "stockId" INTEGER NOT NULL,

    CONSTRAINT "InwardItemsStockEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InwardItemsStockEntry" ADD CONSTRAINT "InwardItemsStockEntry_inwardItemId_fkey" FOREIGN KEY ("inwardItemId") REFERENCES "InwardItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItemsStockEntry" ADD CONSTRAINT "InwardItemsStockEntry_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
