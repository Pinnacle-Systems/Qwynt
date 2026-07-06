-- CreateTable
CREATE TABLE `PartyBranch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyId` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `aliasName` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `cityId` INTEGER NULL,
    `pincode` INTEGER NULL,
    `panNo` VARCHAR(191) NULL,
    `tinNo` VARCHAR(191) NULL,
    `cstNo` VARCHAR(191) NULL,
    `cstDate` DATE NULL,
    `cinNo` VARCHAR(191) NULL,
    `faxNo` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `contactPersonName` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `costCode` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `contactMobile` BIGINT NOT NULL DEFAULT 0,
    `companyId` INTEGER NOT NULL,
    `yarn` BOOLEAN NOT NULL DEFAULT false,
    `fabric` BOOLEAN NOT NULL DEFAULT false,
    `accessoryGroup` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `isSupplier` BOOLEAN NULL DEFAULT false,
    `isCustomer` BOOLEAN NULL DEFAULT false,
    `landMark` VARCHAR(191) NULL,
    `contact` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `contactPersonEmail` VARCHAR(191) NULL,
    `contactNumber` VARCHAR(191) NULL,
    `alterContactNumber` VARCHAR(191) NULL,
    `bankname` VARCHAR(191) NULL,
    `bankBranchName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,
    `coa` BIGINT NULL,
    `soa` BIGINT NULL,
    `msmeNo` VARCHAR(191) NULL,
    `companyAlterNumber` VARCHAR(191) NULL,
    `partyCode` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branchattachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyBranchId` INTEGER NULL,
    `date` DATETIME(3) NULL,
    `name` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branchattachments` ADD CONSTRAINT `Branchattachments_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
