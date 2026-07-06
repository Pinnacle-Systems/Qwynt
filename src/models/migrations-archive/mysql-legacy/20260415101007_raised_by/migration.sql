-- AlterTable
ALTER TABLE `approvallog` ADD COLUMN `isRead` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `raisedById` INTEGER NULL,
    ADD COLUMN `referenceDocId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ApprovalLog` ADD CONSTRAINT `ApprovalLog_raisedById_fkey` FOREIGN KEY (`raisedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
