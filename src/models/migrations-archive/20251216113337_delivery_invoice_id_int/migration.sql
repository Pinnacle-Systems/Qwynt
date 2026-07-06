-- CreateTable
CREATE TABLE `DeliveryInvoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `deliveryType` VARCHAR(191) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryInvoiceItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryInvoiceId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `noOfBox` VARCHAR(191) NULL,
    `uomId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `deliveryChallanItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ledger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `EntryType` ENUM('Purchase_Bill', 'Process_Bill', 'Sales', 'My_Payment', 'Customer_Payment', 'Credit_Note', 'Debit_Note', 'Opening_Balance', 'Printing_Job_Work') NOT NULL,
    `LedgerType` ENUM('Supplier', 'Customer') NULL,
    `creditOrDebit` ENUM('Credit', 'Debit') NULL,
    `deliveryInvoiceId` INTEGER NULL,
    `partyId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `dcNo` VARCHAR(191) NULL,
    `partyBillDate` DATE NULL,
    `partyBillNo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Ledger_deliveryInvoiceId_key`(`deliveryInvoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_deliveryInvoiceId_fkey` FOREIGN KEY (`deliveryInvoiceId`) REFERENCES `DeliveryInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_deliveryChallanItemsId_fkey` FOREIGN KEY (`deliveryChallanItemsId`) REFERENCES `DeliveryChallanItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_deliveryInvoiceId_fkey` FOREIGN KEY (`deliveryInvoiceId`) REFERENCES `DeliveryInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
