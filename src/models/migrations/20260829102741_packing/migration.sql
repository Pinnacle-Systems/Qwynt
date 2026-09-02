-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "packingStoreId" INTEGER;

-- CreateTable
CREATE TABLE "Packing" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "userDate" TIMESTAMP(3),
    "companyId" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "supplierId" INTEGER,
    "storeId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "vehicleNo" TEXT,
    "remarks" TEXT,

    CONSTRAINT "Packing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingBoxItems" (
    "id" SERIAL NOT NULL,
    "packingId" INTEGER NOT NULL,
    "boxId" INTEGER NOT NULL,

    CONSTRAINT "PackingBoxItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingItems" (
    "id" SERIAL NOT NULL,
    "packingBoxItemsId" INTEGER NOT NULL,
    "stockId" INTEGER NOT NULL,

    CONSTRAINT "PackingItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_packingStoreId_fkey" FOREIGN KEY ("packingStoreId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Packing" ADD CONSTRAINT "Packing_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingBoxItems" ADD CONSTRAINT "PackingBoxItems_packingId_fkey" FOREIGN KEY ("packingId") REFERENCES "Packing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingBoxItems" ADD CONSTRAINT "PackingBoxItems_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItems" ADD CONSTRAINT "PackingItems_packingBoxItemsId_fkey" FOREIGN KEY ("packingBoxItemsId") REFERENCES "PackingBoxItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItems" ADD CONSTRAINT "PackingItems_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
