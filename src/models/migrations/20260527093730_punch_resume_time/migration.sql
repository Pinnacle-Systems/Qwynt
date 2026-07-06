-- AlterTable
ALTER TABLE "pushLogs" ADD COLUMN     "resumetime" TIMESTAMP(3),
ALTER COLUMN "pushtime" DROP NOT NULL;
