-- CreateTable
CREATE TABLE `TaxTemplateDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `taxTemplateId` INTEGER NOT NULL,
    `taxTermId` INTEGER NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TaxTemplateDetails` ADD CONSTRAINT `TaxTemplateDetails_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplateDetails` ADD CONSTRAINT `TaxTemplateDetails_taxTermId_fkey` FOREIGN KEY (`taxTermId`) REFERENCES `TaxTerm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
