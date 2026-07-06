import Swal from "sweetalert2";
import { findFromList, isGridDatasValid } from "../../../Utils/helper";
import { calculateTaxWithHSNBreakupAndInsertIntoPoItems } from "../../../Utils/taxSummary";

export const PURCHASE_ORDER_TRANSACTION_DEFINITION = {
  headerFields: ["basicDetails", "poDetails", "supplierDetails", "deliveryDetails"],
  grid: {
    columns: [
      "serial",
      "styleItemId",
      "itemGroupId",
      "sizeId",
      "colorId",
      "gsmId",
      "uomId",
      "qty",
      "price",
      "gross",
      "tax",
      "actions",
    ],
  },
  rowFactory: "createPurchaseOrderRow",
  validation: "validatePurchaseOrderData",
  actions: ["saveClose", "saveNew", "submitApproval", "summary", "print"],
};

export const DEFAULT_PURCHASE_ORDER_ROWS = 20;

export const createPurchaseOrderRow = (quoteVersion = "") => ({
  styleItemId: "",
  hsnId: "",
  uomId: "",
  price: "",
  qty: "",
  quoteVersion,
  netAmount: 0,
  itemGroupId: "",
  sizeId: "",
  colorId: "",
  gsmId: "",
});

export const createPurchaseOrderRows = (
  count = DEFAULT_PURCHASE_ORDER_ROWS,
  quoteVersion = "",
) =>
  Array.from({ length: count }, () => createPurchaseOrderRow(quoteVersion));

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
        : parseInt(row.quoteVersion) === parseInt(quoteVersion)
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

export const findPurchaseOrderDuplicates = ({ items = [], id, isNewVersion, quoteVersion }) => {
  const versionFilteredItems = items.filter((row) => {
    if (!id) return true;
    if (isNewVersion) return row.quoteVersion === "New";
    return parseInt(row.quoteVersion) === parseInt(quoteVersion ?? "");
  });

  const seen = new Map();
  const duplicates = [];

  versionFilteredItems.forEach((row, index) => {
    const key = [
      row.styleItemId || "",
      row.sizeId || "",
      row.colorId || "",
      row.gsmId || "",
    ].join("-");

    if (seen.has(key)) {
      duplicates.push({
        firstIndex: seen.get(key),
        duplicateIndex: index,
        styleItemId: row.styleItemId,
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
  styleItemList,
  sizeList,
  colorList,
  gsmList,
}) => {
  const filledItems = (data?.poItems || []).filter((item) => item.styleItemId);
  const duplicates = findPurchaseOrderDuplicates({
    items: filledItems,
    id,
    isNewVersion,
    quoteVersion,
  });
  const dup = duplicates[0];

  const checks = [
    { severity: "block", condition: !data.dueDate, message: "Delivery Date is required!" },
    { severity: "block", condition: !data.poType, message: "PO Type is required!" },
    { severity: "block", condition: !data.taxTemplateId, message: "Tax Template is required!" },
    { severity: "block", condition: !data.supplierId, message: "Supplier is required!" },
    { severity: "block", condition: !data.deliveryType, message: "Delivery Type is required!" },
    { severity: "block", condition: !data.deliveryToId, message: "Delivery To is required!" },
    {
      severity: "block",
      condition: filledItems.length === 0,
      message: "Please add at least one item!",
    },
    {
      severity: "block",
      condition: !isGridDatasValid(data?.poItems, false, [
        "styleItemId",
        "uomId",
        "qty",
        "price",
      ]),
      message: "Please fill all required item fields!",
    },
    {
      severity: "block",
      condition: duplicates.length > 0,
      message: "Duplicate Item Found!",
      html: dup
        ? `Item - ${findFromList(dup?.styleItemId, styleItemList?.data, "name")}, Size - ${findFromList(dup?.sizeId, sizeList?.data, "name")}, Color - ${findFromList(dup?.colorId, colorList?.data, "name")}, GSM - ${findFromList(dup?.gsmId, gsmList?.data, "name")}`
        : "",
    },
  ];

  return checks.find((check) => check.condition) || { severity: "ignore", message: "" };
};

export const isPurchaseOrderSupplierOutsideTamilNadu = (supplierDetails) => {
  if (!supplierDetails) {
    return false;
  }

  return supplierDetails?.data?.City?.state?.name !== "TAMILNADU";
};

export const getPurchaseOrderTaxSnapshot = ({
  poItems,
  supplierDetails,
  discountType,
  discountValue,
  id,
  isNewVersion,
  quoteVersion,
}) => {
  const supplierOutside = isPurchaseOrderSupplierOutsideTamilNadu(supplierDetails);
  const enriched = calculateTaxWithHSNBreakupAndInsertIntoPoItems(
    poItems,
    supplierOutside,
    discountType,
    discountValue,
  );
  const visibleRows = getVisiblePurchaseOrderRows({
    rows: poItems,
    id,
    isNewVersion,
    quoteVersion,
  }).filter((item) => item.styleItemId);
  const totals = calculateTaxWithHSNBreakupAndInsertIntoPoItems(
    visibleRows,
    supplierOutside,
    discountType,
    discountValue,
  );

  return {
    isSupplierOutside: supplierOutside,
    enrichedPoItems: enriched.items,
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
  poItems: (poItems || []).filter((po) => po.styleItemId),
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
