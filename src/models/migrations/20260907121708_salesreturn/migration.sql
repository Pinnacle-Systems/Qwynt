/*
  Warnings:

  - You are about to drop the column `active` on the `SalesReturn` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `SalesReturn` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `SalesReturn` table. All the data in the column will be lost.
  - You are about to drop the column `place` on the `SalesReturn` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `SalesReturn` table. All the data in the column will be lost.
  - You are about to drop the column `salesReturnItemsId` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the `SalesReturnItems` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `docId` on table `SalesReturn` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SalesReturn" DROP CONSTRAINT "SalesReturn_salesBillId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturn" DROP CONSTRAINT "SalesReturn_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturnItems" DROP CONSTRAINT "SalesReturnItems_productId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturnItems" DROP CONSTRAINT "SalesReturnItems_salesBillItemsId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturnItems" DROP CONSTRAINT "SalesReturnItems_salesReturnId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturnItems" DROP CONSTRAINT "SalesReturnItems_uomId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_salesReturnItemsId_fkey";

-- DropIndex
DROP INDEX "Stock_salesReturnItemsId_key";

-- AlterTable
ALTER TABLE "SalesReturn" DROP COLUMN "active",
DROP COLUMN "address",
DROP COLUMN "dueDate",
DROP COLUMN "place",
DROP COLUMN "supplierId",
ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "customerId" INTEGER,
ADD COLUMN     "docDate" TIMESTAMP(3),
ADD COLUMN     "finYearId" INTEGER,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" INTEGER,
ADD COLUMN     "userDate" TIMESTAMP(3),
ALTER COLUMN "docId" SET NOT NULL,
ALTER COLUMN "salesBillId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "salesReturnItemsId",
ADD COLUMN     "salesReturnBoxId" INTEGER,
ADD COLUMN     "salesReturnId" INTEGER;

-- DropTable
DROP TABLE "SalesReturnItems";

-- CreateTable
CREATE TABLE "SalesReturnBox" (
    "id" SERIAL NOT NULL,
    "SalesReturnId" INTEGER NOT NULL,
    "boxId" INTEGER,
    "packingId" INTEGER NOT NULL,

    CONSTRAINT "SalesReturnBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnBoxItems" (
    "id" SERIAL NOT NULL,
    "SalesReturnBoxId" INTEGER NOT NULL,
    "stockId" INTEGER NOT NULL,

    CONSTRAINT "SalesReturnBoxItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesReturnBoxId_fkey" FOREIGN KEY ("salesReturnBoxId") REFERENCES "SalesReturnBox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_salesBillId_fkey" FOREIGN KEY ("salesBillId") REFERENCES "SalesBill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnBox" ADD CONSTRAINT "SalesReturnBox_SalesReturnId_fkey" FOREIGN KEY ("SalesReturnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnBox" ADD CONSTRAINT "SalesReturnBox_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnBox" ADD CONSTRAINT "SalesReturnBox_packingId_fkey" FOREIGN KEY ("packingId") REFERENCES "Packing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnBoxItems" ADD CONSTRAINT "SalesReturnBoxItems_SalesReturnBoxId_fkey" FOREIGN KEY ("SalesReturnBoxId") REFERENCES "SalesReturnBox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnBoxItems" ADD CONSTRAINT "SalesReturnBoxItems_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
