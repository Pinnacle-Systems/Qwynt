-- CreateTable
CREATE TABLE `OpeningBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `finYearId` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `partCategory` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `amount` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
