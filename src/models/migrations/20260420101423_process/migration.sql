-- CreateTable
CREATE TABLE "Process" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "companyId" INTEGER,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "ProcessGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessGroupList" (
    "id" SERIAL NOT NULL,
    "processGroupId" INTEGER,
    "processId" INTEGER,

    CONSTRAINT "ProcessGroupList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessGroup" ADD CONSTRAINT "ProcessGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessGroupList" ADD CONSTRAINT "ProcessGroupList_processGroupId_fkey" FOREIGN KEY ("processGroupId") REFERENCES "ProcessGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessGroupList" ADD CONSTRAINT "ProcessGroupList_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
