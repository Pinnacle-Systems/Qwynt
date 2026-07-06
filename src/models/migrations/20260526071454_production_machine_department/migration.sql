/*
  Warnings:

  - You are about to drop the `_UserTopushLogs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `Machineid` to the `productionempPunch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Userid` to the `productionempPunch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentid` to the `productionempPunch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_UserTopushLogs" DROP CONSTRAINT "_UserTopushLogs_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserTopushLogs" DROP CONSTRAINT "_UserTopushLogs_B_fkey";

-- AlterTable
ALTER TABLE "productionempPunch" ADD COLUMN     "Machineid" INTEGER NOT NULL,
ADD COLUMN     "Userid" INTEGER NOT NULL,
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "departmentid" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_UserTopushLogs";

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_departmentid_fkey" FOREIGN KEY ("departmentid") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_Machineid_fkey" FOREIGN KEY ("Machineid") REFERENCES "Machine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pushLogs" ADD CONSTRAINT "pushLogs_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
