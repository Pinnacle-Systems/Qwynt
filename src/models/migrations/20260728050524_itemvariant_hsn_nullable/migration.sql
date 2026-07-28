-- DropForeignKey
ALTER TABLE "ItemVariantMaster" DROP CONSTRAINT "ItemVariantMaster_hsnId_fkey";

-- AlterTable
ALTER TABLE "ItemVariantMaster" ALTER COLUMN "hsnId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;
