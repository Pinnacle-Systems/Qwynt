-- DropForeignKey
ALTER TABLE "StyleMaster" DROP CONSTRAINT "StyleMaster_modelId_fkey";

-- AddForeignKey
ALTER TABLE "StyleMaster" ADD CONSTRAINT "StyleMaster_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "ModelName"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
