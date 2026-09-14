/*
  Warnings:

  - The `auditReport` column on the `Stock` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "auditReport",
ADD COLUMN     "auditReport" JSONB[] DEFAULT ARRAY[]::JSONB[];
