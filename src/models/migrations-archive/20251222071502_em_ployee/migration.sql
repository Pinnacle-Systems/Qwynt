-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_localCityId_fkey`;

-- AlterTable
ALTER TABLE `employee` MODIFY `email` VARCHAR(191) NULL,
    MODIFY `regNo` VARCHAR(191) NULL,
    MODIFY `chamberNo` VARCHAR(191) NULL,
    MODIFY `joiningDate` DATETIME(3) NULL,
    MODIFY `salaryPerMonth` VARCHAR(191) NULL,
    MODIFY `localCityId` INTEGER NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true,
    MODIFY `permanent` BOOLEAN NULL DEFAULT false,
    MODIFY `canRejoin` BOOLEAN NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_localCityId_fkey` FOREIGN KEY (`localCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
