-- AlterTable
ALTER TABLE "ProformaInvoice" ADD COLUMN     "bankId" INTEGER,
ADD COLUMN     "carriageCharge" DOUBLE PRECISION,
ADD COLUMN     "deliveryId" INTEGER,
ADD COLUMN     "loadingId" INTEGER;

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER,
    "name" TEXT,
    "accNo" TEXT,
    "ifsc" TEXT,
    "swiftCode" TEXT,
    "branchId" INTEGER,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
