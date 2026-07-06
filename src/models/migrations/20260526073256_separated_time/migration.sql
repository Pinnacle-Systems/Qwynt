-- DropForeignKey
ALTER TABLE "productionempPunch" DROP CONSTRAINT "productionempPunch_processRouteId_fkey";

-- AlterTable
ALTER TABLE "productionempPunch" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ALTER COLUMN "processRouteId" DROP NOT NULL,
ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "startTime" SET DATA TYPE TIME(0),
ALTER COLUMN "endTime" DROP NOT NULL,
ALTER COLUMN "endTime" SET DATA TYPE TIME(0);

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_processRouteId_fkey" FOREIGN KEY ("processRouteId") REFERENCES "ProcessRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
