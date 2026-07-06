-- DropForeignKey
ALTER TABLE `party` DROP FOREIGN KEY `Party_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `party` DROP FOREIGN KEY `Party_createdById_fkey`;

-- AlterTable
ALTER TABLE `party` MODIFY `active` BOOLEAN NULL DEFAULT true,
    MODIFY `contactMobile` BIGINT NULL DEFAULT 0,
    MODIFY `companyId` INTEGER NULL,
    MODIFY `yarn` BOOLEAN NULL DEFAULT false,
    MODIFY `fabric` BOOLEAN NULL DEFAULT false,
    MODIFY `accessoryGroup` BOOLEAN NULL DEFAULT false,
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NULL,
    MODIFY `createdById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
