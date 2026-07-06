-- DropForeignKey
ALTER TABLE `partybranch` DROP FOREIGN KEY `PartyBranch_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `partybranch` DROP FOREIGN KEY `PartyBranch_createdById_fkey`;

-- AlterTable
ALTER TABLE `partybranch` MODIFY `active` BOOLEAN NULL DEFAULT true,
    MODIFY `contactMobile` BIGINT NULL DEFAULT 0,
    MODIFY `companyId` INTEGER NULL,
    MODIFY `yarn` BOOLEAN NULL DEFAULT false,
    MODIFY `fabric` BOOLEAN NULL DEFAULT false,
    MODIFY `accessoryGroup` BOOLEAN NULL DEFAULT false,
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NULL,
    MODIFY `createdById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
