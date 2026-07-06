-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plate" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Plate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Die" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Die_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCard" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "orderEntryId" INTEGER,
    "orderType" TEXT,
    "orderQty" INTEGER,
    "customerId" INTEGER,
    "gsmId" INTEGER,
    "boardId" INTEGER,
    "fullBoard" INTEGER,
    "noOfPockets" INTEGER,
    "cuttingSize" TEXT,
    "runningQty" INTEGER,
    "isFourColor" BOOLEAN DEFAULT false,
    "isCutColor" BOOLEAN DEFAULT false,
    "isFront" BOOLEAN DEFAULT false,
    "isFrontAndBack" BOOLEAN DEFAULT false,
    "isCMYK" BOOLEAN DEFAULT false,
    "isCutColMachine" BOOLEAN DEFAULT false,
    "isFrontMachine" BOOLEAN DEFAULT false,
    "isFrontBackMachine" BOOLEAN DEFAULT false,
    "plateId" INTEGER,
    "dieId" INTEGER,
    "totalPlateSet" INTEGER,
    "remarks" TEXT,
    "designerId" INTEGER,
    "tagCardUps" TEXT,
    "jobRunTime" TEXT,

    CONSTRAINT "JobCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardQuality" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "boardId" INTEGER,

    CONSTRAINT "BoardQuality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "processId" INTEGER,

    CONSTRAINT "ProcessDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaminationDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "laminationId" INTEGER,
    "isFrontAndBack" BOOLEAN DEFAULT false,
    "isFront" BOOLEAN DEFAULT false,

    CONSTRAINT "LaminationDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarnishDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "varnishId" INTEGER,
    "isFrontAndBack" BOOLEAN DEFAULT false,
    "isFront" BOOLEAN DEFAULT false,

    CONSTRAINT "VarnishDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineDetails" (
    "id" SERIAL NOT NULL,
    "jobCardId" INTEGER,
    "machineId" INTEGER,

    CONSTRAINT "MachineDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plate" ADD CONSTRAINT "Plate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Die" ADD CONSTRAINT "Die_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_orderEntryId_fkey" FOREIGN KEY ("orderEntryId") REFERENCES "OrderEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_plateId_fkey" FOREIGN KEY ("plateId") REFERENCES "Plate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_dieId_fkey" FOREIGN KEY ("dieId") REFERENCES "Die"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCard" ADD CONSTRAINT "JobCard_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardQuality" ADD CONSTRAINT "BoardQuality_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessDetails" ADD CONSTRAINT "ProcessDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessDetails" ADD CONSTRAINT "ProcessDetails_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaminationDetails" ADD CONSTRAINT "LaminationDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaminationDetails" ADD CONSTRAINT "LaminationDetails_laminationId_fkey" FOREIGN KEY ("laminationId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarnishDetails" ADD CONSTRAINT "VarnishDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarnishDetails" ADD CONSTRAINT "VarnishDetails_varnishId_fkey" FOREIGN KEY ("varnishId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineDetails" ADD CONSTRAINT "MachineDetails_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineDetails" ADD CONSTRAINT "MachineDetails_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
