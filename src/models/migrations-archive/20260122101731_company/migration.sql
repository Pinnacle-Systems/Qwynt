-- AlterTable
ALTER TABLE `termsandconditions` ADD COLUMN `companyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TermsAndConditions` ADD CONSTRAINT `TermsAndConditions_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
