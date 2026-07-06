// dummyPurchaseReport.js
// Usage: import { dummyData } from "./dummyPurchaseReport";
// Then in PurchaseReport.jsx replace:
//   const allData = useMemo(() => (apiData?.data || []).map(computePORow), [apiData]);
// with:
//   const allData = useMemo(() => dummyData.map(computePORow), []);

const SUPPLIERS = [
  "SP APPARELS",
  "KPR TRADERS",
  "MUTHU TEXTILES",
  "RAJA FABRICS",
  "SRI TEXTILES",
  "ANAND MILLS",
];
const BRANCHES = ["MUTHU PRINTERS", "COIMBATORE", "TIRUPPUR", "ERODE"];
const PO_TYPES = ["GENERAL", "ORDER"];
const INWARD_TYPES = [
  "General Purchase Inward",
  "Order Purchase Inward",
  "Direct Inward",
];
const STATUSES = [
  "Pending",
  "Partially Received",
  "Fully Received",
  "Cancelled",
  "Partially Cancelled",
  "Closed (Inward + Cancelled)",
];
const ITEMS = [
  "BROWN BOARD",
  "WHITE BOARD",
  "KRAFT PAPER",
  "CORRUGATED SHEET",
  "BUBBLE WRAP",
  "STRETCH FILM",
  "TISSUE PAPER",
];
const SIZES = ["33*40", "40*50", "25*30", "50*60", "60*80"];
const COLORS = ["RED", "BLUE", "GREEN", "YELLOW", "WHITE", "NAVY", "BLACK"];
const UOMS = ["KGS", "NOS", "MTR", "REEM", "BOX"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}
function dateStr(daysOffset) {
  const d = new Date("2026-04-10");
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
}

function makeItem(id, poId) {
  const qty = rand(50, 500);
  const uom = pick(UOMS);
  return {
    id,
    qty,
    price: rand(10, 200),
    discountType: Math.random() > 0.5 ? "Percentage" : "Flat",
    discountValue: rand(0, 10),
    taxPercent: pick([0, 5, 12, 18]),
    styleItemId: id,
    sizeId: id,
    colorId: id,
    uomId: id,
    poId,
    StyleItem: { id, name: pick(ITEMS) },
    Uom: { id, name: uom },
    Size: { id, name: pick(SIZES) },
    Color: { id, name: pick(COLORS) },
    Gsm: { id, name: String(pick([60, 75, 90, 100, 120])) },
    Hsn: { id, name: "4811", tax: 12 },
    Itemgroup: { id, name: "PAPER" },
  };
}

function makeInwardItem(id, poId, purchaseInwardId, poItem) {
  const inwardQty = rand(poItem.qty * 0.2, poItem.qty);
  return {
    ...poItem,
    id,
    poId,
    purchaseInwardId,
    inwardQty,
    poQty: poItem.qty,
    batchNo: `BT-${Math.floor(Math.random() * 9000 + 1000)}`,
    invNo: `INV/${Math.floor(Math.random() * 9000 + 1000)}`,
    dcNo: `DC-${Math.floor(Math.random() * 9000 + 1000)}`,
  };
}

function makeCancelItem(id, poId, poItem) {
  return {
    ...poItem,
    id,
    poId,
    cancelQty: rand(5, poItem.qty * 0.3),
    poDocId: `MP/26-27/PO/${poId}`,
    batchNo: null,
    invNo: null,
    PurchaseCancel: {
      id,
      docId: `MP/26-27/PC/${id}`,
      docDate: dateStr(-rand(1, 15)),
      poType: "GENERAL",
      remarks: "",
    },
  };
}

function makeBillItem(id, poId, purchaseInwardId, inwardItem) {
  return {
    ...inwardItem,
    id,
    poId,
    purchaseInwardId,
    inwardQty: inwardItem.inwardQty,
    PurchaseBillEntry: {
      id,
      docId: `MP/26-27/PB/${id}`,
      docDate: dateStr(-rand(1, 10)),
      netBillValue: rand(500, 50000),
      billType: "PURCHASE",
      remarks: "",
      discountType: Math.random() > 0.5 ? "Percentage" : "Flat",
      discountValue: rand(0, 5),
    },
    PurchaseInward: {
      id: purchaseInwardId,
      docId: `MP/26-27/PI/${purchaseInwardId}`,
    },
    dcNo: `DC-${Math.floor(Math.random() * 9000 + 1000)}`,
  };
}

export const dummyData = Array.from({ length: 320 }, (_, idx) => {
  const id = 100 + idx;
  const poNo = idx + 1;
  const supplier = pick(SUPPLIERS);
  const poType = pick(PO_TYPES);
  const inwardType = pick(INWARD_TYPES);
  const receiptType = Math.random() > 0.7 ? "Against Invoice" : "Delivery";
  const dueDaysOffset = rand(-5, 30);
  const hasInward = Math.random() > 0.2;
  const hasCancel = Math.random() > 0.6;
  const hasBill = hasInward && Math.random() > 0.4;

  // PO items (1–3 items)
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const poItems = Array.from({ length: itemCount }, (_, i) =>
    makeItem(id * 10 + i, id),
  );

  const poQty = poItems.reduce((s, i) => s + i.qty, 0);

  // Inward
  const piId = id * 100;
  const inwardItems = hasInward
    ? poItems.map((pi, i) => makeInwardItem(piId + i, id, piId, pi))
    : [];
  const inwardQty = inwardItems.reduce((s, i) => s + i.inwardQty, 0);

  const inwardDocs = hasInward
    ? [
        {
          id: piId,
          docId: `MP/26-27/PI/${poNo}`,
          docDate: dateStr(-rand(1, 20)),
          inwardType,
          receiptType,
          dcNo: `DC-${Math.floor(Math.random() * 9000 + 1000)}`,
          invNo:
            receiptType === "Against Invoice"
              ? `INV/${Math.floor(Math.random() * 9000 + 1000)}`
              : null,
          vehicleNo: `TN39-${Math.floor(Math.random() * 9000 + 1000)}`,
          store: "WAREHOUSE",
          supplier,
          netBillValue:
            receiptType === "Against Invoice" ? rand(500, 50000) : null,
          discountType:
            receiptType === "Against Invoice"
              ? Math.random() > 0.5
                ? "Percentage"
                : "Flat"
              : null,
          discountValue: receiptType === "Against Invoice" ? rand(0, 5) : null,
          items: inwardItems,
        },
      ]
    : [];

  // Cancel
  const cancelItems = hasCancel
    ? poItems.slice(0, 1).map((pi, i) => makeCancelItem(id * 200 + i, id, pi))
    : [];
  const cancelQty = cancelItems.reduce((s, i) => s + i.cancelQty, 0);
  const cancelDocs = hasCancel
    ? [
        {
          id: id * 200,
          docId: `MP/26-27/PC/${poNo}`,
          docDate: dateStr(-rand(1, 15)),
          poType,
          remarks: "",
          items: cancelItems,
        },
      ]
    : [];

  // Return
  const returnDocs = [];
  const returnQty = 0;

  // Bill
  const billItems = hasBill
    ? inwardItems.map((ii, i) => makeBillItem(id * 300 + i, id, piId, ii))
    : [];
  const billedQty =
    receiptType === "Against Invoice"
      ? inwardQty
      : billItems.reduce((s, i) => s + i.inwardQty, 0);

  const billDocs = hasBill
    ? [
        {
          id: id * 300,
          docId: `MP/26-27/PB/${poNo}`,
          docDate: dateStr(-rand(1, 10)),
          netBillValue: rand(500, 50000),
          billType: "PURCHASE",
          remarks: "",
          discountType: Math.random() > 0.5 ? "Percentage" : "Flat",
          discountValue: rand(0, 5),
          items: billItems,
        },
      ]
    : [];

  const balanceQty = Math.max(0, poQty - inwardQty - cancelQty + returnQty);
  const pendingInward = Math.max(0, poQty - inwardQty - cancelQty);

  // Status
  const processed = inwardQty + cancelQty;
  let status = "Pending";
  if (cancelQty >= poQty) status = "Cancelled";
  else if (inwardQty >= poQty) status = "Fully Received";
  else if (processed >= poQty) status = "Closed (Inward + Cancelled)";
  else if (inwardQty > 0 && cancelQty > 0)
    status = "Partially Received & Cancelled";
  else if (inwardQty > 0) status = "Partially Received";
  else if (cancelQty > 0) status = "Partially Cancelled";

  return {
    id,
    docId: `MP/26-27/PO/${String(poNo).padStart(2, "0")}`,
    docDate: dateStr(-rand(1, 30)),
    dueDate: dateStr(dueDaysOffset),
    supplier,
    supplierId: idx + 1,
    poType,
    inwardType: hasInward ? inwardType : "—",
    branch: pick(BRANCHES),
    branchId: 1,
    remarks: Math.random() > 0.7 ? "Urgent order" : "",
    uom: poItems[0]?.Uom?.name,
    poQty,
    inwardQty,
    cancelQty,
    returnQty,
    billedQty,
    balanceQty,
    pendingInward,
    status,
    poItems,
    inwardDocs,
    cancelDocs,
    returnDocs,
    billDocs,
  };
});
