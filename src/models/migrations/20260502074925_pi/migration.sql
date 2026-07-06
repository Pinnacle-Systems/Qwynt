-- AlterTable
ALTER TABLE "ProformaInvoice" ADD COLUMN     "currencyId" INTEGER,
ADD COLUMN     "validityTo" TIMESTAMP(3),
ADD COLUMN     "weightInKg" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProformaInvoiceItem" ADD COLUMN     "dozen" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "symbol" TEXT,
    "isBaseCurrency" BOOLEAN NOT NULL DEFAULT false,
    "exchangeRate" DOUBLE PRECISION,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProformaInvoice" ADD CONSTRAINT "ProformaInvoice_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
