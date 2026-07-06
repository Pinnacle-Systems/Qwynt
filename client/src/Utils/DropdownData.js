export const bloodList = [
  { show: "A +ve", value: "AP" },
  { show: "A -ve", value: "AN" },
  { show: "B +ve", value: "BP" },
  { show: "B -ve", value: "BN" },
  { show: "AB +ve", value: "ABP" },
  { show: "AB -ve", value: "ABN" },
  { show: "O +ve", value: "OP" },
  { show: "O -ve", value: "ON" },
];

export const genderList = [
  { show: "MALE", value: "MALE" },
  { show: "FEMALE", value: "FEMALE" },
  { show: "OTHER", value: "OTHER" },
];

export const maritalStatusList = [
  { show: "SINGLE", value: "SINGLE" },
  { show: "MARRIED", value: "MARRIED" },
  { show: "SEPARATED", value: "SEPARATED" },
];

export const pageType = [
  { show: "MASTER", value: "Masters" },
  { show: "TRANSACTION", value: "Transactions" },
  { show: "REPORTS", value: "Reports" },
  { show: "ADMIN CONTROLS", value: "AdminAccess" },
];

export const accessoryCategoryList = [
  { show: "STITCHING ACCESSORIES", value: "STITCHING" },
  { show: "PACKING ACCESSORIES", value: "PACKING" },
];

export const prefixCategory = [
  { show: "DEFAULT", value: "Default" },
  { show: "SPECIFIC", value: "Specific" },
];

export const employeeType = [
  { show: "PERMANENT", value: true },
  { show: "TEMPORARY", value: false },
];

export const statusDropdown = [
  { show: "ACTIVE", value: true },
  { show: "INACTIVE", value: false },
];

export const poTypes = [
  { show: "ORDER", value: "ORDER" },
  { show: "GENERAL", value: "GENERAL" },
];

export const paymentTypes = [
  { show: "Against Bill", value: "AgainstBill" },
  { show: "Advance", value: "Advance" },
];

export const paymentModes = [
  { show: "Cheque", value: "Cheque" },
  { show: "Online", value: "Online" },
  { show: "Upi", value: "Upi" },
  { show: "Cash", value: "Cash" },
];

export const discountTypes = [
  { show: "Flat", value: "Flat" },
  { show: "Percentage", value: "Percentage" },
];

export const diaMeasurementList = [
  { show: "CMS", value: "CMS" },
  { show: "Inches", value: "INCHES" },
  { show: "Open Width", value: "OPENWIDTH" },
  { show: "Tubuler", value: "TUBULER" },
];

export const purchasePrPi = [
  { show: "Purchase Inward", value: "PurchaseInward" },
  { show: "Purchase Return", value: "PurchaseReturn" },
];

export const inwardTypes = [
  { show: "General Purchase Inward", value: "General Purchase Inward" },
  { show: "Order Purchase Inward", value: "Order Purchase Inward" },
  { show: "Direct Inward", value: "Direct Inward" },
];

export const receiptTypes = [
  { show: "Delivery cum Invoice", value: "AGAINST_INVOICE" },
  { show: "Delivery only", value: "WITHOUT_INVOICE" },
];

export const billTypes = [
  { show: "General Purchase Bill", value: "General Purchase Inward" },
  { show: "Order Purchase Bill", value: "Order Purchase Inward" },
  { show: "Direct Inward Bill", value: "Direct Inward" },
];

export const returnTypes = [
  { show: "General Return", value: "General Return" },
  { show: "Purchase Return", value: "Purchase Return" },
];

export const inwardTypeOptions = [
  { show: "Against Po", value: "AgainstPo" },
  { show: "Direct Inward", value: "DirectInward" },
];

export const processDeliveryOrReturn = [
  { show: "Process Delivery", value: "ProcessDelivery" },
  { show: "Process Return", value: "ProcessReturn" },
];

export const ProcessIOOptions = [
  { show: "GY-GY", value: "GY_GY" },
  { show: "GY-DY", value: "GY_DY" },
  { show: "GY-GF", value: "GY_GF" },
  { show: "DY-DY", value: "DY_DY" },
  { show: "DY-DF", value: "DY_DF" },
  { show: "GF-DF", value: "GF_DF" },
  { show: "DF-DF", value: "DF_DF" },
];

export const deliveryTypes = [
  { show: "To Self", value: "ToSelf" },
  { show: "To Party", value: "ToParty" },
];

export const showEntries = [
  { show: "10", value: "10" },
  { show: "25", value: "25" },
  { show: "50", value: "50" },
  { show: "100", value: "100" },
];

export const inHouseOutsideTypes = [
  { show: "IN-HOUSE", value: "INHOUSE" },
  { show: "OUTSIDE", value: "OUTSIDE" },
];

export const salesTypes = [
  { show: "WHOLE SALE", value: "WHOLESALE" },
  { show: "RETAIL", value: "RETAIL" },
];
export const PaymentType = [
  { show: "Invoice Payment", value: "INVOICE" },
  { show: "Advance Payment", value: "ADVANCE" },
];

export const partyType = [
  {
    show: "Customer",
    value: "customer",
  },
  {
    show: "Supplier",
    value: "supplier",
  },
];

export const orderTypes = [
  { show: "GENERAL", value: "GENERAL" },
  { show: "AGAINST PI", value: "AGAINSTPI" },
];

export const productionTypes = [
  { show: "SAMPLE", value: "SAMPLE" },
  { show: "BULK", value: "BULK" },
];

export const priorityTypes = [
  { show: "HIGH", value: "HIGH" },
  { show: "MEDIUM", value: "MEDIUM" },
  { show: "LOW", value: "LOW" },
];

export const jobTypes = [
  { show: "Internal", value: "Internal" },
  { show: "External", value: "External" },
  { show: "Both", value: "Both" },
];

export const currencySymbolList = [
  { code: "INR", show: "₹ (INR)", value: "₹" },
  { code: "USD", show: "$ (USD)", value: "$" },
  { code: "EUR", show: "€ (EUR)", value: "€" },
  { code: "GBP", show: "£ (GBP)", value: "£" },
  { code: "JPY", show: "¥ (JPY)", value: "¥" },
  { code: "CNY", show: "¥ (CNY)", value: "¥" },
  { code: "AED", show: "د.إ (AED)", value: "د.إ" },
  { code: "SAR", show: "﷼ (SAR)", value: "﷼" },
  { code: "SGD", show: "$ (SGD)", value: "$" },
  { code: "AUD", show: "$ (AUD)", value: "$" },
  { code: "CAD", show: "$ (CAD)", value: "$" },
];

export const conversionTypes = [
  { show: "DOZEN", value: "DOZEN" },
  { show: "PCS", value: "PCS" },
];

export const blockTypes = [
  { show: "NEW", value: "NEW" },
  { show: "OLD", value: "OLD" },
];

export const outwardProcessTypes = [
  { show: "SINGLE", value: "SINGLE" },
  { show: "MULTIPLE", value: "Multiple" },
];
