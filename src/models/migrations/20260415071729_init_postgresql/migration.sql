-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('Masters', 'Transactions', 'Reports', 'AdminAccess');

-- CreateEnum
CREATE TYPE "PrefixCategory" AS ENUM ('Default', 'Specific');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('AP', 'BP', 'AN', 'BN', 'ABP', 'ABN', 'OP', 'ON');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "StockInOrOut" AS ENUM ('In', 'Out');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('Purchase_Bill', 'Process_Bill', 'Sales', 'My_Payment', 'Customer_Payment', 'Credit_Note', 'Debit_Note', 'Opening_Balance', 'Printing_Job_Work');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('Supplier', 'Customer');

-- CreateEnum
CREATE TYPE "Credit_Debit" AS ENUM ('Credit', 'Debit');

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT,
    "type" "PageType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "pageGroupId" INTEGER,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "gstNo" TEXT,
    "panNo" TEXT,
    "contactName" TEXT,
    "contactMobile" BIGINT NOT NULL,
    "contactEmail" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "logo" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "maxUsers" INTEGER NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "branchName" TEXT NOT NULL,
    "branchCode" TEXT,
    "contactName" TEXT,
    "contactMobile" BIGINT NOT NULL,
    "contactEmail" TEXT,
    "address" TEXT DEFAULT '',
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "idPrefix" TEXT,
    "idSequence" TEXT,
    "tempPrefix" TEXT,
    "tempSequence" TEXT,
    "logo" TEXT,
    "prefixCategory" "PrefixCategory",

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnBranch" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserOnBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "defaultRole" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleOnPage" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "create" BOOLEAN NOT NULL DEFAULT false,
    "edit" BOOLEAN NOT NULL DEFAULT false,
    "delete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoleOnPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "roleId" INTEGER,
    "otp" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "employeeId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "regNo" TEXT,
    "chamberNo" TEXT,
    "departmentId" INTEGER,
    "joiningDate" TIMESTAMP(3),
    "fatherName" TEXT,
    "dob" TIMESTAMP(3),
    "gender" "Gender",
    "maritalStatus" "MaritalStatus",
    "bloodGroup" "BloodGroup",
    "panNo" TEXT,
    "consultFee" TEXT,
    "salaryPerMonth" TEXT,
    "commissionCharges" TEXT,
    "mobile" BIGINT,
    "accountNo" TEXT,
    "ifscNo" TEXT,
    "branchName" TEXT,
    "bankName" TEXT,
    "degree" TEXT,
    "specialization" TEXT,
    "localAddress" TEXT,
    "localCityId" INTEGER,
    "localPincode" INTEGER,
    "permAddress" TEXT,
    "permCityId" INTEGER,
    "permPincode" INTEGER,
    "active" BOOLEAN DEFAULT true,
    "image" BYTEA,
    "branchId" INTEGER,
    "employeeCategoryId" INTEGER,
    "permanent" BOOLEAN DEFAULT false,
    "leavingReason" TEXT,
    "leavingDate" TIMESTAMP(3),
    "canRejoin" BOOLEAN DEFAULT true,
    "rejoinReason" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "employeeId" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinYear" (
    "id" SERIAL NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FinYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "branchId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "defaultCategory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmployeeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "gstNo" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stateId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageGroup" (
    "id" SERIAL NOT NULL,
    "type" "PageType" NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PageGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PartyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "aliasName" TEXT,
    "displayName" TEXT,
    "address" TEXT,
    "cityId" INTEGER,
    "pincode" INTEGER,
    "panNo" TEXT,
    "tinNo" TEXT,
    "cstNo" TEXT,
    "cstDate" DATE,
    "cinNo" TEXT,
    "faxNo" TEXT,
    "email" TEXT,
    "website" TEXT,
    "contactPersonName" TEXT,
    "gstNo" TEXT,
    "aadharNo" TEXT,
    "costCode" TEXT,
    "active" BOOLEAN DEFAULT true,
    "contactMobile" BIGINT DEFAULT 0,
    "companyId" INTEGER,
    "yarn" BOOLEAN DEFAULT false,
    "fabric" BOOLEAN DEFAULT false,
    "accessoryGroup" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "isSupplier" BOOLEAN DEFAULT false,
    "isCustomer" BOOLEAN DEFAULT false,
    "isBranch" BOOLEAN DEFAULT false,
    "landMark" TEXT,
    "contact" TEXT,
    "designation" TEXT,
    "department" TEXT,
    "contactPersonEmail" TEXT,
    "contactNumber" TEXT,
    "alterContactNumber" TEXT,
    "bankname" TEXT,
    "bankBranchName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "coa" BIGINT,
    "soa" BIGINT,
    "msmeNo" TEXT,
    "companyAlterNumber" TEXT,
    "partyCode" TEXT,
    "parentId" TEXT,
    "branchTypeId" INTEGER,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyBranch" (
    "id" SERIAL NOT NULL,
    "partyId" INTEGER,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "aliasName" TEXT,
    "displayName" TEXT,
    "address" TEXT,
    "cityId" INTEGER,
    "pincode" INTEGER,
    "panNo" TEXT,
    "tinNo" TEXT,
    "cstNo" TEXT,
    "cstDate" DATE,
    "cinNo" TEXT,
    "faxNo" TEXT,
    "email" TEXT,
    "website" TEXT,
    "contactPersonName" TEXT,
    "gstNo" TEXT,
    "costCode" TEXT,
    "active" BOOLEAN DEFAULT true,
    "contactMobile" BIGINT DEFAULT 0,
    "companyId" INTEGER,
    "yarn" BOOLEAN DEFAULT false,
    "fabric" BOOLEAN DEFAULT false,
    "accessoryGroup" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "isSupplier" BOOLEAN DEFAULT false,
    "isCustomer" BOOLEAN DEFAULT false,
    "landMark" TEXT,
    "contact" TEXT,
    "designation" TEXT,
    "department" TEXT,
    "contactPersonEmail" TEXT,
    "contactNumber" TEXT,
    "alterContactNumber" TEXT,
    "bankname" TEXT,
    "bankBranchName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "coa" BIGINT,
    "soa" BIGINT,
    "msmeNo" TEXT,
    "companyAlterNumber" TEXT,
    "partyCode" TEXT,

    CONSTRAINT "PartyBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "partyId" INTEGER,
    "date" TIMESTAMP(3),
    "name" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,
    "purchaseInwardId" INTEGER,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branchattachments" (
    "id" SERIAL NOT NULL,
    "partyBranchId" INTEGER,
    "date" TIMESTAMP(3),
    "name" TEXT,
    "fileName" TEXT,
    "filePath" TEXT,

    CONSTRAINT "Branchattachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductBrand" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "code" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "ProductBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Uom" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Uom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductUomPriceDetails" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "uomId" INTEGER,
    "productId" INTEGER NOT NULL,
    "poBillItemsId" INTEGER,
    "poReturnItemsId" INTEGER,

    CONSTRAINT "ProductUomPriceDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "code" TEXT,
    "productBrandId" INTEGER,
    "productCategoryId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "price" DOUBLE PRECISION DEFAULT 0,
    "uomId" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseBill" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER,
    "supplierDcNo" TEXT,
    "branchId" INTEGER,
    "address" TEXT,
    "place" TEXT,
    "docId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATE NOT NULL,
    "selectedDate" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "netBillValue" DOUBLE PRECISION,
    "icePrice" DOUBLE PRECISION,
    "packingCharge" DOUBLE PRECISION,
    "labourCharge" DOUBLE PRECISION,
    "tollgate" DOUBLE PRECISION,
    "transport" DOUBLE PRECISION,
    "ourPrice" DOUBLE PRECISION,

    CONSTRAINT "PurchaseBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoBillItems" (
    "id" SERIAL NOT NULL,
    "purchaseBillId" INTEGER,
    "box" DOUBLE PRECISION,
    "productId" INTEGER NOT NULL,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "stockQty" DOUBLE PRECISION,
    "productBrandId" INTEGER,
    "productCategoryId" INTEGER,

    CONSTRAINT "PoBillItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReturn" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER,
    "branchId" INTEGER,
    "address" TEXT,
    "place" TEXT,
    "docId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATE,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,
    "purchaseBillId" INTEGER NOT NULL,

    CONSTRAINT "PurchaseReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoReturnItems" (
    "id" SERIAL NOT NULL,
    "purchaseReturnId" INTEGER,
    "productId" INTEGER,
    "purchaseBillItemsId" INTEGER,
    "qty" DOUBLE PRECISION,
    "stockQty" DOUBLE PRECISION,
    "poQty" DOUBLE PRECISION,
    "uomId" INTEGER,

    CONSTRAINT "PoReturnItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" SERIAL NOT NULL,
    "inOrOut" "StockInOrOut",
    "productId" INTEGER,
    "qty" DOUBLE PRECISION,
    "poBillItemsId" INTEGER,
    "branchId" INTEGER,
    "salesBillItemsId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "poReturnItemsId" INTEGER,
    "salesReturnItemsId" INTEGER,
    "OpeningStockItemsId" INTEGER,
    "inwardItemsId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "inwardType" TEXT,
    "updatedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "processName" TEXT,
    "storeId" INTEGER,
    "invNo" TEXT,
    "batchNo" TEXT,
    "purchaseReturnItemsId" INTEGER,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "gsmId" INTEGER,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesBill" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER,
    "branchId" INTEGER,
    "address" TEXT,
    "place" TEXT,
    "docId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "contactMobile" BIGINT,
    "name" TEXT,
    "isOn" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION,
    "netBillValue" INTEGER,
    "selectedDate" DATE,

    CONSTRAINT "SalesBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesBillItems" (
    "id" SERIAL NOT NULL,
    "salesBillId" INTEGER,
    "productBrandId" INTEGER,
    "productCategoryId" INTEGER,
    "productId" INTEGER NOT NULL,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "stockQty" DOUBLE PRECISION,
    "uomId" INTEGER,

    CONSTRAINT "SalesBillItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturn" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER,
    "branchId" INTEGER,
    "address" TEXT,
    "place" TEXT,
    "docId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,
    "salesBillId" INTEGER NOT NULL,
    "uomId" INTEGER,

    CONSTRAINT "SalesReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnItems" (
    "id" SERIAL NOT NULL,
    "salesReturnId" INTEGER,
    "productId" INTEGER,
    "salesBillItemsId" INTEGER,
    "qty" DOUBLE PRECISION,
    "stockQty" DOUBLE PRECISION,
    "salesQty" DOUBLE PRECISION,
    "uomId" INTEGER,

    CONSTRAINT "SalesReturnItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningStock" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER,
    "address" TEXT,
    "place" TEXT,
    "docId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATE NOT NULL,
    "companyId" INTEGER,

    CONSTRAINT "OpeningStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningStockItems" (
    "id" SERIAL NOT NULL,
    "OpeningStockId" INTEGER,
    "box" DOUBLE PRECISION,
    "productId" INTEGER,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "stockQty" DOUBLE PRECISION,
    "stockId" INTEGER,

    CONSTRAINT "OpeningStockItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "partyId" INTEGER NOT NULL,
    "isTaxBill" BOOLEAN NOT NULL DEFAULT false,
    "branchId" INTEGER,
    "createdById" INTEGER NOT NULL,
    "updatedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "cvv" TIMESTAMP(3) NOT NULL,
    "paidAmount" INTEGER DEFAULT 0,
    "paymentType" TEXT NOT NULL,
    "totalBillAmount" INTEGER,
    "discount" INTEGER DEFAULT 0,
    "paymentRefNo" TEXT,
    "totalAmount" INTEGER,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Style" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "aliasName" TEXT,
    "code" TEXT,
    "active" BOOLEAN DEFAULT false,
    "sizeTemplateId" INTEGER,
    "itemGroupId" INTEGER,
    "uomId" INTEGER,
    "gsmId" INTEGER,

    CONSTRAINT "Style_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StyleItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "aliasName" TEXT,
    "code" TEXT,
    "active" BOOLEAN DEFAULT false,
    "sizeTemplateId" INTEGER,
    "itemGroupId" INTEGER,
    "uomId" INTEGER,
    "gsmId" INTEGER,
    "hsnId" INTEGER,

    CONSTRAINT "StyleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryChallan" (
    "id" SERIAL NOT NULL,
    "docId" TEXT,
    "active" BOOLEAN DEFAULT false,
    "supplierId" INTEGER,
    "branchId" INTEGER,
    "deliveryType" TEXT,
    "deliveryPartyId" INTEGER,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dcNo" TEXT,
    "dcDate" TIMESTAMP(3),
    "remarks" TEXT,
    "vechineNo" TEXT,
    "deliveryTo" INTEGER,
    "finYearId" INTEGER,

    CONSTRAINT "DeliveryChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryChallanItems" (
    "id" SERIAL NOT NULL,
    "deliveryChallanId" INTEGER,
    "styleId" INTEGER,
    "styleItemId" INTEGER,
    "noOfBox" TEXT,
    "uomId" INTEGER,
    "colorId" INTEGER,
    "hsnId" INTEGER,
    "qty" DOUBLE PRECISION,
    "active" BOOLEAN DEFAULT false,
    "isInvoice" BOOLEAN DEFAULT false,

    CONSTRAINT "DeliveryChallanItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryInvoice" (
    "id" SERIAL NOT NULL,
    "docId" TEXT,
    "supplierId" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "deliveryType" TEXT,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dcNo" TEXT,
    "dcDate" TIMESTAMP(3),
    "transportMode" TEXT,
    "transporter" TEXT,
    "vehicleNo" TEXT,
    "remarks" TEXT,
    "termsandcondtions" TEXT,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,

    CONSTRAINT "DeliveryInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryInvoiceItems" (
    "id" SERIAL NOT NULL,
    "deliveryInvoiceId" INTEGER,
    "styleId" INTEGER,
    "styleItemId" INTEGER,
    "noOfBox" TEXT,
    "uomId" INTEGER,
    "colorId" INTEGER,
    "qty" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "deliveryChallanItemsId" INTEGER,
    "price" DOUBLE PRECISION,
    "deliveryChallanId" INTEGER,
    "invoiceQty" DOUBLE PRECISION,
    "hsnId" INTEGER,

    CONSTRAINT "DeliveryInvoiceItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" SERIAL NOT NULL,
    "EntryType" "LedgerEntryType",
    "LedgerType" "LedgerType",
    "creditOrDebit" "Credit_Debit",
    "deliveryInvoiceId" INTEGER,
    "partyId" INTEGER,
    "amount" DOUBLE PRECISION,
    "dcNo" TEXT,
    "dcDate" TIMESTAMP(3),
    "partyBillDate" DATE,
    "partyBillNo" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxTerm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isPoWise" BOOLEAN NOT NULL DEFAULT false,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaxTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaxTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxTemplateDetails" (
    "id" SERIAL NOT NULL,
    "taxTemplateId" INTEGER NOT NULL,
    "taxTermId" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "value" TEXT,
    "amount" TEXT,

    CONSTRAINT "TaxTemplateDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hsn" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "tax" TEXT,

    CONSTRAINT "Hsn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchType" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "active" BOOLEAN DEFAULT false,
    "aliasName" TEXT,

    CONSTRAINT "BranchType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningBalance" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "companyId" INTEGER,
    "branchId" INTEGER,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "finYearId" INTEGER,
    "docId" TEXT,
    "date" TIMESTAMP(3),
    "partCategory" TEXT,
    "partyId" INTEGER NOT NULL,
    "amount" INTEGER,

    CONSTRAINT "OpeningBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Po" (
    "id" SERIAL NOT NULL,
    "docId" TEXT,
    "docDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "poType" TEXT,
    "taxTemplateId" INTEGER,
    "active" BOOLEAN DEFAULT true,
    "deliveryType" TEXT,
    "deliveryToId" INTEGER,
    "deliveryBranchId" INTEGER,
    "termsAndCondtion" TEXT,
    "termsId" INTEGER,
    "remarks" TEXT,
    "branchId" INTEGER,
    "supplierId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,
    "payTermId" INTEGER,

    CONSTRAINT "Po_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteVersion" (
    "id" SERIAL NOT NULL,
    "poId" INTEGER,
    "quoteVersion" INTEGER,

    CONSTRAINT "QuoteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoItems" (
    "id" SERIAL NOT NULL,
    "poId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "gsmId" INTEGER,

    CONSTRAINT "PoItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermsAndConditions" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "name" TEXT,
    "active" BOOLEAN DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "TermsAndConditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayTerm" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "days" INTEGER,
    "years" INTEGER,
    "months" INTEGER,
    "companyId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "aliasName" TEXT,

    CONSTRAINT "PayTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseInward" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "dcNo" TEXT,
    "dcDate" DATE,
    "supplierId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "vehicleNo" TEXT,
    "remarks" TEXT,
    "inwardType" TEXT,
    "storeId" INTEGER,
    "locationId" INTEGER,
    "invNo" TEXT,
    "netBillValue" DOUBLE PRECISION,
    "taxTemplateId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "receiptType" TEXT,

    CONSTRAINT "PurchaseInward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InwardItems" (
    "id" SERIAL NOT NULL,
    "purchaseInwardId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "poQty" DOUBLE PRECISION,
    "inwardQty" DOUBLE PRECISION,
    "inwardType" TEXT,
    "poId" INTEGER,
    "batchNo" TEXT,
    "invNo" TEXT,
    "dcNo" TEXT,
    "price" DOUBLE PRECISION,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "gsmId" INTEGER,

    CONSTRAINT "InwardItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "storeName" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "isFabric" BOOLEAN NOT NULL DEFAULT true,
    "isYarn" BOOLEAN NOT NULL DEFAULT true,
    "isAccessory" BOOLEAN NOT NULL DEFAULT true,
    "isGarments" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseInwardReturn" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "dcNo" TEXT,
    "dcDate" DATE,
    "supplierId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "remarks" TEXT,
    "returnType" TEXT,
    "storeId" INTEGER,
    "locationId" INTEGER,
    "invNo" TEXT,

    CONSTRAINT "PurchaseInwardReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReturnItems" (
    "id" SERIAL NOT NULL,
    "purchaseInwardReturnId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "poQty" DOUBLE PRECISION,
    "returnQty" DOUBLE PRECISION,
    "returnType" TEXT,
    "purchaseInwardId" INTEGER,
    "batchNo" TEXT,
    "invNo" TEXT,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "gsmId" INTEGER,
    "poId" INTEGER,

    CONSTRAINT "PurchaseReturnItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseCancel" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "supplierId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "remarks" TEXT,
    "poType" TEXT,
    "storeId" INTEGER,
    "locationId" INTEGER,
    "invNo" TEXT,

    CONSTRAINT "PurchaseCancel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseCancelItems" (
    "id" SERIAL NOT NULL,
    "purchaseCancelId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "cancelQty" DOUBLE PRECISION,
    "poType" TEXT,
    "poId" INTEGER,
    "batchNo" TEXT,
    "invNo" TEXT,
    "poDocId" TEXT,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "gsmId" INTEGER,

    CONSTRAINT "PurchaseCancelItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseBillEntry" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "supplierId" INTEGER,
    "companyId" INTEGER,
    "remarks" TEXT,
    "userId" INTEGER,
    "netBillValue" DOUBLE PRECISION,
    "billType" TEXT,
    "taxTemplateId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,

    CONSTRAINT "PurchaseBillEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseBillEntryItems" (
    "id" SERIAL NOT NULL,
    "purchaseBillEntryId" INTEGER,
    "purchaseInwardId" INTEGER,
    "uomId" INTEGER,
    "styleItemId" INTEGER,
    "hsnId" INTEGER,
    "inwardQty" DOUBLE PRECISION,
    "invNo" TEXT,
    "dcNo" TEXT,
    "docId" TEXT,
    "docDate" TEXT,
    "price" DOUBLE PRECISION,
    "itemGroupId" INTEGER,
    "sizeId" INTEGER,
    "colorId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "gsmId" INTEGER,
    "poId" INTEGER,

    CONSTRAINT "PurchaseBillEntryItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseLedger" (
    "id" SERIAL NOT NULL,
    "purchaseBillEntryId" INTEGER,
    "purchaseInwardId" INTEGER,
    "netBillValue" DOUBLE PRECISION,
    "supplierId" INTEGER,
    "docId" TEXT,
    "docDate" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "PurchaseLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Size" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gsm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "Gsm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER,

    CONSTRAINT "ItemGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "companyId" INTEGER,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "SizeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SizeTemplateList" (
    "id" SERIAL NOT NULL,
    "sizeTemplateId" INTEGER,
    "sizeId" INTEGER,

    CONSTRAINT "SizeTemplateList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalConfig" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "pageId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "approverType" TEXT,
    "approverRoleId" INTEGER,
    "approverUserId" INTEGER,

    CONSTRAINT "ApprovalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLevel" (
    "id" SERIAL NOT NULL,
    "approvalConfigId" INTEGER,
    "levelNo" INTEGER,
    "approveType" TEXT NOT NULL DEFAULT 'OR',
    "condition" TEXT,

    CONSTRAINT "ApprovalLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLevelUser" (
    "id" SERIAL NOT NULL,
    "approvalLevelId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "ApprovalLevelUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLog" (
    "id" SERIAL NOT NULL,
    "approvalConfigId" INTEGER,
    "referenceId" INTEGER NOT NULL,
    "referencePage" TEXT NOT NULL,
    "status" TEXT,
    "approvedById" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "rejectedById" INTEGER,
    "rejectedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLevelLog" (
    "id" SERIAL NOT NULL,
    "approvalLogId" INTEGER,
    "approvalLevelId" INTEGER,
    "levelNo" INTEGER,
    "userId" INTEGER,
    "action" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalLevelLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyId_key" ON "Company"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_companyId_name_key" ON "Role"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RoleOnPage_roleId_pageId_key" ON "RoleOnPage"("roleId", "pageId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_regNo_key" ON "Employee"("regNo");

-- CreateIndex
CREATE UNIQUE INDEX "ProductBrand_name_key" ON "ProductBrand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Uom_name_key" ON "Uom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_poBillItemsId_key" ON "Stock"("poBillItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_salesBillItemsId_key" ON "Stock"("salesBillItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_poReturnItemsId_key" ON "Stock"("poReturnItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_salesReturnItemsId_key" ON "Stock"("salesReturnItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_OpeningStockItemsId_key" ON "Stock"("OpeningStockItemsId");

-- CreateIndex
CREATE UNIQUE INDEX "Ledger_deliveryInvoiceId_key" ON "Ledger"("deliveryInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalConfig_branchId_pageId_key" ON "ApprovalConfig"("branchId", "pageId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalLevel_approvalConfigId_levelNo_key" ON "ApprovalLevel"("approvalConfigId", "levelNo");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalLevelUser_approvalLevelId_userId_key" ON "ApprovalLevelUser"("approvalLevelId", "userId");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_pageGroupId_fkey" FOREIGN KEY ("pageGroupId") REFERENCES "PageGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBranch" ADD CONSTRAINT "UserOnBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBranch" ADD CONSTRAINT "UserOnBranch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnPage" ADD CONSTRAINT "RoleOnPage_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnPage" ADD CONSTRAINT "RoleOnPage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_localCityId_fkey" FOREIGN KEY ("localCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_permCityId_fkey" FOREIGN KEY ("permCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_employeeCategoryId_fkey" FOREIGN KEY ("employeeCategoryId") REFERENCES "EmployeeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinYear" ADD CONSTRAINT "FinYear_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCategory" ADD CONSTRAINT "EmployeeCategory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "State" ADD CONSTRAINT "State_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyCategory" ADD CONSTRAINT "PartyCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_branchTypeId_fkey" FOREIGN KEY ("branchTypeId") REFERENCES "BranchType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyBranch" ADD CONSTRAINT "PartyBranch_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branchattachments" ADD CONSTRAINT "Branchattachments_partyBranchId_fkey" FOREIGN KEY ("partyBranchId") REFERENCES "PartyBranch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBrand" ADD CONSTRAINT "ProductBrand_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Uom" ADD CONSTRAINT "Uom_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUomPriceDetails" ADD CONSTRAINT "ProductUomPriceDetails_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUomPriceDetails" ADD CONSTRAINT "ProductUomPriceDetails_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUomPriceDetails" ADD CONSTRAINT "ProductUomPriceDetails_poBillItemsId_fkey" FOREIGN KEY ("poBillItemsId") REFERENCES "PoBillItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productBrandId_fkey" FOREIGN KEY ("productBrandId") REFERENCES "ProductBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBill" ADD CONSTRAINT "PurchaseBill_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBill" ADD CONSTRAINT "PurchaseBill_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBill" ADD CONSTRAINT "PurchaseBill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoBillItems" ADD CONSTRAINT "PoBillItems_purchaseBillId_fkey" FOREIGN KEY ("purchaseBillId") REFERENCES "PurchaseBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoBillItems" ADD CONSTRAINT "PoBillItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoBillItems" ADD CONSTRAINT "PoBillItems_productBrandId_fkey" FOREIGN KEY ("productBrandId") REFERENCES "ProductBrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoBillItems" ADD CONSTRAINT "PoBillItems_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturn" ADD CONSTRAINT "PurchaseReturn_purchaseBillId_fkey" FOREIGN KEY ("purchaseBillId") REFERENCES "PurchaseBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoReturnItems" ADD CONSTRAINT "PoReturnItems_purchaseReturnId_fkey" FOREIGN KEY ("purchaseReturnId") REFERENCES "PurchaseReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoReturnItems" ADD CONSTRAINT "PoReturnItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoReturnItems" ADD CONSTRAINT "PoReturnItems_purchaseBillItemsId_fkey" FOREIGN KEY ("purchaseBillItemsId") REFERENCES "PoBillItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoReturnItems" ADD CONSTRAINT "PoReturnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poBillItemsId_fkey" FOREIGN KEY ("poBillItemsId") REFERENCES "PoBillItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesBillItemsId_fkey" FOREIGN KEY ("salesBillItemsId") REFERENCES "SalesBillItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_poReturnItemsId_fkey" FOREIGN KEY ("poReturnItemsId") REFERENCES "PoReturnItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_salesReturnItemsId_fkey" FOREIGN KEY ("salesReturnItemsId") REFERENCES "SalesReturnItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_OpeningStockItemsId_fkey" FOREIGN KEY ("OpeningStockItemsId") REFERENCES "OpeningStockItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_inwardItemsId_fkey" FOREIGN KEY ("inwardItemsId") REFERENCES "InwardItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_purchaseReturnItemsId_fkey" FOREIGN KEY ("purchaseReturnItemsId") REFERENCES "PurchaseReturnItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBill" ADD CONSTRAINT "SalesBill_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBill" ADD CONSTRAINT "SalesBill_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBill" ADD CONSTRAINT "SalesBill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_salesBillId_fkey" FOREIGN KEY ("salesBillId") REFERENCES "SalesBill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_productBrandId_fkey" FOREIGN KEY ("productBrandId") REFERENCES "ProductBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesBillItems" ADD CONSTRAINT "SalesBillItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_salesBillId_fkey" FOREIGN KEY ("salesBillId") REFERENCES "SalesBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_salesBillItemsId_fkey" FOREIGN KEY ("salesBillItemsId") REFERENCES "SalesBillItems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItems" ADD CONSTRAINT "SalesReturnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningStock" ADD CONSTRAINT "OpeningStock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningStock" ADD CONSTRAINT "OpeningStock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningStockItems" ADD CONSTRAINT "OpeningStockItems_OpeningStockId_fkey" FOREIGN KEY ("OpeningStockId") REFERENCES "OpeningStock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningStockItems" ADD CONSTRAINT "OpeningStockItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_sizeTemplateId_fkey" FOREIGN KEY ("sizeTemplateId") REFERENCES "SizeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_sizeTemplateId_fkey" FOREIGN KEY ("sizeTemplateId") REFERENCES "SizeTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StyleItem" ADD CONSTRAINT "StyleItem_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_deliveryPartyId_fkey" FOREIGN KEY ("deliveryPartyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_deliveryChallanId_fkey" FOREIGN KEY ("deliveryChallanId") REFERENCES "DeliveryChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallanItems" ADD CONSTRAINT "DeliveryChallanItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoice" ADD CONSTRAINT "DeliveryInvoice_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_deliveryInvoiceId_fkey" FOREIGN KEY ("deliveryInvoiceId") REFERENCES "DeliveryInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_deliveryChallanItemsId_fkey" FOREIGN KEY ("deliveryChallanItemsId") REFERENCES "DeliveryChallanItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_deliveryChallanId_fkey" FOREIGN KEY ("deliveryChallanId") REFERENCES "DeliveryChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryInvoiceItems" ADD CONSTRAINT "DeliveryInvoiceItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_deliveryInvoiceId_fkey" FOREIGN KEY ("deliveryInvoiceId") REFERENCES "DeliveryInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTerm" ADD CONSTRAINT "TaxTerm_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTemplate" ADD CONSTRAINT "TaxTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTemplateDetails" ADD CONSTRAINT "TaxTemplateDetails_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxTemplateDetails" ADD CONSTRAINT "TaxTemplateDetails_taxTermId_fkey" FOREIGN KEY ("taxTermId") REFERENCES "TaxTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningBalance" ADD CONSTRAINT "OpeningBalance_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_deliveryToId_fkey" FOREIGN KEY ("deliveryToId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_deliveryBranchId_fkey" FOREIGN KEY ("deliveryBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Po" ADD CONSTRAINT "Po_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteVersion" ADD CONSTRAINT "QuoteVersion_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoItems" ADD CONSTRAINT "PoItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermsAndConditions" ADD CONSTRAINT "TermsAndConditions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayTerm" ADD CONSTRAINT "PayTerm_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInward" ADD CONSTRAINT "PurchaseInward_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InwardItems" ADD CONSTRAINT "InwardItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseInwardReturn" ADD CONSTRAINT "PurchaseInwardReturn_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_purchaseInwardReturnId_fkey" FOREIGN KEY ("purchaseInwardReturnId") REFERENCES "PurchaseInwardReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReturnItems" ADD CONSTRAINT "PurchaseReturnItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancel" ADD CONSTRAINT "PurchaseCancel_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_purchaseCancelId_fkey" FOREIGN KEY ("purchaseCancelId") REFERENCES "PurchaseCancel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCancelItems" ADD CONSTRAINT "PurchaseCancelItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntry" ADD CONSTRAINT "PurchaseBillEntry_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_purchaseBillEntryId_fkey" FOREIGN KEY ("purchaseBillEntryId") REFERENCES "PurchaseBillEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_styleItemId_fkey" FOREIGN KEY ("styleItemId") REFERENCES "StyleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_itemGroupId_fkey" FOREIGN KEY ("itemGroupId") REFERENCES "ItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseBillEntryItems" ADD CONSTRAINT "PurchaseBillEntryItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLedger" ADD CONSTRAINT "PurchaseLedger_purchaseBillEntryId_fkey" FOREIGN KEY ("purchaseBillEntryId") REFERENCES "PurchaseBillEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLedger" ADD CONSTRAINT "PurchaseLedger_purchaseInwardId_fkey" FOREIGN KEY ("purchaseInwardId") REFERENCES "PurchaseInward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLedger" ADD CONSTRAINT "PurchaseLedger_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Size" ADD CONSTRAINT "Size_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gsm" ADD CONSTRAINT "Gsm_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemGroup" ADD CONSTRAINT "ItemGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeTemplate" ADD CONSTRAINT "SizeTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeTemplateList" ADD CONSTRAINT "SizeTemplateList_sizeTemplateId_fkey" FOREIGN KEY ("sizeTemplateId") REFERENCES "SizeTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeTemplateList" ADD CONSTRAINT "SizeTemplateList_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfig" ADD CONSTRAINT "ApprovalConfig_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfig" ADD CONSTRAINT "ApprovalConfig_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfig" ADD CONSTRAINT "ApprovalConfig_approverRoleId_fkey" FOREIGN KEY ("approverRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalConfig" ADD CONSTRAINT "ApprovalConfig_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevel" ADD CONSTRAINT "ApprovalLevel_approvalConfigId_fkey" FOREIGN KEY ("approvalConfigId") REFERENCES "ApprovalConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelUser" ADD CONSTRAINT "ApprovalLevelUser_approvalLevelId_fkey" FOREIGN KEY ("approvalLevelId") REFERENCES "ApprovalLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelUser" ADD CONSTRAINT "ApprovalLevelUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_approvalConfigId_fkey" FOREIGN KEY ("approvalConfigId") REFERENCES "ApprovalConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLog" ADD CONSTRAINT "ApprovalLog_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelLog" ADD CONSTRAINT "ApprovalLevelLog_approvalLogId_fkey" FOREIGN KEY ("approvalLogId") REFERENCES "ApprovalLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelLog" ADD CONSTRAINT "ApprovalLevelLog_approvalLevelId_fkey" FOREIGN KEY ("approvalLevelId") REFERENCES "ApprovalLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalLevelLog" ADD CONSTRAINT "ApprovalLevelLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
