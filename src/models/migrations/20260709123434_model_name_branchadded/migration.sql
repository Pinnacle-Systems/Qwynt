-- DropForeignKey
ALTER TABLE "ModelName" DROP CONSTRAINT "ModelName_companyId_fkey";

-- AlterTable
ALTER TABLE "ModelName" ADD COLUMN     "branchId" INTEGER,
ALTER COLUMN "companyId" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ModelName" ADD CONSTRAINT "ModelName_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelName" ADD CONSTRAINT "ModelName_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
