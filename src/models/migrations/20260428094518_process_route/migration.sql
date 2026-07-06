-- CreateTable
CREATE TABLE "ProcessRoute" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,
    "type" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "isFront" BOOLEAN NOT NULL DEFAULT false,
    "isFrontAndBack" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProcessRoute_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProcessRoute" ADD CONSTRAINT "ProcessRoute_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessRoute" ADD CONSTRAINT "ProcessRoute_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
