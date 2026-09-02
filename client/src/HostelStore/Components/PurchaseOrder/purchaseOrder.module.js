import Swal from "sweetalert2";
import { findFromList, isGridDatasValid } from "../../../Utils/helper";
import { calculateTaxWithHSNBreakupAndInsertIntoPoItems } from "../../../Utils/taxSummary";

export const PURCHASE_ORDER_TRANSACTION_DEFINITION = {
  headerFields: [
    "basicDetails",
    "poDetails",
    "supplierDetails",
    "deliveryDetails",
  ],
  grid: {
    columns: [
      "serial",
      "itemVariantId",
      "hsnId",
      "printingDesignId",
      "sizeId",
      "colorId",
      "uomId",
      "qty",
      "price",
      "gross",
      "tax",
      "mrpPrice",
      "actions",
    ],
  },
  rowFactory: "createPurchaseOrderRow",
  validation: "validatePurchaseOrderData",
  actions: ["saveClose", "saveNew", "submitApproval", "summary", "print"],
};

export const DEFAULT_PURCHASE_ORDER_ROWS = 20;

export const createPurchaseOrderRow = (quoteVersion = "") => ({
  itemVariantId: "",
  hsnId: "",
  printingDesignId: "",
  sizeId: "",
  colorId: "",
  uomId: "",
  price: "",
  qty: "",
  quoteVersion,
  netAmount: 0,
  mrpPrice: 0,
});

export const createPurchaseOrderRows = (
  count = DEFAULT_PURCHASE_ORDER_ROWS,
  quoteVersion = "",
) => Array.from({ length: count }, () => createPurchaseOrderRow(quoteVersion));

export const getVisiblePurchaseOrderRows = ({
  rows = [],
  id,
  isNewVersion,
  quoteVersion,
}) =>
  rows.filter((row) =>
    id
      ? isNewVersion
        ? row.quoteVersion === "New"
        : parseInt(row.quoteVersion || 0) === parseInt(quoteVersion || 0)
      : true,
  );

export const resolveStyleItemPatch = async ({ styleItemId, getStyleItem }) => {
  const response = await getStyleItem(styleItemId).unwrap();

  return {
    styleItemId,
    hsnId: response?.data?.hsnId,
    taxPercent: response?.data?.Hsn?.tax,
    itemGroupId: response?.data?.itemGroupId,
    sizeId: response?.data?.sizeId,
    colorId: response?.data?.colorId,
    uomId: response?.data?.uomId,
    gsmId: response?.data?.gsmId,
  };
};

export const findPurchaseOrderDuplicates = ({
  items = [],
  id,
  isNewVersion,
  quoteVersion,
}) => {
  const versionFilteredItems = items.filter((row) => {
    if (!id) return true;
    if (isNewVersion) return row.quoteVersion === "New";
    return parseInt(row.quoteVersion) === parseInt(quoteVersion ?? "");
  });

  const seen = new Map();
  const duplicates = [];

  versionFilteredItems.forEach((row, index) => {
    const key = [
      row.itemVariantId || "",
      row.printingDesignId || "",
      row.sizeId || "",
      row.colorId || "",
      row.gsmId || "",
    ].join("-");

    if (seen.has(key)) {
      duplicates.push({
        firstIndex: seen.get(key),
        duplicateIndex: index,
        itemVariantId: row.itemVariantId,
        printingDesignId: row.printingDesignId,

        sizeId: row.sizeId,
        colorId: row.colorId,
        gsmId: row.gsmId,
      });
    } else {
      seen.set(key, index);
    }
  });

  return duplicates;
};

export const showValidationResult = (result) => {
  if (!result || result.severity === "ignore") {
    return true;
  }

  Swal.fire({
    icon: result.severity === "warn" ? "warning" : "error",
    title: result.message,
    html: result.html,
    timer: result.html ? undefined : 1500,
    showConfirmButton: !!result.html,
    confirmButtonText: "OK",
  });

  return result.severity !== "block";
};

export const validatePurchaseOrderData = ({
  data,
  id,
  isNewVersion,
  quoteVersion,
  itemVariantList,
  sizeList,
  colorList,
  gsmList,
}) => {
  const filledItems = (data?.poItems || []).filter(
    (item) => item.itemVariantId,
  );
  const duplicates = findPurchaseOrderDuplicates({
    items: filledItems,
    id,
    isNewVersion,
    quoteVersion,
  });
  const dup = duplicates[0];

  const checks = [
    {
      severity: "block",
      condition: !data.dueDate,
      message: "Delivery Date is required!",
    },
    {
      severity: "block",
      condition: !data.poType,
      message: "PO Type is required!",
    },
    {
      severity: "block",
      condition: !data.taxTemplateId,
      message: "Tax Template is required!",
    },
    {
      severity: "block",
      condition: !data.supplierId,
      message: "Supplier is required!",
    },
    {
      severity: "block",
      condition: !data.deliveryType,
      message: "Delivery Type is required!",
    },
    {
      severity: "block",
      condition: !data.deliveryToId,
      message: "Delivery To is required!",
    },
    {
      severity: "block",
      condition: filledItems.length === 0,
      message: "Please add at least one item!",
    },
    {
      severity: "block",
      condition: !isGridDatasValid(data?.poItems, false, [
        "itemVariantId",
        "hsnId",
        "printingDesignId",
        "sizeId",
        "colorId",
        "uomId",
        "qty",
        "price",
        "mrpPrice",
      ]),
      message: "Please fill all required item fields!",
    },
    {
      severity: "block",
      condition: duplicates.length > 0,
      message: "Duplicate Item Found!",
      html: (() => {
        if (!dup) return "";
        const variant = itemVariantList?.data?.find(
          (v) => v.id === dup.itemVariantId,
        );
        const itemName = variant?.styleMaster?.modelName?.name || "Unknown";
        const detail = variant?.ItemVariantMasterDetails?.find(
          (d) =>
            d.printingDesignId === dup.printingDesignId &&
            d.sizeId === dup.sizeId &&
            d.colorId === dup.colorId,
        );
        const designName = detail?.printingDesign?.name || "Unknown";
        const sizeName = detail?.size?.name || "Unknown";
        const colorName = detail?.color?.name || "Unknown";
        return `Item - ${itemName}, Design - ${designName}, Size - ${sizeName}, Color - ${colorName}`;
      })(),
    },
  ];

  return (
    checks.find((check) => check.condition) || {
      severity: "ignore",
      message: "",
    }
  );
};

export const isPurchaseOrderSupplierOutsideTamilNadu = (supplierDetails) => {
  if (!supplierDetails) {
    return false;
  }

  return supplierDetails?.data?.City?.state?.name !== "TAMILNADU";
};

export const getPurchaseOrderTaxSnapshot = ({
  poItems = [],
  supplierDetails,
  discountType,
  discountValue,
  id,
  isNewVersion,
  quoteVersion,
}) => {
  const supplierOutside =
    isPurchaseOrderSupplierOutsideTamilNadu(supplierDetails);

  const isVisibleRow = (row) => {
    if (!id) return true;
    if (isNewVersion) return row.quoteVersion === "New";
    if (!quoteVersion) return row.quoteVersion !== "New";
    return parseInt(row.quoteVersion) === parseInt(quoteVersion);
  };

  const activeRowsWithIndex = poItems
    .map((row, originalIndex) => ({ row, originalIndex }))
    .filter(({ row }) => isVisibleRow(row) && row.itemVariantId);

  const activeRows = activeRowsWithIndex.map(({ row }) => row);

  const totals = calculateTaxWithHSNBreakupAndInsertIntoPoItems(
    activeRows,
    supplierOutside,
    discountType,
    discountValue,
  );

  const enrichedPoItems = poItems.map((row, index) => {
    const activeMatchIndex = activeRowsWithIndex.findIndex(
      ({ originalIndex }) => originalIndex === index,
    );
    if (activeMatchIndex !== -1 && totals.items?.[activeMatchIndex]) {
      return totals.items[activeMatchIndex];
    }
    return {
      ...row,
      totals: {
        gross: 0,
        itemDiscount: 0,
        overallDiscountShare: 0,
        taxable: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        net: 0,
      },
    };
  });

  return {
    isSupplierOutside: supplierOutside,
    enrichedPoItems,
    totals,
  };
};

export const getPurchaseOrderPayload = ({
  supplierId,
  dueDate,
  docDate,
  branchId,
  id,
  userId,
  remarks,
  poItems,
  deliveryType,
  deliveryToId,
  discountType,
  discountValue,
  taxPercent,
  finYearId,
  poType,
  taxTemplateId,
  termsAndCondtion,
  termsId,
  isNewVersion,
  quoteVersion,
  payTermId,
  pageId,
  totalNetAmount,
  submitApproval,
}) => ({
  supplierId,
  dueDate,
  docDate,
  branchId,
  id,
  userId,
  remarks,
  poItems: (poItems || []).filter((po) => po.itemVariantId),
  deliveryType,
  deliveryToId,
  discountType,
  discountValue,
  taxPercent,
  finYearId,
  poType,
  taxTemplateId,
  termsAndCondtion,
  termsId,
  isNewVersion,
  quoteVersion,
  payTermId,
  pageId,
  totalNetAmount,
  submitApproval,
});
