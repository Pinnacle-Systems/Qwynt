-- AlterTable
ALTER TABLE `party` ADD COLUMN `branchTypeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_branchTypeId_fkey` FOREIGN KEY (`branchTypeId`) REFERENCES `BranchType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
