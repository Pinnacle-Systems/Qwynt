export const COLUMNS = [
  { key: "docId", label: "Sales Delivery No", w: "130px" },
  { key: "docDate", label: "Sales Delivery Date", w: "110px" },
  { key: "customerName", label: "Customer Name", w: "250px" },
  // { key: "branchName", label: "Branch", w: "150px" },
  { key: "payTermName", label: "Pay Term", w: "150px" },
  { key: "bankName", label: "Bank", w: "150px" },
  { key: "totalBoxes", label: "Total Boxes", w: "120px" },
  { key: "totalItems", label: "Total Items", w: "120px" },
  { key: "totalValue", label: "Total Value", w: "130px" },
];

export const QTY_KEYS = ["totalBoxes", "totalItems", "totalValue"];

export function fmt3(val) {
  const n = typeof val === "number" ? val : parseFloat(val) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

export function fmtInt(val) {
  const n = typeof val === "number" ? val : parseFloat(val) || 0;
  return n.toLocaleString("en-IN");
}

export function fmtDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "—"; // invalid date
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function buildGroups(rows, groupKeys, groupDirs, depth = 0) {
  if (depth >= groupKeys.length) return rows;
  const key = groupKeys[depth];
  const dir = groupDirs[key] ?? 1;

  const buckets = {};
  for (const r of rows) {
    let val = r[key];
    if (key === "docDate") val = fmtDate(val);
    val = String(val ?? "");
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
