/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ModelName` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ModelName" ADD COLUMN     "finYearId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "ModelName_name_key" ON "ModelName"("name");

-- AddForeignKey
ALTER TABLE "ModelName" ADD CONSTRAINT "ModelName_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
