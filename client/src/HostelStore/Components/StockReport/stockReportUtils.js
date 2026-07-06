// ─────────────────────────────────────────────────────────────────────────────
//  stockReportUtils.js
// ─────────────────────────────────────────────────────────────────────────────

// ── Column definitions ────────────────────────────────────────────────────────
export const STOCK_COLUMNS = [
  { key: "store", label: "Location", w: "100px" },
  { key: "styleItem", label: "Item Name", w: "150px" },
  { key: "itemGroup", label: "Item Group", w: "100px" },
  { key: "size", label: "Size", w: "70px" },
  { key: "color", label: "Color", w: "90px" },
  { key: "gsm", label: "GSM", w: "40px" },
  { key: "uom", label: "UOM", w: "40px" },
  { key: "netQty", label: "Qty", w: "40px" },
];

export const QTY_KEYS = ["netQty"];

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
