-- CreateTable
CREATE TABLE `Page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `link` VARCHAR(191) NULL,
    `type` ENUM('Masters', 'Transactions', 'Reports', 'AdminAccess') NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `pageGroupId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Company` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `gstNo` VARCHAR(191) NULL,
    `panNo` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactMobile` BIGINT NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Company_companyId_key`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` INTEGER NOT NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `expireAt` DATETIME(3) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `maxUsers` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchName` VARCHAR(191) NOT NULL,
    `branchCode` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,
    `contactMobile` BIGINT NOT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL DEFAULT '',
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `idPrefix` VARCHAR(191) NULL,
    `idSequence` VARCHAR(191) NULL,
    `tempPrefix` VARCHAR(191) NULL,
    `tempSequence` VARCHAR(191) NULL,
    `prefixCategory` ENUM('Default', 'Specific') NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserOnBranch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `defaultRole` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Role_companyId_name_key`(`companyId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleOnPage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roleId` INTEGER NOT NULL,
    `pageId` INTEGER NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `create` BOOLEAN NOT NULL DEFAULT false,
    `edit` BOOLEAN NOT NULL DEFAULT false,
    `delete` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `RoleOnPage_roleId_pageId_key`(`roleId`, `pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `roleId` INTEGER NULL,
    `otp` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `employeeId` INTEGER NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `regNo` VARCHAR(191) NOT NULL,
    `chamberNo` VARCHAR(191) NOT NULL,
    `departmentId` INTEGER NULL,
    `joiningDate` DATETIME(3) NOT NULL,
    `fatherName` VARCHAR(191) NULL,
    `dob` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `maritalStatus` ENUM('SINGLE', 'MARRIED', 'SEPARATED') NULL,
    `bloodGroup` ENUM('AP', 'BP', 'AN', 'BN', 'ABP', 'ABN', 'OP', 'ON') NULL,
    `panNo` VARCHAR(191) NULL,
    `consultFee` VARCHAR(191) NULL,
    `salaryPerMonth` VARCHAR(191) NOT NULL,
    `commissionCharges` VARCHAR(191) NULL,
    `mobile` BIGINT NULL,
    `accountNo` VARCHAR(191) NULL,
    `ifscNo` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `degree` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `localAddress` VARCHAR(191) NULL,
    `localCityId` INTEGER NOT NULL,
    `localPincode` INTEGER NULL,
    `permAddress` VARCHAR(191) NULL,
    `permCityId` INTEGER NULL,
    `permPincode` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `image` LONGBLOB NULL,
    `branchId` INTEGER NULL,
    `employeeCategoryId` INTEGER NULL,
    `permanent` BOOLEAN NOT NULL DEFAULT false,
    `leavingReason` VARCHAR(191) NULL,
    `leavingDate` DATETIME(3) NULL,
    `canRejoin` BOOLEAN NOT NULL DEFAULT true,
    `rejoinReason` VARCHAR(191) NULL,

    UNIQUE INDEX `Employee_email_key`(`email`),
    UNIQUE INDEX `Employee_regNo_key`(`regNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinYear` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` DATETIME(3) NOT NULL,
    `to` DATETIME(3) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeeCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `branchId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `defaultCategory` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Country` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `State` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `gstNo` VARCHAR(191) NOT NULL,
    `countryId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `stateId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('Masters', 'Transactions', 'Reports', 'AdminAccess') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Party` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
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

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductBrand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,

    UNIQUE INDEX `ProductBrand_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,

    UNIQUE INDEX `ProductCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Uom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,

    UNIQUE INDEX `Uom_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductUomPriceDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `uomId` INTEGER NULL,
    `productId` INTEGER NOT NULL,
    `poBillItemsId` INTEGER NULL,
    `poReturnItemsId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `productBrandId` INTEGER NULL,
    `productCategoryId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `price` DOUBLE NULL DEFAULT 0,
    `uomId` INTEGER NULL,

    UNIQUE INDEX `Product_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseBill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NULL,
    `supplierDcNo` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `address` VARCHAR(191) NULL,
    `place` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATE NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `netBillValue` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoBillItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseBillId` INTEGER NULL,
    `productBrandId` INTEGER NULL,
    `productCategoryId` INTEGER NULL,
    `productId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `uomId` INTEGER NULL,
    `stockQty` DOUBLE NULL,
    `salePrice` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `address` VARCHAR(191) NULL,
    `place` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATE NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `purchaseBillId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseReturnId` INTEGER NULL,
    `productId` INTEGER NULL,
    `purchaseBillItemsId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `poQty` DOUBLE NULL,
    `uomId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inOrOut` ENUM('In', 'Out') NULL,
    `productId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `poBillItemsId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `salesBillItemsId` INTEGER NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `poReturnItemsId` INTEGER NULL,
    `salesReturnItemsId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `salePrice` DOUBLE NULL,

    UNIQUE INDEX `Stock_poBillItemsId_key`(`poBillItemsId`),
    UNIQUE INDEX `Stock_salesBillItemsId_key`(`salesBillItemsId`),
    UNIQUE INDEX `Stock_poReturnItemsId_key`(`poReturnItemsId`),
    UNIQUE INDEX `Stock_salesReturnItemsId_key`(`salesReturnItemsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesBill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `address` VARCHAR(191) NULL,
    `place` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATE NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `contactMobile` BIGINT NULL,
    `name` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesBillItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salesBillId` INTEGER NULL,
    `productBrandId` INTEGER NULL,
    `productCategoryId` INTEGER NULL,
    `productId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `uomId` INTEGER NULL,
    `salePrice` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `address` VARCHAR(191) NULL,
    `place` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATE NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `salesBillId` INTEGER NOT NULL,
    `uomId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salesReturnId` INTEGER NULL,
    `productId` INTEGER NULL,
    `salesBillItemsId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `salesQty` DOUBLE NULL,
    `uomId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_pageGroupId_fkey` FOREIGN KEY (`pageGroupId`) REFERENCES `PageGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnBranch` ADD CONSTRAINT `UserOnBranch_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnBranch` ADD CONSTRAINT `UserOnBranch_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleOnPage` ADD CONSTRAINT `RoleOnPage_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleOnPage` ADD CONSTRAINT `RoleOnPage_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_localCityId_fkey` FOREIGN KEY (`localCityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_permCityId_fkey` FOREIGN KEY (`permCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_employeeCategoryId_fkey` FOREIGN KEY (`employeeCategoryId`) REFERENCES `EmployeeCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinYear` ADD CONSTRAINT `FinYear_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeeCategory` ADD CONSTRAINT `EmployeeCategory_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Country` ADD CONSTRAINT `Country_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `State` ADD CONSTRAINT `State_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `Country`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `City` ADD CONSTRAINT `City_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `State`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyCategory` ADD CONSTRAINT `PartyCategory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductBrand` ADD CONSTRAINT `ProductBrand_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Uom` ADD CONSTRAINT `Uom_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductUomPriceDetails` ADD CONSTRAINT `ProductUomPriceDetails_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductUomPriceDetails` ADD CONSTRAINT `ProductUomPriceDetails_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductUomPriceDetails` ADD CONSTRAINT `ProductUomPriceDetails_poBillItemsId_fkey` FOREIGN KEY (`poBillItemsId`) REFERENCES `PoBillItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_productBrandId_fkey` FOREIGN KEY (`productBrandId`) REFERENCES `ProductBrand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_productCategoryId_fkey` FOREIGN KEY (`productCategoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBill` ADD CONSTRAINT `PurchaseBill_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBill` ADD CONSTRAINT `PurchaseBill_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_purchaseBillId_fkey` FOREIGN KEY (`purchaseBillId`) REFERENCES `PurchaseBill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_productBrandId_fkey` FOREIGN KEY (`productBrandId`) REFERENCES `ProductBrand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_productCategoryId_fkey` FOREIGN KEY (`productCategoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturn` ADD CONSTRAINT `PurchaseReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturn` ADD CONSTRAINT `PurchaseReturn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturn` ADD CONSTRAINT `PurchaseReturn_purchaseBillId_fkey` FOREIGN KEY (`purchaseBillId`) REFERENCES `PurchaseBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoReturnItems` ADD CONSTRAINT `PoReturnItems_purchaseReturnId_fkey` FOREIGN KEY (`purchaseReturnId`) REFERENCES `PurchaseReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoReturnItems` ADD CONSTRAINT `PoReturnItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoReturnItems` ADD CONSTRAINT `PoReturnItems_purchaseBillItemsId_fkey` FOREIGN KEY (`purchaseBillItemsId`) REFERENCES `PoBillItems`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoReturnItems` ADD CONSTRAINT `PoReturnItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_poBillItemsId_fkey` FOREIGN KEY (`poBillItemsId`) REFERENCES `PoBillItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_salesBillItemsId_fkey` FOREIGN KEY (`salesBillItemsId`) REFERENCES `SalesBillItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_poReturnItemsId_fkey` FOREIGN KEY (`poReturnItemsId`) REFERENCES `PoReturnItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_salesReturnItemsId_fkey` FOREIGN KEY (`salesReturnItemsId`) REFERENCES `SalesReturnItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBill` ADD CONSTRAINT `SalesBill_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBill` ADD CONSTRAINT `SalesBill_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBillItems` ADD CONSTRAINT `SalesBillItems_salesBillId_fkey` FOREIGN KEY (`salesBillId`) REFERENCES `SalesBill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBillItems` ADD CONSTRAINT `SalesBillItems_productBrandId_fkey` FOREIGN KEY (`productBrandId`) REFERENCES `ProductBrand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBillItems` ADD CONSTRAINT `SalesBillItems_productCategoryId_fkey` FOREIGN KEY (`productCategoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBillItems` ADD CONSTRAINT `SalesBillItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBillItems` ADD CONSTRAINT `SalesBillItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_salesBillId_fkey` FOREIGN KEY (`salesBillId`) REFERENCES `SalesBill`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_salesReturnId_fkey` FOREIGN KEY (`salesReturnId`) REFERENCES `SalesReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_salesBillItemsId_fkey` FOREIGN KEY (`salesBillItemsId`) REFERENCES `SalesBillItems`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturnItems` ADD CONSTRAINT `SalesReturnItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
