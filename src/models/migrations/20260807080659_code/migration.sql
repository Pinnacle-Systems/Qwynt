/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Color` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `ModelName` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `PrintingDesign` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Size` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Color` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `ModelName` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `PrintingDesign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Size` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Color" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ModelName" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PrintingDesign" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Size" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Color_code_key" ON "Color"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ModelName_code_key" ON "ModelName"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PrintingDesign_code_key" ON "PrintingDesign"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Size_code_key" ON "Size"("code");
