// ─────────────────────────────────────────────────────────────────────────────
//  PurchaseReport.jsx — S.No col, fixed 2dp qty, PDF fix, inward bar-first,
//                       expanded border, group qty summary
// ─────────────────────────────────────────────────────────────────────────────
import React, { useMemo, useRef, useState } from "react";
import { useGetPurchaseReportQuery } from "../../../../redux/services/purchaseReportApi";
import ColumnFilterMenu from "./components/ColumnFilterMenu";
import ExpandedRowDetail from "./components/ExpandedRowDetail";
import {
  COLUMNS,
  buildGroups,
  computePORow,
  dueBadgeCls,
  fmtDate,
  statusBadgeCls,
} from "./purchaseReportUtils";
import { dummyData } from "./dummyPurchaseReport";
import XLSXStyle from "xlsx-js-style";
import mpLogo from "../../../../assets/gwynt_logo.png";
const PAGE_SIZE = 40;

// ── fixed 2-decimal formatter (no UOM logic) ─────────────────────────────────
function fmt2(val) {
  const n = typeof val === "number" ? val : parseFloat(val) || 0;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}
// ── Inward type short codes for PDF ──────────────────────────────────────────
const INWARD_SHORT = {
  "Order Purchase Inward": "OPI",
  "General Purchase Inward": "GPI",
  "Direct Inward": "DI",
};
// ── Excel number format: always 2dp ──────────────────────────────────────────
const EXCEL_NUM_FMT = "#,##0.000";

export default function PurchaseReport() {
  const [queryParams] = useState({ branchId: undefined });
  const {
    data: apiData,
    isLoading,
    isFetching,
    isError,
  } = useGetPurchaseReportQuery(queryParams);

  const allData = useMemo(
    () => (apiData?.data || []).map(computePORow),
    [apiData],
  );
  // const allData = useMemo(() => dummyData.map(computePORow), []);
  const [colOrder, setColOrder] = useState(() => COLUMNS.map((c) => c.key));
  const [groupKeys, setGroupKeys] = useState([]);
  const [groupDirs, setGroupDirs] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [colFilters, setColFilters] = useState({});
  const [openMenuCol, setOpenMenuCol] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);

  const dragColRef = useRef(null);
  const dragGbOver = useRef(false);

  const uniqueVals = useMemo(() => {
    const map = {};
    COLUMNS.forEach(({ key }) => {
      if (key === "dueStatus") {
        map[key] = [
          ...new Set(
            allData.map((r) => {
              if (r.dueAlert === "overdue") return "Overdue";
              if (r.dueAlert === "soon") return "Due Today / Due Soon";
              if (r.dueAlert === "done") return "Completed";
              return "Remaining";
            }),
          ),
        ].sort();
      } else {
        map[key] = [
          ...new Set(allData.map((r) => String(r[key] ?? ""))),
        ].sort();
      }
    });
    return map;
  }, [allData]);

  const filtered = useMemo(() => {
    return allData.filter((r) => {
      for (const [k, allowed] of Object.entries(colFilters)) {
        if (!allowed) continue;
        if (k === "dueStatus") {
          const category =
            r.dueAlert === "overdue"
              ? "Overdue"
              : r.dueAlert === "soon"
                ? "Due Today / Due Soon"
                : r.dueAlert === "done"
                  ? "Completed"
                  : "Remaining";
          if (!allowed.has(category)) return false;
        } else {
          if (!allowed.has(String(r[k] ?? ""))) return false;
        }
      }
      return true;
    });
  }, [allData, colFilters]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey],
        bv = b[sortKey];
      return (
        (typeof av === "string"
          ? av.localeCompare(bv)
          : (av || 0) - (bv || 0)) * sortDir
      );
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const tree = useMemo(
    () =>
      groupKeys.length
        ? buildGroups(paginated, groupKeys, groupDirs)
        : paginated,
    [paginated, groupKeys, groupDirs],
  );

  const metrics = useMemo(
    () => ({
      total: filtered.length,
      overdue: filtered.filter((r) => r.dueAlert === "overdue").length,
      soon: filtered.filter((r) => r.dueAlert === "soon").length,
      fullR: filtered.filter((r) => r.status === "Fully Received").length,
      totalBal: filtered.reduce((s, r) => s + r.balanceQty, 0),
    }),
    [filtered],
  );

  const visibleCols = useMemo(
    () =>
      colOrder
        .filter((k) => !groupKeys.includes(k))
        .map((k) => COLUMNS.find((c) => c.key === k))
        .filter(Boolean),
    [colOrder, groupKeys],
  );

  // ─── handlers ──────────────────────────────────────────────────────────────
  function handleSort(k, dir) {
    setSortKey(k);
    setSortDir(dir);
    setPage(1);
  }
  function handleFilterApply(k, vs) {
    setColFilters((p) => {
      const n = { ...p };
      if (!vs) delete n[k];
      else n[k] = vs;
      return n;
    });
    setOpenMenuCol(null);
    setPage(1);
  }
  function removeFilterChip(k) {
    setColFilters((p) => {
      const n = { ...p };
      delete n[k];
      return n;
    });
    setPage(1);
  }
  function toggleExpand(id) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }
  function toggleGroup(gid) {
    setCollapsed((p) => ({ ...p, [gid]: !p[gid] }));
  }
  function removeGroupKey(k) {
    setGroupKeys((p) => p.filter((g) => g !== k));
    setGroupDirs((p) => {
      const n = { ...p };
      delete n[k];
      return n;
    });
  }
  function toggleGroupDir(k) {
    setGroupDirs((p) => ({ ...p, [k]: (p[k] || 1) * -1 }));
  }
  function onColDragStart(e, k) {
    dragColRef.current = k;
    e.dataTransfer.setData("col", k);
    e.dataTransfer.effectAllowed = "move";
  }
  function onGbDragOver(e) {
    e.preventDefault();
    dragGbOver.current = true;
  }
  function onGbDrop(e) {
    e.preventDefault();
    dragGbOver.current = false;
    const k = e.dataTransfer.getData("col") || dragColRef.current;
    if (!k || groupKeys.includes(k)) return;
    setGroupKeys((p) => [...p, k]);
    setGroupDirs((p) => ({ ...p, [k]: 1 }));
  }
  function onColDrop(e, tgtKey) {
    e.preventDefault();
    const srcKey = e.dataTransfer.getData("col") || dragColRef.current;
    if (!srcKey || srcKey === tgtKey) return;
    setColOrder((p) => {
      const a = [...p],
        si = a.indexOf(srcKey),
        ti = a.indexOf(tgtKey);
      if (si < 0 || ti < 0) return a;
      a.splice(si, 1);
      a.splice(ti, 0, srcKey);
      return a;
    });
  }

  // ─── cell renderer ─────────────────────────────────────────────────────────
  function renderCellValue(row, key) {
    switch (key) {
      case "docId":
        return <div className="text-xs text-gray-600">{row.docId ?? "—"}</div>;
      case "docDate":
        return (
          <span className="text-xs text-gray-600">{fmtDate(row.docDate)}</span>
        );
      case "dueDate":
        return (
          <span className="text-xs text-gray-600">{fmtDate(row.dueDate)}</span>
        );
      case "dueStatus":
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${dueBadgeCls(row.dueAlert)}`}
          >
            {row.dueStatus}
          </span>
        );
      case "supplier":
        return (
          <span className="text-xs text-gray-600">{row.supplier ?? "—"}</span>
        );
      case "poType": {
        const isOrder = row.poType === "ORDER";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${isOrder ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`}
          >
            {row.poType ?? "—"}
          </span>
        );
      }
      case "inwardType": {
        const colorMap = {
          "Order Purchase Inward":
            "bg-indigo-50 text-indigo-700 border border-indigo-200",
          "General Purchase Inward":
            "bg-teal-50 text-teal-700 border border-teal-200",
          "Direct Inward":
            "bg-orange-50 text-orange-700 border border-orange-200",
        };
        const cls =
          colorMap[row.inwardType] ??
          "bg-gray-100 text-gray-500 border border-gray-200";
        const short = INWARD_SHORT[row.inwardType];
        return row.inwardType && row.inwardType !== "—" ? (
          <>
            {/* screen: full label */}
            <span
              className={`print-hide inline-flex items-center px-2 py-0.5 rounded-full text-xs ${cls}`}
            >
              {row.inwardType}
            </span>
            {/* print: short code only */}
            <span
              className={`print-only-inline items-center px-1.5 py-0.5 rounded text-xs font-semibold ${cls}`}
            >
              {short ?? row.inwardType}
            </span>
          </>
        ) : (
          <span className="text-xs text-gray-600">—</span>
        );
      }
      case "branch":
        return (
          <span className="text-xs text-gray-600">{row.branch ?? "—"}</span>
        );

      // ── qty columns — all fixed 2dp, bar FIRST then number ────────────────
      case "poQty":
        return (
          <div className="text-xs text-right text-gray-600">
            {fmt2(row.poQty)}
          </div>
        );
      case "inwardQty": {
        const pct =
          row.poQty > 0
            ? Math.min(100, Math.round((row.inwardQty / row.poQty) * 100))
            : 0;
        return (
          // Progress bar FIRST, then qty number
          <div className="flex items-center gap-1.5">
            <div className="inward-bar h-1.5 rounded-full bg-gray-200 flex-1 min-w-[32px]">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="inward-pct text-xs text-gray-500">{pct}%</span>
            <span className="inward-num text-xs text-gray-600 min-w-[32px] text-right">
              {fmt2(row.inwardQty)}
            </span>
          </div>
        );
      }
      case "cancelQty":
        return (
          <div
            className={`text-xs text-right ${row.cancelQty > 0 ? "text-red-600" : "text-gray-600"}`}
          >
            {fmt2(row.cancelQty)}
          </div>
        );
      case "returnQty":
        return (
          <div
            className={`text-xs text-right ${row.returnQty > 0 ? "text-[#6B3A2A]" : "text-gray-600"}`}
          >
            {fmt2(row.returnQty)}
          </div>
        );
      case "billedQty": {
        const isFullyBilled =
          row.billedQty >= row.inwardQty && row.inwardQty > 0;
        const isPartial = row.billedQty > 0 && row.billedQty < row.inwardQty;
        return (
          <div
            className={`text-xs text-right ${isFullyBilled ? "text-green-600" : isPartial ? "text-amber-600" : "text-gray-600"}`}
          >
            {fmt2(row.billedQty)}
          </div>
        );
      }
      case "balanceQty":
        return row.balanceQty === 0 ? (
          <div className="text-xs text-right text-gray-600">0.00</div>
        ) : (
          <div className="text-xs text-right text-amber-600">
            {fmt2(row.balanceQty)}
          </div>
        );
      case "pendingInward": {
        const isDone = [
          "Fully Received",
          "Cancelled",
          "Closed (Inward + Cancelled)",
        ].includes(row.status);
        return !isDone && row.pendingInward > 0 ? (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs">
            {row.pendingInward} pending
          </span>
        ) : (
          <span className="text-xs text-gray-600">—</span>
        );
      }
      case "status":
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${statusBadgeCls(row.status)}`}
          >
            {row.status}
          </span>
        );
      default:
        return <span className="text-xs text-gray-600">{row[key] ?? "—"}</span>;
    }
  }

  // ─── tree renderer ─────────────────────────────────────────────────────────
  const QTY_KEYS = [
    "poQty",
    "inwardQty",
    "cancelQty",
    "returnQty",
    "billedQty",
    "balanceQty",
  ];

  let rowIndex = 0;
  // globalSno tracks absolute serial number across pages
  const globalSnoStart = (safePage - 1) * PAGE_SIZE;

  function renderNode(node, vc, localIdx) {
    if (node._group) {
      const gid = `${node._key}:${node._val}:${node._depth}`;
      const col = COLUMNS.find((c) => c.key === node._key);

      // ── compute qty totals for this group ──────────────────────────────────
      function collectRows(n) {
        if (n._group) return n._children.flatMap(collectRows);
        return [n];
      }
      const groupRows = collectRows(node);
      const qtyTotals = {};
      QTY_KEYS.forEach((k) => {
        qtyTotals[k] = groupRows.reduce(
          (s, r) => s + (parseFloat(r[k]) || 0),
          0,
        );
      });

      return (
        <React.Fragment key={gid}>
          <tr className="bg-indigo-50 hover:bg-indigo-100">
            {/* S.No cell for group row — blank */}
            <td className="px-2 py-1.5 border-r border-b border-gray-200 w-10 text-center text-xs text-gray-400" />
            {/* expand col — hidden in print */}
            <td className="col-expand px-2 border-r border-b border-gray-200 w-8" />
            <td
              colSpan={vc.length + 1}
              className="px-3 py-2 text-xs font-medium text-indigo-700 border-b border-gray-200"
              style={{ paddingLeft: `${node._depth * 18 + 12}px` }}
            >
              <button
                onClick={() => toggleGroup(gid)}
                className="mr-2 text-indigo-500 hover:text-indigo-700"
              >
                {collapsed[gid] ? "▶" : "▼"}
              </button>
              {col?.label || node._key}:{" "}
              <strong>{node._val || "(blank)"}</strong>
              <span className="ml-2 text-indigo-400 font-normal">
                — {node._count} item{node._count !== 1 ? "s" : ""}
              </span>
              {/* qty summary badges */}
              <span className="ml-3 inline-flex flex-wrap gap-2">
                {QTY_KEYS.filter((k) => qtyTotals[k] > 0).map((k) => {
                  const label = COLUMNS.find((c) => c.key === k)?.label || k;
                  return (
                    <span
                      key={k}
                      className="bg-white border border-indigo-200 text-indigo-600 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    >
                      {label}: {fmt2(qtyTotals[k])}
                    </span>
                  );
                })}
              </span>
            </td>
          </tr>
          {!collapsed[gid] &&
            node._children.map((child, ci) => renderNode(child, vc, ci))}
        </React.Fragment>
      );
    }

    const r = node;
    const stripe = rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
    const isOverdue = r.dueAlert === "overdue";
    const sno = globalSnoStart + rowIndex + 1;
    rowIndex++;

    return (
      <React.Fragment key={r.id}>
        <tr
          className={`${isOverdue ? "row-overdue bg-red-50 hover:bg-red-100" : `${stripe} hover:bg-indigo-50`} transition-colors`}
        >
          {/* S.No */}
          <td className="px-2 py-1.5 w-10 text-center border-r border-b border-gray-100 text-xs text-gray-400 select-none">
            {sno}
          </td>
          {/* Expand toggle */}
          <td
            className={`col-expand px-2 py-1.5 w-8 border-r border-b border-gray-100 ${isOverdue ? "border-l-2 border-l-red-500" : ""}`}
          >
            <button
              onClick={() => toggleExpand(r.id)}
              className="text-gray-400 hover:text-gray-700 text-xs w-5 h-5 flex items-center justify-center"
            >
              {expanded[r.id] ? "▼" : "▶"}
            </button>
          </td>
          {vc.map((col) => (
            <td
              key={col.key}
              className={`px-2.5 py-1.5 whitespace-nowrap border-r border-b border-gray-100 last:border-r-0
                  ${col.key === "inwardQty" ? "col-inward" : ""}
    ${col.key === "inwardQty" ? "col-inward" : ""}
    ${["poQty", "inwardQty", "cancelQty", "returnQty", "billedQty", "balanceQty"].includes(col.key) ? "col-qty" : ""}`}
            >
              {renderCellValue(r, col.key)}
            </td>
          ))}
        </tr>

        {/* ── expanded detail with full border ────────────────────────────── */}
        {expanded[r.id] && (
          <tr className={stripe}>
            <td colSpan={vc.length + 2} className="p-0">
              <div className="mx-2 my-1.5 border-2 border-indigo-300 rounded-xl overflow-hidden shadow-sm ring-1 ring-indigo-100">
                <ExpandedRowDetail row={r} />
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  }

  if (isLoading || isFetching)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading purchase report…
      </div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        Failed to load report. Please try again.
      </div>
    );

  // ─── Excel export ───────────────────────────────────────────────────────────
  function exportExcel() {
    const keys = colOrder;
    const labels = keys.map(
      (k) => COLUMNS.find((c) => c.key === k)?.label || k,
    );

    function fmtExcelDate(d) {
      if (!d) return "—";
      const dt = new Date(d);
      if (isNaN(dt)) return String(d);
      return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
    }

    const RIGHT_KEYS = new Set([
      "poQty",
      "inwardQty",
      "cancelQty",
      "returnQty",
      "billedQty",
      "balanceQty",
      "pendingInward",
    ]);
    const DATE_KEYS = new Set(["docDate", "dueDate"]);

    const BORDER = {
      top: { style: "thin", color: { rgb: "E5E7EB" } },
      bottom: { style: "thin", color: { rgb: "E5E7EB" } },
      left: { style: "thin", color: { rgb: "E5E7EB" } },
      right: { style: "thin", color: { rgb: "E5E7EB" } },
    };

    function cell(value, opts = {}) {
      const {
        bold = false,
        fontColor = "1F2937",
        fgColor = null,
        align = "left",
        fontSize = 9,
        indent = 1,
        numFmt = null,
      } = opts;
      const fill = fgColor
        ? { fgColor: { rgb: fgColor }, patternType: "solid" }
        : { patternType: "none" };
      const c = {
        v: value ?? "",
        t: typeof value === "number" ? "n" : "s",
        s: {
          font: {
            bold,
            color: { rgb: fontColor },
            sz: fontSize,
            name: "Arial",
          },
          fill,
          alignment: {
            horizontal: align,
            vertical: "center",
            indent,
            wrapText: false,
          },
          border: BORDER,
        },
      };
      if (numFmt) c.z = numFmt;
      return c;
    }

    // All qty cells now use fixed 2dp — no UOM logic
    function qtyCell(k, row, bg = null) {
      const raw = row[k];
      const numVal = typeof raw === "number" ? raw : parseFloat(raw) || 0;
      // if value is 0 — same style as inward qty (plain gray)
      if (numVal === 0) {
        return cell(numVal, {
          fontColor: "000000",
          bold: false,
          align: "right",
          indent: 0,
          numFmt: EXCEL_NUM_FMT,
          fgColor: bg, // ← this was missing
        });
      }
      const colorMap = {
        cancelQty: numVal > 0 ? "DC2626" : "6B7280",
        returnQty: numVal > 0 ? "92400E" : "6B7280",
        billedQty:
          row.billedQty >= row.inwardQty && row.inwardQty > 0
            ? "15803D"
            : row.billedQty > 0
              ? "D97706"
              : "9CA3AF",
        balanceQty: numVal > 0 ? "D97706" : "6B7280",
      };
      return cell(numVal, {
        fontColor: colorMap[k] || "1F2937",
        bold: ["billedQty", "balanceQty"].includes(k) && numVal > 0,
        align: "right",
        indent: 0,
        numFmt: EXCEL_NUM_FMT,
        fgColor: bg,
      });
    }

    function dueStatusCell(row, bg = null) {
      const colorMap = {
        overdue: "DC2626",
        soon: "D97706",
        done: "6B7280",
        ok: "16A34A",
      };
      return cell(String(row.dueStatus ?? "—"), {
        fontColor: colorMap[row.dueAlert] || "374151",
        bold: true,
        fgColor: bg,
      });
    }
    function poTypeCell(row, bg = null) {
      return cell(String(row.poType ?? "—"), {
        fontColor: row.poType === "ORDER" ? "1D4ED8" : "374151",
        bold: row.poType === "ORDER",
        fgColor: bg,
      });
    }
    function inwardTypeCell(row, bg = null) {
      const colorMap = {
        "Order Purchase Inward": "3730A3",
        "General Purchase Inward": "0D7377",
        "Direct Inward": "9A3412",
      };
      return cell(String(row.inwardType ?? "—"), {
        fontColor: colorMap[row.inwardType] || "374151",
        bold: !!colorMap[row.inwardType],
        fgColor: bg,
      });
    }
    function statusCell(row, bg = null) {
      const colorMap = {
        "Fully Received": "15803D",
        "Partially Received": "1D4ED8",
        "Partially Received & Cancelled": "DC2626",
        "Closed (Inward + Cancelled)": "DC2626",
        Cancelled: "DC2626",
        "Partially Cancelled": "DC2626",
        Pending: "D97706",
      };
      return cell(String(row.status ?? "—"), {
        fontColor: colorMap[row.status] || "374151",
        bold: true,
        fgColor: bg,
      });
    }

    // S.No column prepended
    const allKeys = ["sno", ...keys];
    const allLabels = ["S.No", ...labels];

    const allSheetRows = [];
    const GROUP_BG = ["F6F6F6", "F0F0F0", "EBEBEB", "E5E5E5"];
    let dataRowCount = 0;

    function flattenNode(node, depth) {
      if (node._group) {
        const col = COLUMNS.find((c) => c.key === node._key);

        // group qty totals
        function collectRows(n) {
          return n._group ? n._children.flatMap(collectRows) : [n];
        }
        const gRows = collectRows(node);
        const qtyTotals = {};
        QTY_KEYS.forEach((k) => {
          qtyTotals[k] = gRows.reduce((s, r) => s + (parseFloat(r[k]) || 0), 0);
        });
        const qtyStr = QTY_KEYS.filter((k) => qtyTotals[k] > 0)
          .map(
            (k) =>
              `${COLUMNS.find((c) => c.key === k)?.label || k}: ${Number(qtyTotals[k]).toFixed(3)}`,
          )
          .join("  |  ");

        const label = `${col?.label || node._key}: ${node._val || "(blank)"}  —  ${node._count} item${node._count !== 1 ? "s" : ""}${qtyStr ? "  |  " + qtyStr : ""}`;
        const bg = GROUP_BG[depth] || "F6F6F6";
        const fs = depth === 0 ? 10 : 9;

        // S.No cell blank for group; label at depth+1 offset (accounting for sno col)
        const groupRow = allKeys.map((_, ci) => {
          const labelColIndex = depth + 1; // +1 because sno is col 0
          return cell(ci === labelColIndex ? label : "", {
            fontColor: "1F2937",
            fgColor: bg,
            align: "left",
            fontSize: fs,
            indent: 1,
          });
        });

        allSheetRows.push({ cells: groupRow, isGroup: true, depth: depth + 1 });
        node._children.forEach((child) => flattenNode(child, depth + 1));
      } else {
        const r = node;
        dataRowCount++;
        const isOdd = dataRowCount % 2 === 1;
        const isOverdue = r.dueAlert === "overdue";
        const bg = isOverdue ? "FEF2F2 " : isOdd ? "FFFFFF" : "F9FAFB";

        const dataRow = allKeys.map((k, ki) => {
          if (k === "sno")
            return cell(dataRowCount, {
              fontColor: "9CA3AF",
              align: "center",
              indent: 0,
              fgColor: bg,
            });
          if (DATE_KEYS.has(k))
            return cell(fmtExcelDate(r[k]), { fgColor: bg });
          if (k === "dueStatus") return dueStatusCell(r, bg); // ← pass bg
          if (k === "poType") return poTypeCell(r, bg); // ← pass bg
          if (k === "inwardType") return inwardTypeCell(r, bg); // ← pass bg
          if (k === "status") return statusCell(r, bg); // ← pass bg
          if (RIGHT_KEYS.has(k)) return qtyCell(k, r, bg);
          if (k === "docId")
            return cell(String(r[k] ?? ""), {
              fontColor: "1F2937",
              bold: false,

              fgColor: bg,
            });
          if (k === "supplier")
            return cell(String(r[k] ?? ""), {
              fontColor: "1F2937",
              bold: false,

              fgColor: bg,
            });
          return cell(String(r[k] ?? ""), { fgColor: bg });
        });

        allSheetRows.push({ cells: dataRow, isGroup: false, depth: 0 });
      }
    }

    if (groupKeys.length > 0) {
      buildGroups(sorted, groupKeys, groupDirs).forEach((n) =>
        flattenNode(n, 0),
      );
    } else {
      sorted.forEach((r) => flattenNode(r, 0));
    }

    const headerRow = allLabels.map((label, i) =>
      cell(label, {
        bold: true,
        fgColor: "F3F4F6", // ← change this
        fontColor: "000000",
        align:
          RIGHT_KEYS.has(allKeys[i]) || allKeys[i] === "sno"
            ? "center"
            : "left",
        fontSize: 10,
        indent: 1,
      }),
    );

    const wsData = [headerRow, ...allSheetRows.map((r) => r.cells)];
    const ws = XLSXStyle.utils.aoa_to_sheet(
      wsData.map((row) => row.map((c) => c.v)),
    );

    wsData.forEach((row, ri) => {
      row.forEach((c, ci) => {
        const addr = XLSXStyle.utils.encode_cell({ r: ri, c: ci });
        ws[addr] = { ...(ws[addr] || {}), ...c };
        if (c.z) ws[addr].z = c.z;
      });
    });

    const merges = [];
    allSheetRows.forEach((row, i) => {
      if (row.isGroup) {
        const ri = i + 1;
        merges.push({
          s: { r: ri, c: row.depth },
          e: { r: ri, c: allKeys.length - 1 },
        });
      }
    });
    if (merges.length > 0) ws["!merges"] = merges;

    const COL_WIDTHS = {
      sno: 6,
      docId: 20,
      docDate: 14,
      dueDate: 14,
      dueStatus: 16,
      supplier: 55,
      poType: 16,
      inwardType: 30,
      branch: 18,
      poQty: 13,
      inwardQty: 15,
      cancelQty: 13,
      returnQty: 13,
      billedQty: 13,
      balanceQty: 15,
      pendingInward: 16,
      status: 30,
    };
    ws["!cols"] = allKeys.map((k) => ({ wch: COL_WIDTHS[k] || 14 }));
    ws["!rows"] = [
      { hpt: 24 },
      ...allSheetRows.map((r) => ({ hpt: r.isGroup ? 18 : 17 })),
    ];
    ws["!freeze"] = {
      xSplit: 0,
      ySplit: 1,
      topLeftCell: "A2",
      activePane: "bottomLeft",
    };

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, "Purchase Report");
    const today = new Date().toLocaleDateString("en-IN").replace(/\//g, "-");
    XLSXStyle.writeFile(wb, `Purchase_Report_${today}.xlsx`);
  }

  // ─── JSX ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── print styles ──────────────────────────────────────────────────── */}
      {/* <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .purchase-report-print, .purchase-report-print * { visibility: visible !important; }
          .purchase-report-print { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
          .purchase-report-table { overflow: visible !important; height: auto !important; }
          table { width: 100% !important; page-break-inside: auto; font-size: 9pt; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style> */}

      <style>{`
  @media print {
    body * { visibility: hidden !important; }
    .purchase-report-print, .purchase-report-print * { visibility: visible !important; }
    .purchase-report-print { position: absolute; top: 0; left: 0; width: 100%; padding: 0; }

    .no-print { display: none !important; }
    .print-header { display: flex !important; }
    .print-only-inline { display: inline-flex !important; }
    .print-only-block  { display: block !important; }
    .print-hide        { display: none !important; }

    .purchase-report-table {
      overflow: visible !important;
      height: auto !important;
      max-height: none !important;
      border: none !important;
    }

    .inward-bar { display: none !important; }
    .inward-pct { display: none !important; }
    .inward-num { display: block !important; width: 100% !important; text-align: right !important; min-width: unset !important; }

    /* hide expand column — no border override so it doesn't bleed */
    .col-expand { display: none !important; width: 0 !important; min-width: 0 !important; max-width: 0 !important; padding: 0 !important; overflow: hidden !important; }

    thead button { display: none !important; }

    table { width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; font-size: 8pt; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; page-break-after: auto; }

    /* unified border for all cells including th */
    th, td {
       border: 1px solid #374151 !important;  
      padding: 3px 5px !important;
      white-space: normal !important;
      word-break: break-word !important;
    }

    th {
      background-color: #F3F4F6 !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      border: 1px solid #374151 !important;  /* ← darker border for th */
      outline: 1px solid #374151 !important;
    }

    tr.row-overdue td {
      background-color: #FFF5F5 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    th.col-inward, td.col-inward {
      width: 65px !important;
      min-width: 65px !important;
      max-width: 65px !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
      text-align: right !important;
    }

    th.col-inwardtype, td.col-inwardtype {
      width: 55px !important;
      min-width: 55px !important;
      max-width: 55px !important;
      text-align: center !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
      overflow: visible !important;
    }

    td.col-qty { text-align: right !important; }

    @page { size: A4 landscape; margin: 8mm 10mm; }
  }

  @media screen {
    .print-header      { display: none; }
    .print-only-inline { display: none; }
    .print-only-block  { display: none; }
    .print-only        { display: none; }
  }
`}</style>

      <div
        className="p-4 space-y-3 purchase-report-print overflow-y-auto"
        style={{ height: "90vh" }}
      >
        {/* top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white py-0.5 px-2 rounded-lg no-print">
          <h2 className="text-base font-medium text-gray-800">
            Purchase Report
          </h2>
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="h-8 px-3 text-xs border border-green-300 rounded-lg text-green-600 hover:bg-green-50"
            >
              Download Excel
            </button>
            <button
              onClick={() => {
                const today = new Date()
                  .toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                  .replace(/\//g, "-");
                const prev = document.title;
                document.title = `Purchase Report ${today}`;
                window.print();
                document.title = prev; // restore after print
              }}
              className="h-8 px-3 text-xs border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
            >
              Print PDF
            </button>
          </div>
        </div>

        {/* print header (visible only in print) */}
        {/* print header — logo left, title centre, date right */}
        <div
          className="print-header items-center justify-between mb-3 pb-2"
          style={{ borderBottom: "2px solid #1E3A5F" }}
        >
          <img
            src={mpLogo}
            alt="Muthu Printers"
            style={{ height: "52px", objectFit: "contain" }}
          />
          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                fontSize: "16pt",
                fontWeight: "800",
                letterSpacing: "0.1em",
                color: "#1E3A5F",
              }}
            >
              PURCHASE REPORT
            </div>
          </div>
          <div style={{ textAlign: "right", minWidth: "120px" }}>
            <div style={{ fontSize: "8pt", color: "#6B7280" }}>
              {/* Downloaded on */}
            </div>
            <div
              style={{ fontSize: "10pt", fontWeight: "700", color: "#111827" }}
            >
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
        {/* print-only inward type legend */}
        <div
          className="print-only-block mb-2 p-2"
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            fontSize: "8pt",
          }}
        >
          <strong style={{ color: "#1E3A5F" }}>Inward Type: </strong>
          {Object.entries(INWARD_SHORT).map(([full, short]) => (
            <span key={short} style={{ marginRight: "16px" }}>
              <strong>{short}</strong> = {full}
            </span>
          ))}
        </div>
        {/* summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 no-print">
          {[
            {
              label: "Total POs",
              val: metrics.total,
              color: "text-gray-700",
              bg: "bg-gray-100",
              icon: (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 12h6M9 16h4" />
                </svg>
              ),
            },
            {
              label: "Overdue",
              val: metrics.overdue,
              color: "text-red-700",
              bg: "bg-red-50",
              icon: (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              ),
            },
            {
              label: "Due soon",
              val: metrics.soon,
              color: "text-amber-700",
              bg: "bg-amber-50",
              icon: (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
            },
            {
              label: "Fully received",
              val: metrics.fullR,
              color: "text-green-700",
              bg: "bg-green-50",
              icon: (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              ),
            },
            {
              label: "Total balance qty",
              val: fmt2(metrics.totalBal),
              color: "text-red-700",
              bg: "bg-red-50",
              icon: (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <path d="M3.3 7l8.7 5 8.7-5M12 22V12" />
                </svg>
              ),
            },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm"
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${m.bg} ${m.color}`}
              >
                {m.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 leading-tight truncate">
                  {m.label}
                </p>
                <p
                  className={`text-lg font-semibold leading-tight mt-0.5 ${m.color}`}
                >
                  {m.val}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* active filter chips */}
        {Object.keys(colFilters).length > 0 && (
          <div className="flex gap-2 flex-wrap no-print">
            {Object.entries(colFilters).map(([k, vals]) => {
              const col = COLUMNS.find((c) => c.key === k);
              const allV = uniqueVals[k] || [];
              const summary =
                vals.size === 1
                  ? [...vals][0]
                  : `${vals.size} of ${allV.length} selected`;
              return (
                <span
                  key={k}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-0.5 text-xs"
                >
                  {col?.label}: <strong>{summary}</strong>
                  <button
                    onClick={() => removeFilterChip(k)}
                    className="text-blue-400 hover:text-blue-700 text-sm leading-none"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* group-by bar */}
        <div
          className="min-h-10 bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-xl flex items-center px-3 py-2 gap-2 flex-wrap no-print"
          onDragOver={onGbDragOver}
          onDrop={onGbDrop}
          onDragLeave={() => {
            dragGbOver.current = false;
          }}
        >
          {groupKeys.length === 0 ? (
            <span className="text-xs text-indigo-400">
              Drag a column header here to group by that column
            </span>
          ) : (
            groupKeys.map((k) => {
              const col = COLUMNS.find((c) => c.key === k);
              return (
                <span
                  key={k}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-full px-3 py-1 text-xs font-medium"
                >
                  {col?.label}
                  <button
                    onClick={() => toggleGroupDir(k)}
                    className="opacity-80 hover:opacity-100"
                  >
                    {groupDirs[k] === 1 ? "↑" : "↓"}
                  </button>
                  <button
                    onClick={() => removeGroupKey(k)}
                    className="opacity-80 hover:opacity-100 text-sm leading-none"
                  >
                    ×
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* ── TABLE ──────────────────────────────────────────────────────────── */}
        <div
          className="border border-gray-400 rounded-xl overflow-auto  purchase-report-table"
          style={{ height: "60vh" }}
        >
          <table
            className="w-full table-fixed border-collapse"
            style={{ width: "1740px" }}
          >
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {/* S.No header */}
                <th
                  style={{ width: "40px", minWidth: "40px" }}
                  className="px-2 py-2.5 text-center text-xs font-medium text-black border-r border-b border-gray-200 select-none"
                >
                  S.No
                </th>
                {/* expand toggle header */}
                <th
                  style={{ width: "32px", minWidth: "32px" }}
                  className="col-expand px-2 border-r border-b border-gray-200"
                />

                {/* {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={(e) => onColDragStart(e, col.key)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onColDrop(e, col.key)}
                    style={{ width: col.w, minWidth: col.w }}
                    className={`px-2.5 py-2.5 text-center text-xs font-medium text-black whitespace-nowrap cursor-grab select-none relative border-r border-b border-gray-200 last:border-r-0 
                      ${col.key === "inwardType" ? "col-inwardtype" : ""}
                      ${col.key === "inwardQty" ? "col-inward" : ""}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="flex-1">
                        {col.label}
                        {sortKey === col.key && (
                          <span className="text-indigo-500 ml-1">
                            {sortDir === 1 ? "↑" : "↓"}
                          </span>
                        )}
                        {colFilters[col.key] && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1 align-middle" />
                        )}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuCol(
                            openMenuCol === col.key ? null : col.key,
                          );
                        }}
                        className={`text-[11px] px-0.5 rounded hover:bg-blue-100 hover:text-blue-600 ${colFilters[col.key] ? "text-indigo-500" : "text-gray-400"}`}
                      >
                        ⇅
                      </button>
                    </div>
                    {openMenuCol === col.key && (
                      <ColumnFilterMenu
                        colKey={col.key}
                        allValues={uniqueVals[col.key] || []}
                        activeFilter={colFilters[col.key]}
                        onApply={handleFilterApply}
                        onSort={handleSort}
                        onClose={() => setOpenMenuCol(null)}
                      />
                    )}
                  </th>
                ))} */}
                {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={(e) => onColDragStart(e, col.key)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onColDrop(e, col.key)}
                    style={{ width: col.w, minWidth: col.w }}
                    className={`px-2.5 py-2.5 text-center text-xs font-medium text-black whitespace-nowrap cursor-grab select-none relative border-r border-b border-gray-200 last:border-r-0 
      ${col.key === "inwardType" ? "col-inwardtype" : ""}
      ${col.key === "inwardQty" ? "col-inward" : ""}`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="flex-1">
                        {/* screen: full label | print: short label */}
                        <span className="print-hide">{col.label}</span>
                        {col.key === "inwardType" && (
                          <span className="print-only-inline">Inw Type</span>
                        )}
                        {col.key !== "inwardType" && (
                          <span className="print-only-inline">{col.label}</span>
                        )}
                        {sortKey === col.key && (
                          <span className="text-indigo-500 ml-1 print-hide">
                            {sortDir === 1 ? "↑" : "↓"}
                          </span>
                        )}
                        {colFilters[col.key] && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1 align-middle print-hide" />
                        )}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuCol(
                            openMenuCol === col.key ? null : col.key,
                          );
                        }}
                        className={`text-[11px] px-0.5 rounded hover:bg-blue-100 hover:text-blue-600 ${colFilters[col.key] ? "text-indigo-500" : "text-gray-400"}`}
                      >
                        ⇅
                      </button>
                    </div>
                    {openMenuCol === col.key && (
                      <ColumnFilterMenu
                        colKey={col.key}
                        allValues={uniqueVals[col.key] || []}
                        activeFilter={colFilters[col.key]}
                        onApply={handleFilterApply}
                        onSort={handleSort}
                        onClose={() => setOpenMenuCol(null)}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {tree.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleCols.length + 2}
                    className="text-center py-10 text-sm text-gray-400"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                (() => {
                  rowIndex = 0;
                  return tree.map((node) => renderNode(node, visibleCols));
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* ── pagination + footer ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3 text-xs text-gray-600 no-print">
          <span>
            Showing {sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length}{" "}
            records
            {filtered.length < allData.length &&
              ` (filtered from ${allData.length})`}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={safePage === 1}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 text-gray-500 text-xs"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 text-gray-500 text-xs"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 || p === totalPages || Math.abs(p - safePage) <= 1,
                )
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`e${i}`} className="px-1 text-gray-300">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-7 min-w-[28px] px-1.5 rounded-lg border text-xs font-medium transition-colors ${p === safePage ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 text-gray-500 text-xs"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 text-gray-500 text-xs"
              >
                »
              </button>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-200 inline-block" />
              Overdue
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-200 inline-block" />
              Due soon
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-200 inline-block" />
              On track
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
