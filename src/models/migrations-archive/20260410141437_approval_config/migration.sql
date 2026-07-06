-- CreateTable
CREATE TABLE `ApprovalConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `pageId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `approverType` VARCHAR(191) NULL,
    `approverRoleId` INTEGER NULL,
    `approverUserId` INTEGER NULL,

    UNIQUE INDEX `ApprovalConfig_branchId_pageId_key`(`branchId`, `pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `approvalConfigId` INTEGER NULL,
    `referenceId` INTEGER NOT NULL,
    `referencePage` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NULL,
    `approvedById` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectedById` INTEGER NULL,
    `rejectedAt` DATETIME(3) NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApprovalConfig` ADD CONSTRAINT `ApprovalConfig_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalConfig` ADD CONSTRAINT `ApprovalConfig_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalConfig` ADD CONSTRAINT `ApprovalConfig_approverRoleId_fkey` FOREIGN KEY (`approverRoleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalConfig` ADD CONSTRAINT `ApprovalConfig_approverUserId_fkey` FOREIGN KEY (`approverUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLog` ADD CONSTRAINT `ApprovalLog_approvalConfigId_fkey` FOREIGN KEY (`approvalConfigId`) REFERENCES `ApprovalConfig`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLog` ADD CONSTRAINT `ApprovalLog_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLog` ADD CONSTRAINT `ApprovalLog_rejectedById_fkey` FOREIGN KEY (`rejectedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
