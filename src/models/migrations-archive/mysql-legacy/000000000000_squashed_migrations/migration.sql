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
    `logo` VARCHAR(191) NULL,

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
    `logo` VARCHAR(191) NULL,
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
    `email` VARCHAR(191) NULL,
    `regNo` VARCHAR(191) NULL,
    `chamberNo` VARCHAR(191) NULL,
    `departmentId` INTEGER NULL,
    `joiningDate` DATETIME(3) NULL,
    `fatherName` VARCHAR(191) NULL,
    `dob` DATETIME(3) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `maritalStatus` ENUM('SINGLE', 'MARRIED', 'SEPARATED') NULL,
    `bloodGroup` ENUM('AP', 'BP', 'AN', 'BN', 'ABP', 'ABN', 'OP', 'ON') NULL,
    `panNo` VARCHAR(191) NULL,
    `consultFee` VARCHAR(191) NULL,
    `salaryPerMonth` VARCHAR(191) NULL,
    `commissionCharges` VARCHAR(191) NULL,
    `mobile` BIGINT NULL,
    `accountNo` VARCHAR(191) NULL,
    `ifscNo` VARCHAR(191) NULL,
    `branchName` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `degree` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `localAddress` VARCHAR(191) NULL,
    `localCityId` INTEGER NULL,
    `localPincode` INTEGER NULL,
    `permAddress` VARCHAR(191) NULL,
    `permCityId` INTEGER NULL,
    `permPincode` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `image` LONGBLOB NULL,
    `branchId` INTEGER NULL,
    `employeeCategoryId` INTEGER NULL,
    `permanent` BOOLEAN NULL DEFAULT false,
    `leavingReason` VARCHAR(191) NULL,
    `leavingDate` DATETIME(3) NULL,
    `canRejoin` BOOLEAN NULL DEFAULT true,
    `rejoinReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `employeeId` VARCHAR(191) NULL,

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
    `aadharNo` VARCHAR(191) NULL,
    `costCode` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `contactMobile` BIGINT NULL DEFAULT 0,
    `companyId` INTEGER NULL,
    `yarn` BOOLEAN NULL DEFAULT false,
    `fabric` BOOLEAN NULL DEFAULT false,
    `accessoryGroup` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `isSupplier` BOOLEAN NULL DEFAULT false,
    `isCustomer` BOOLEAN NULL DEFAULT false,
    `isBranch` BOOLEAN NULL DEFAULT false,
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
    `parentId` VARCHAR(191) NULL,
    `branchTypeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `active` BOOLEAN NULL DEFAULT true,
    `contactMobile` BIGINT NULL DEFAULT 0,
    `companyId` INTEGER NULL,
    `yarn` BOOLEAN NULL DEFAULT false,
    `fabric` BOOLEAN NULL DEFAULT false,
    `accessoryGroup` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
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
CREATE TABLE `attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyId` INTEGER NULL,
    `date` DATETIME(3) NULL,
    `name` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,
    `filePath` VARCHAR(191) NULL,
    `purchaseInwardId` INTEGER NULL,

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
    `selectedDate` DATE NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,
    `netBillValue` DOUBLE NULL,
    `icePrice` DOUBLE NULL,
    `packingCharge` DOUBLE NULL,
    `labourCharge` DOUBLE NULL,
    `tollgate` DOUBLE NULL,
    `transport` DOUBLE NULL,
    `ourPrice` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoBillItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseBillId` INTEGER NULL,
    `box` DOUBLE NULL,
    `productId` INTEGER NOT NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `productBrandId` INTEGER NULL,
    `productCategoryId` INTEGER NULL,

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
    `OpeningStockItemsId` INTEGER NULL,
    `inwardItemsId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `inwardType` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `processName` VARCHAR(191) NULL,
    `storeId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,
    `batchNo` VARCHAR(191) NULL,
    `purchaseReturnItemsId` INTEGER NULL,
    `itemGroupId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `gsmId` INTEGER NULL,

    UNIQUE INDEX `Stock_poBillItemsId_key`(`poBillItemsId`),
    UNIQUE INDEX `Stock_salesBillItemsId_key`(`salesBillItemsId`),
    UNIQUE INDEX `Stock_poReturnItemsId_key`(`poReturnItemsId`),
    UNIQUE INDEX `Stock_salesReturnItemsId_key`(`salesReturnItemsId`),
    UNIQUE INDEX `Stock_OpeningStockItemsId_key`(`OpeningStockItemsId`),
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
    `isOn` BOOLEAN NOT NULL DEFAULT false,
    `price` DOUBLE NULL,
    `netBillValue` INTEGER NULL,
    `selectedDate` DATE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesBillItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `salesBillId` INTEGER NULL,
    `productBrandId` INTEGER NULL,
    `productCategoryId` INTEGER NULL,
    `productId` INTEGER NOT NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `uomId` INTEGER NULL,

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

-- CreateTable
CREATE TABLE `OpeningStock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NULL,
    `address` VARCHAR(191) NULL,
    `place` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATE NOT NULL,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpeningStockItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `OpeningStockId` INTEGER NULL,
    `box` DOUBLE NULL,
    `productId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `stockQty` DOUBLE NULL,
    `stockId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `partyId` INTEGER NOT NULL,
    `isTaxBill` BOOLEAN NOT NULL DEFAULT false,
    `branchId` INTEGER NULL,
    `createdById` INTEGER NOT NULL,
    `updatedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `paymentMode` VARCHAR(191) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `cvv` DATETIME(3) NOT NULL,
    `paidAmount` INTEGER NULL DEFAULT 0,
    `paymentType` VARCHAR(191) NOT NULL,
    `totalBillAmount` INTEGER NULL,
    `discount` INTEGER NULL DEFAULT 0,
    `paymentRefNo` VARCHAR(191) NULL,
    `totalAmount` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Style` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `aliasName` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `sizeTemplateId` INTEGER NULL,
    `itemGroupId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `gsmId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StyleItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `aliasName` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `sizeTemplateId` INTEGER NULL,
    `itemGroupId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `hsnId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryChallan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `supplierId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `deliveryType` VARCHAR(191) NULL,
    `deliveryPartyId` INTEGER NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATETIME(3) NULL,
    `remarks` VARCHAR(191) NULL,
    `vechineNo` VARCHAR(191) NULL,
    `deliveryTo` INTEGER NULL,
    `finYearId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryChallanItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryChallanId` INTEGER NULL,
    `styleId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `noOfBox` VARCHAR(191) NULL,
    `uomId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `isInvoice` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Color` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryInvoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `supplierId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `finYearId` INTEGER NULL,
    `deliveryType` VARCHAR(191) NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATETIME(3) NULL,
    `transportMode` VARCHAR(191) NULL,
    `transporter` VARCHAR(191) NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `termsandcondtions` VARCHAR(191) NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL,
    `taxPercent` DOUBLE NULL,

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
    `price` DOUBLE NULL,
    `deliveryChallanId` INTEGER NULL,
    `invoiceQty` DOUBLE NULL,
    `hsnId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ledger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `EntryType` ENUM('Purchase_Bill', 'Process_Bill', 'Sales', 'My_Payment', 'Customer_Payment', 'Credit_Note', 'Debit_Note', 'Opening_Balance', 'Printing_Job_Work') NULL,
    `LedgerType` ENUM('Supplier', 'Customer') NULL,
    `creditOrDebit` ENUM('Credit', 'Debit') NULL,
    `deliveryInvoiceId` INTEGER NULL,
    `partyId` INTEGER NULL,
    `amount` DOUBLE NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATETIME(3) NULL,
    `partyBillDate` DATE NULL,
    `partyBillNo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Ledger_deliveryInvoiceId_key`(`deliveryInvoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isPoWise` BOOLEAN NOT NULL DEFAULT false,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `companyId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `Hsn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `tax` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `aliasName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpeningBalance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `companyId` INTEGER NULL,
    `branchId` INTEGER NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `finYearId` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `partCategory` VARCHAR(191) NULL,
    `partyId` INTEGER NOT NULL,
    `amount` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Po` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `docDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `poType` VARCHAR(191) NULL,
    `taxTemplateId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `deliveryType` VARCHAR(191) NULL,
    `deliveryToId` INTEGER NULL,
    `deliveryBranchId` INTEGER NULL,
    `termsAndCondtion` VARCHAR(191) NULL,
    `termsId` INTEGER NULL,
    `remarks` VARCHAR(191) NULL,
    `branchId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL,
    `taxPercent` DOUBLE NULL,
    `quoteVersion` INTEGER NOT NULL DEFAULT 1,
    `payTermId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuoteVersion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poId` INTEGER NULL,
    `quoteVersion` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PoItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `poId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `qty` DOUBLE NULL,
    `price` DOUBLE NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL,
    `taxPercent` DOUBLE NULL,
    `quoteVersion` INTEGER NOT NULL DEFAULT 1,
    `itemGroupId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `gsmId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TermsAndConditions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` LONGTEXT NULL,
    `name` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT true,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayTerm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `days` INTEGER NULL,
    `years` INTEGER NULL,
    `months` INTEGER NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `aliasName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseInward` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `supplierId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `vehicleNo` VARCHAR(191) NULL,
    `remarks` LONGTEXT NULL,
    `inwardType` VARCHAR(191) NULL,
    `storeId` INTEGER NULL,
    `locationId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,
    `netBillValue` DOUBLE NULL,
    `taxTemplateId` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL,
    `receiptType` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InwardItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseInwardId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `poQty` DOUBLE NULL,
    `inwardQty` DOUBLE NULL,
    `inwardType` VARCHAR(191) NULL,
    `poId` INTEGER NULL,
    `batchNo` VARCHAR(191) NULL,
    `invNo` VARCHAR(191) NULL,
    `dcNo` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `itemGroupId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL,
    `taxPercent` DOUBLE NULL,
    `gsmId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storeName` VARCHAR(191) NOT NULL,
    `locationId` INTEGER NOT NULL,
    `isFabric` BOOLEAN NOT NULL DEFAULT true,
    `isYarn` BOOLEAN NOT NULL DEFAULT true,
    `isAccessory` BOOLEAN NOT NULL DEFAULT true,
    `isGarments` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseInwardReturn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `dcNo` VARCHAR(191) NULL,
    `dcDate` DATE NULL,
    `supplierId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `termsAndCondition` VARCHAR(191) NULL,
    `termsId` INTEGER NULL,
    `remarks` LONGTEXT NULL,
    `returnType` VARCHAR(191) NULL,
    `storeId` INTEGER NULL,
    `locationId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseReturnItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseInwardReturnId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `poQty` DOUBLE NULL,
    `returnQty` DOUBLE NULL,
    `returnType` VARCHAR(191) NULL,
    `purchaseInwardId` INTEGER NULL,
    `batchNo` VARCHAR(191) NULL,
    `invNo` VARCHAR(191) NULL,
    `itemGroupId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `gsmId` INTEGER NULL,
    `poId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseCancel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `termsAndCondition` VARCHAR(191) NULL,
    `termsId` INTEGER NULL,
    `remarks` LONGTEXT NULL,
    `poType` VARCHAR(191) NULL,
    `storeId` INTEGER NULL,
    `locationId` INTEGER NULL,
    `invNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseCancelItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseCancelId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `cancelQty` DOUBLE NULL,
    `poType` VARCHAR(191) NULL,
    `poId` INTEGER NULL,
    `batchNo` VARCHAR(191) NULL,
    `invNo` VARCHAR(191) NULL,
    `poDocId` VARCHAR(191) NULL,
    `itemGroupId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `gsmId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseBillEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NOT NULL,
    `docDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` INTEGER NULL,
    `updatedById` INTEGER NULL,
    `branchId` INTEGER NULL,
    `finYearId` INTEGER NULL,
    `supplierId` INTEGER NULL,
    `companyId` INTEGER NULL,
    `remarks` LONGTEXT NULL,
    `userId` INTEGER NULL,
    `netBillValue` DOUBLE NULL,
    `billType` VARCHAR(191) NULL,
    `taxTemplateId` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseBillEntryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseBillEntryId` INTEGER NULL,
    `purchaseInwardId` INTEGER NULL,
    `uomId` INTEGER NULL,
    `styleItemId` INTEGER NULL,
    `hsnId` INTEGER NULL,
    `inwardQty` DOUBLE NULL,
    `invNo` VARCHAR(191) NULL,
    `dcNo` VARCHAR(191) NULL,
    `docId` VARCHAR(191) NULL,
    `docDate` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `itemGroupId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `discountType` VARCHAR(191) NULL,
    `discountValue` DOUBLE NULL,
    `taxPercent` DOUBLE NULL,
    `gsmId` INTEGER NULL,
    `poId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseLedger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseBillEntryId` INTEGER NULL,
    `purchaseInwardId` INTEGER NULL,
    `netBillValue` DOUBLE NULL,
    `supplierId` INTEGER NULL,
    `docId` VARCHAR(191) NULL,
    `docDate` DATETIME(3) NULL,
    `remarks` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Size` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gsm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItemGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `companyId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SizeTemplate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `companyId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SizeTemplateList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sizeTemplateId` INTEGER NULL,
    `sizeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `pageId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `approverType` VARCHAR(191) NULL,
    `approverRoleId` INTEGER NULL,
    `approverUserId` INTEGER NULL,

    UNIQUE INDEX `ApprovalConfig_branchId_pageId_key`(`branchId`, `pageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `approvalConfigId` INTEGER NULL,
    `referenceId` INTEGER NOT NULL,
    `referencePage` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NULL,
    `approvedById` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectedById` INTEGER NULL,
    `rejectedAt` DATETIME(3) NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

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
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_localCityId_fkey` FOREIGN KEY (`localCityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `Party` ADD CONSTRAINT `Party_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD CONSTRAINT `Party_branchTypeId_fkey` FOREIGN KEY (`branchTypeId`) REFERENCES `BranchType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_cityId_fkey` FOREIGN KEY (`cityId`) REFERENCES `City`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyBranch` ADD CONSTRAINT `PartyBranch_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Branchattachments` ADD CONSTRAINT `Branchattachments_partyBranchId_fkey` FOREIGN KEY (`partyBranchId`) REFERENCES `PartyBranch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE `PurchaseBill` ADD CONSTRAINT `PurchaseBill_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBill` ADD CONSTRAINT `PurchaseBill_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_purchaseBillId_fkey` FOREIGN KEY (`purchaseBillId`) REFERENCES `PurchaseBill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_productBrandId_fkey` FOREIGN KEY (`productBrandId`) REFERENCES `ProductBrand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoBillItems` ADD CONSTRAINT `PoBillItems_productCategoryId_fkey` FOREIGN KEY (`productCategoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturn` ADD CONSTRAINT `PurchaseReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturn` ADD CONSTRAINT `PurchaseReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_salesBillItemsId_fkey` FOREIGN KEY (`salesBillItemsId`) REFERENCES `SalesBillItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_poReturnItemsId_fkey` FOREIGN KEY (`poReturnItemsId`) REFERENCES `PoReturnItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_salesReturnItemsId_fkey` FOREIGN KEY (`salesReturnItemsId`) REFERENCES `SalesReturnItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_OpeningStockItemsId_fkey` FOREIGN KEY (`OpeningStockItemsId`) REFERENCES `OpeningStockItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_inwardItemsId_fkey` FOREIGN KEY (`inwardItemsId`) REFERENCES `InwardItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_purchaseReturnItemsId_fkey` FOREIGN KEY (`purchaseReturnItemsId`) REFERENCES `PurchaseReturnItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBill` ADD CONSTRAINT `SalesBill_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesBill` ADD CONSTRAINT `SalesBill_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `OpeningStock` ADD CONSTRAINT `OpeningStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStock` ADD CONSTRAINT `OpeningStock_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_OpeningStockId_fkey` FOREIGN KEY (`OpeningStockId`) REFERENCES `OpeningStock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningStockItems` ADD CONSTRAINT `OpeningStockItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Style` ADD CONSTRAINT `Style_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StyleItem` ADD CONSTRAINT `StyleItem_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_deliveryPartyId_fkey` FOREIGN KEY (`deliveryPartyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallan` ADD CONSTRAINT `DeliveryChallan_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_deliveryChallanId_fkey` FOREIGN KEY (`deliveryChallanId`) REFERENCES `DeliveryChallan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChallanItems` ADD CONSTRAINT `DeliveryChallanItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoice` ADD CONSTRAINT `DeliveryInvoice_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_deliveryInvoiceId_fkey` FOREIGN KEY (`deliveryInvoiceId`) REFERENCES `DeliveryInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_deliveryChallanId_fkey` FOREIGN KEY (`deliveryChallanId`) REFERENCES `DeliveryChallan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryInvoiceItems` ADD CONSTRAINT `DeliveryInvoiceItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_deliveryInvoiceId_fkey` FOREIGN KEY (`deliveryInvoiceId`) REFERENCES `DeliveryInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ledger` ADD CONSTRAINT `Ledger_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTerm` ADD CONSTRAINT `TaxTerm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplate` ADD CONSTRAINT `TaxTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplateDetails` ADD CONSTRAINT `TaxTemplateDetails_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaxTemplateDetails` ADD CONSTRAINT `TaxTemplateDetails_taxTermId_fkey` FOREIGN KEY (`taxTermId`) REFERENCES `TaxTerm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpeningBalance` ADD CONSTRAINT `OpeningBalance_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_deliveryToId_fkey` FOREIGN KEY (`deliveryToId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_deliveryBranchId_fkey` FOREIGN KEY (`deliveryBranchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_termsId_fkey` FOREIGN KEY (`termsId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_payTermId_fkey` FOREIGN KEY (`payTermId`) REFERENCES `PayTerm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuoteVersion` ADD CONSTRAINT `QuoteVersion_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PoItems` ADD CONSTRAINT `PoItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TermsAndConditions` ADD CONSTRAINT `TermsAndConditions_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayTerm` ADD CONSTRAINT `PayTerm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInward` ADD CONSTRAINT `PurchaseInward_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardItems` ADD CONSTRAINT `InwardItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_termsId_fkey` FOREIGN KEY (`termsId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseInwardReturn` ADD CONSTRAINT `PurchaseInwardReturn_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_purchaseInwardReturnId_fkey` FOREIGN KEY (`purchaseInwardReturnId`) REFERENCES `PurchaseInwardReturn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseReturnItems` ADD CONSTRAINT `PurchaseReturnItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_termsId_fkey` FOREIGN KEY (`termsId`) REFERENCES `TermsAndConditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancel` ADD CONSTRAINT `PurchaseCancel_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_purchaseCancelId_fkey` FOREIGN KEY (`purchaseCancelId`) REFERENCES `PurchaseCancel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseCancelItems` ADD CONSTRAINT `PurchaseCancelItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntry` ADD CONSTRAINT `PurchaseBillEntry_taxTemplateId_fkey` FOREIGN KEY (`taxTemplateId`) REFERENCES `TaxTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_purchaseBillEntryId_fkey` FOREIGN KEY (`purchaseBillEntryId`) REFERENCES `PurchaseBillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_uomId_fkey` FOREIGN KEY (`uomId`) REFERENCES `Uom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_styleItemId_fkey` FOREIGN KEY (`styleItemId`) REFERENCES `StyleItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_hsnId_fkey` FOREIGN KEY (`hsnId`) REFERENCES `Hsn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_itemGroupId_fkey` FOREIGN KEY (`itemGroupId`) REFERENCES `ItemGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_gsmId_fkey` FOREIGN KEY (`gsmId`) REFERENCES `Gsm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseBillEntryItems` ADD CONSTRAINT `PurchaseBillEntryItems_poId_fkey` FOREIGN KEY (`poId`) REFERENCES `Po`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseLedger` ADD CONSTRAINT `PurchaseLedger_purchaseBillEntryId_fkey` FOREIGN KEY (`purchaseBillEntryId`) REFERENCES `PurchaseBillEntry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseLedger` ADD CONSTRAINT `PurchaseLedger_purchaseInwardId_fkey` FOREIGN KEY (`purchaseInwardId`) REFERENCES `PurchaseInward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseLedger` ADD CONSTRAINT `PurchaseLedger_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Size` ADD CONSTRAINT `Size_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gsm` ADD CONSTRAINT `Gsm_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemGroup` ADD CONSTRAINT `ItemGroup_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplate` ADD CONSTRAINT `SizeTemplate_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplateList` ADD CONSTRAINT `SizeTemplateList_sizeTemplateId_fkey` FOREIGN KEY (`sizeTemplateId`) REFERENCES `SizeTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SizeTemplateList` ADD CONSTRAINT `SizeTemplateList_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalConfig` ADD CONSTRAINT `ApprovalConfig_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalConfig` ADD CONSTRAINT `ApprovalConfig_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalConfig` ADD CONSTRAINT `ApprovalConfig_approverRoleId_fkey` FOREIGN KEY (`approverRoleId`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalConfig` ADD CONSTRAINT `ApprovalConfig_approverUserId_fkey` FOREIGN KEY (`approverUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLog` ADD CONSTRAINT `ApprovalLog_approvalConfigId_fkey` FOREIGN KEY (`approvalConfigId`) REFERENCES `ApprovalConfig`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLog` ADD CONSTRAINT `ApprovalLog_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalLog` ADD CONSTRAINT `ApprovalLog_rejectedById_fkey` FOREIGN KEY (`rejectedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

