-- CreateTable
CREATE TABLE "productionempPunch" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processRouteId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productionempPunch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pushLogs" (
    "id" SERIAL NOT NULL,
    "Userid" INTEGER NOT NULL,
    "pushtime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pushLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserTopushLogs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserTopushLogs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserTopushLogs_B_index" ON "_UserTopushLogs"("B");

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productionempPunch" ADD CONSTRAINT "productionempPunch_processRouteId_fkey" FOREIGN KEY ("processRouteId") REFERENCES "ProcessRoute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTopushLogs" ADD CONSTRAINT "_UserTopushLogs_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserTopushLogs" ADD CONSTRAINT "_UserTopushLogs_B_fkey" FOREIGN KEY ("B") REFERENCES "pushLogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
