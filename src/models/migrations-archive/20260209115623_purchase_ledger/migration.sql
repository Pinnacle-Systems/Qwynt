-- CreateTable
CREATE TABLE `PurchaseLedger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseBillEntryId` INTEGER NULL,
    `netBillValue` DOUBLE NULL,
    `supplierId` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `docDate` DATETIME(3) NULL,
    `remarks` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PurchaseLedger` ADD CONSTRAINT `PurchaseLedger_purchaseBillEntryId_fkey` FOREIGN KEY (`purchaseBillEntryId`) REFERENCES `PurchaseBillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseLedger` ADD CONSTRAINT `PurchaseLedger_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
