// ─────────────────────────────────────────────────────────────────────────────
//  stockReportUtils.js
// ─────────────────────────────────────────────────────────────────────────────

// ── Column definitions ────────────────────────────────────────────────────────
export const STOCK_COLUMNS = [
  { key: "modelName", label: "Model Name", w: "250px" },
  { key: "styleNo", label: "Style No", w: "150px" },
  { key: "cuttingPattern", label: "Cutting Pattern", w: "250px" },
  { key: "printingDesign", label: "Printing Design", w: "250px" },
  { key: "size", label: "Size", w: "110px" },
  { key: "color", label: "Color", w: "200px" },
  { key: "uom", label: "UOM", w: "90px" },
  { key: "hsn", label: "HSN", w: "90px" },
  { key: "price", label: "MRP Price", w: "120px" },
  { key: "store", label: "Location", w: "150px" },
  { key: "poNo", label: "Po No", w: "130px" },
  { key: "supplierName", label: "Supplier Name", w: "300px" },
  { key: "pINo", label: "PI No", w: "130px" },
  { key: "packingNo", label: "Packing No", w: "130px" },
  { key: "boxNo", label: "Box No", w: "130px" },
  { key: "salesNo", label: "Sales Delivery No", w: "130px" },
  { key: "customerName", label: "Customer Name", w: "300px" },
  { key: "salesReturnNo", label: "Sales Return No", w: "130px" },

  { key: "qrCode", label: "QR Code", w: "150px" },
  { key: "itemStatus", label: "Item Status", w: "150px" },
];

export const QTY_KEYS = ["price"];

// ── fmt3: fixed 3 decimal ─────────────────────────────────────────────────────
export function fmt3(val) {
  const n = typeof val === "number" ? val : parseFloat(val) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

// ── buildGroups: same logic as PO report ─────────────────────────────────────
export function buildGroups(rows, groupKeys, groupDirs, depth = 0) {
  if (depth >= groupKeys.length) return rows;
  const key = groupKeys[depth];
  const dir = groupDirs[key] ?? 1;

  const buckets = {};
  for (const r of rows) {
    const val = String(r[key] ?? "");
    if (!buckets[val]) buckets[val] = [];
    buckets[val].push(r);
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b) * dir)
    .map(([val, children]) => ({
      _group: true,
      _key: key,
      _val: val,
      _depth: depth,
      _count: children.length,
      _children: buildGroups(children, groupKeys, groupDirs, depth + 1),
    }));
}
