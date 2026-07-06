/*
  Warnings:

  - Added the required column `productionlog` to the `pushLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pushLogs" ADD COLUMN     "productionlog" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "pushLogs" ADD CONSTRAINT "pushLogs_productionlog_fkey" FOREIGN KEY ("productionlog") REFERENCES "productionempPunch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
