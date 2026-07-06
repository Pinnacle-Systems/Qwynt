-- AlterTable
ALTER TABLE "ProformaInvoice" ADD COLUMN     "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;
