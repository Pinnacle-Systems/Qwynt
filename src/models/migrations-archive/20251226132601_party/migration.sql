-- AlterTable
ALTER TABLE `party` ADD COLUMN `accountNumber` VARCHAR(191) NULL,
    ADD COLUMN `alterContactNumber` VARCHAR(191) NULL,
    ADD COLUMN `bankBranchName` VARCHAR(191) NULL,
    ADD COLUMN `bankname` VARCHAR(191) NULL,
    ADD COLUMN `contact` INTEGER NULL,
    ADD COLUMN `contactNumber` VARCHAR(191) NULL,
    ADD COLUMN `contactPersonEmail` VARCHAR(191) NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `ifscCode` VARCHAR(191) NULL,
    ADD COLUMN `landMark` VARCHAR(191) NULL;
