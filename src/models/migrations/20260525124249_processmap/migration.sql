-- AlterTable
ALTER TABLE "Process" ADD COLUMN     "departmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
