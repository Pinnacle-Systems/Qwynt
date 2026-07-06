-- DropForeignKey
ALTER TABLE `pobillitems` DROP FOREIGN KEY `PoBillItems_productBrandId_fkey`;

-- DropForeignKey
ALTER TABLE `pobillitems` DROP FOREIGN KEY `PoBillItems_productCategoryId_fkey`;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_productBrandId_fkey` FOREIGN KEY (`productBrandId`) REFERENCES `ProductBrand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_productCategoryId_fkey` FOREIGN KEY (`productCategoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
