-- CreateTable
CREATE TABLE "ItemVariantMaster" (
    "id" SERIAL NOT NULL,
    "styleId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ItemVariantMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemVariantMasterDetails" (
    "id" SERIAL NOT NULL,
    "itemVariantMasterId" INTEGER NOT NULL,
    "printingDesignId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "price" INTEGER,

    CONSTRAINT "ItemVariantMasterDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "StyleMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMaster" ADD CONSTRAINT "ItemVariantMaster_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMasterDetails" ADD CONSTRAINT "ItemVariantMasterDetails_itemVariantMasterId_fkey" FOREIGN KEY ("itemVariantMasterId") REFERENCES "ItemVariantMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMasterDetails" ADD CONSTRAINT "ItemVariantMasterDetails_printingDesignId_fkey" FOREIGN KEY ("printingDesignId") REFERENCES "PrintingDesign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMasterDetails" ADD CONSTRAINT "ItemVariantMasterDetails_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVariantMasterDetails" ADD CONSTRAINT "ItemVariantMasterDetails_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;
