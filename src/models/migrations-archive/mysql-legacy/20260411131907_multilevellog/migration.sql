-- AlterTable
ALTER TABLE `approvallog` ADD COLUMN `currentLevel` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `ApprovalLevel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `approvalConfigId` INTEGER NULL,
    `levelNo` INTEGER NULL,
    `approveType` VARCHAR(191) NOT NULL DEFAULT 'OR',
    `condition` VARCHAR(191) NULL,

    UNIQUE INDEX `ApprovalLevel_approvalConfigId_levelNo_key`(`approvalConfigId`, `levelNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalLevelUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `approvalLevelId` INTEGER NULL,
    `userId` INTEGER NULL,

    UNIQUE INDEX `ApprovalLevelUser_approvalLevelId_userId_key`(`approvalLevelId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalLevelLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `approvalLogId` INTEGER NULL,
    `approvalLevelId` INTEGER NULL,
    `levelNo` INTEGER NULL,
    `userId` INTEGER NULL,
    `action` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApprovalLevel` ADD CONSTRAINT `ApprovalLevel_approvalConfigId_fkey` FOREIGN KEY (`approvalConfigId`) REFERENCES `ApprovalConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLevelUser` ADD CONSTRAINT `ApprovalLevelUser_approvalLevelId_fkey` FOREIGN KEY (`approvalLevelId`) REFERENCES `ApprovalLevel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLevelUser` ADD CONSTRAINT `ApprovalLevelUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLevelLog` ADD CONSTRAINT `ApprovalLevelLog_approvalLogId_fkey` FOREIGN KEY (`approvalLogId`) REFERENCES `ApprovalLog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLevelLog` ADD CONSTRAINT `ApprovalLevelLog_approvalLevelId_fkey` FOREIGN KEY (`approvalLevelId`) REFERENCES `ApprovalLevel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLevelLog` ADD CONSTRAINT `ApprovalLevelLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
