-- AlterTable
ALTER TABLE `po` ADD COLUMN `termsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_termsId_fkey` FOREIGN KEY (`termsId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
