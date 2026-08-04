/*
  Warnings:

  - A unique constraint covering the columns `[styleNo]` on the table `StyleMaster` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "StyleMaster" ADD COLUMN     "styleNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "StyleMaster_styleNo_key" ON "StyleMaster"("styleNo");
