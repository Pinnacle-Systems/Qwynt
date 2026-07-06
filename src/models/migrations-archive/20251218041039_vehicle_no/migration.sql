-- AlterTable
ALTER TABLE `deliveryinvoice` ADD COLUMN `transportMode` VARCHAR(191) NULL,
    ADD COLUMN `transporter` VARCHAR(191) NULL,
    ADD COLUMN `vehicleNo` VARCHAR(191) NULL;
