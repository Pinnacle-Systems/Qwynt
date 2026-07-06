-- AlterTable
ALTER TABLE `purchasebill` ADD COLUMN `icePrice` DOUBLE NULL,
    ADD COLUMN `labourCharge` DOUBLE NULL,
    ADD COLUMN `ourPrice` DOUBLE NULL,
    ADD COLUMN `packingCharge` DOUBLE NULL,
    ADD COLUMN `tollgate` DOUBLE NULL,
    ADD COLUMN `transport` DOUBLE NULL;
