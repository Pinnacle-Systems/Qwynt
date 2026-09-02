/*
  Warnings:

  - You are about to drop the column `code` on the `Box` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[docId]` on the table `Box` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `docId` to the `Box` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeId` to the `Box` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Box_code_key";

-- AlterTable
ALTER TABLE "Box" DROP COLUMN "code",
ADD COLUMN     "docDate" TIMESTAMP(3),
ADD COLUMN     "docId" TEXT NOT NULL,
ADD COLUMN     "sizeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "BoxStyleItems" (
    "id" SERIAL NOT NULL,
    "boxId" INTEGER NOT NULL,
    "styleId" INTEGER NOT NULL,
    "mrpPrice" DOUBLE PRECISION,

    CONSTRAINT "BoxStyleItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Box_docId_key" ON "Box"("docId");

-- AddForeignKey
ALTER TABLE "Box" ADD CONSTRAINT "Box_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxStyleItems" ADD CONSTRAINT "BoxStyleItems_boxId_fkey" FOREIGN KEY ("boxId") REFERENCES "Box"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoxStyleItems" ADD CONSTRAINT "BoxStyleItems_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "StyleMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
