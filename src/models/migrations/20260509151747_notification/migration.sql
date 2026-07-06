-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "orderItemId" INTEGER;

-- AlterTable
ALTER TABLE "OrderEntry" ADD COLUMN     "validDays" INTEGER,
ADD COLUMN     "validTo" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Machine" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT,
    "userId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "referenceId" INTEGER,
    "referencePage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Machine" ADD CONSTRAINT "Machine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
