import React, { useMemo, useRef, useState } from "react";
import { useGetSalesReportQuery } from "../../../redux/uniformService/SalesDeliveryService";
import ColumnFilterMenu from "./ColumnFilterMenu";
import ExpandedRowDetail from "./ExpandedRowDetail";
import XLSXStyle from "xlsx-js-style";
import mpLogo from "../../../assets/gwynt_logo.png";
import {
  COLUMNS,
  QTY_KEYS,
  buildGroups,
  fmt3,
  fmtInt,
  fmtDate,
} from "./salesReportUtils";

const PAGE_SIZE = 40;
const EXCEL_NUM_FMT = "#,##0.000";

export default function SalesReport() {
  const [queryParams] = useState({ branchId: undefined, finYearId: undefined });
  const [page, setPage] = useState(1);
  const {
    data: apiData,
    isLoading,
    isFetching,
    isError,
  } = useGetSalesReportQuery({ ...queryParams, page, limit: PAGE_SIZE });

  const allData = useMemo(() => apiData?.data || [], [apiData]);

  const [colOrder, setColOrder] = useState(() => COLUMNS.map((c) => c.key));
  const [groupKeys, setGroupKeys] = useState([]);
  const [groupDirs, setGroupDirs] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [colFilters, setColFilters] = useState({});
  const [openMenuCol, setOpenMenuCol] = useState(null);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [expanded, setExpanded] = useState({});

  const dragColRef = useRef(null);
  const dragGbOver = useRef(false);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ── unique filter values ────────────────────────────────────────────────────
  const uniqueVals = useMemo(() => {
    const map = {};
    COLUMNS.forEach(({ key }) => {
      map[key] = [...new Set(allData.map((r) => String(r[key] ?? "")))].sort();
    });
    return map;
  }, [allData]);

  // ── filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allData.filter((r) => {
      for (const [k, allowed] of Object.entries(colFilters)) {
        if (!allowed) continue;
        if (!allowed.has(String(r[k] ?? ""))) return false;
      }
      return true;
    });
  }, [allData, colFilters]);

  // ── sort ───────────────────────────────────────────────────────────────────
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

  // ── pagination ─────────────────────────────────────────────────────────────
  const totalBackendItems = apiData?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalBackendItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted; // API handles pagination if server-side, if not, use slice

  const tree = useMemo(
    () =>
      groupKeys.length
        ? buildGroups(paginated, groupKeys, groupDirs)
        : paginated,
    [paginated, groupKeys, groupDirs],
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
    setPage(1);
  }
  function toggleGroupDir(k) {
    setGroupDirs((p) => ({ ...p, [k]: p[k] === 1 ? -1 : 1 }));
    setPage(1);
  }

  // drag drop columns
  function onColDragStart(e, colKey) {
    dragColRef.current = colKey;
  }
  function onColDragEnd(e) {
    dragColRef.current = null;
  }
  function onColDrop(e, targetKey) {
    e.preventDefault();
    const draggedKey = dragColRef.current;
    if (!draggedKey || draggedKey === targetKey) return;
    setColOrder((prev) => {
      const arr = [...prev];
      const i1 = arr.indexOf(draggedKey);
      const i2 = arr.indexOf(targetKey);
      if (i1 === -1 || i2 === -1) return prev;
      arr.splice(i1, 1);
      arr.splice(i2, 0, draggedKey);
      return arr;
    });
  }
  function onGbDragOver(e) {
    e.preventDefault();
    dragGbOver.current = true;
  }
  function onGbDrop(e) {
    e.preventDefault();
    dragGbOver.current = false;
    const draggedKey = dragColRef.current;
    if (
      draggedKey &&
      String(draggedKey) !== "null" &&
      !groupKeys.includes(draggedKey)
    ) {
      setGroupKeys((p) => [...p, draggedKey]);
      setGroupDirs((p) => ({ ...p, [draggedKey]: 1 }));
      setPage(1);
    }
  }

  // ─── render node ───────────────────────────────────────────────────────────
  let rowIndex = 0;
  let globalSnoStart = (safePage - 1) * PAGE_SIZE;

  function renderCellValue(r, key) {
    const v = r[key];
    if (key === "docDate") {
      return <span className="text-xs text-gray-600">{fmtDate(v)}</span>;
    }
    if (QTY_KEYS.includes(key)) {
      const numVal = parseFloat(v) || 0;
      return (
        <div className={`text-right w-full text-xs font-medium text-black`}>
          {key === "totalValue" ? fmt3(numVal) : fmtInt(numVal)}
        </div>
      );
    }
    return <span className="text-xs text-gray-600">{String(v ?? "—")}</span>;
  }

  function renderNode(node, vc) {
    if (node._group) {
      const gid = node._key + "-" + node._val;
      const isCol = collapsed[gid];
      const col = COLUMNS.find((c) => c.key === node._key);

      const qtyTotals = {};
      QTY_KEYS.forEach((k) => {
        qtyTotals[k] = (function sum(n) {
          if (!n._group) return parseFloat(n[k]) || 0;
          return n._children.reduce((s, child) => s + sum(child), 0);
        })(node);
      });

      const qtyStr = QTY_KEYS.filter((k) => qtyTotals[k] !== 0)
        .map(
          (k) =>
            `${COLUMNS.find((c) => c.key === k)?.label || k}: ${k === "totalValue" ? fmt3(qtyTotals[k]) : fmtInt(qtyTotals[k])}`,
        )
        .join("  |  ");

      const labelStr = `${col?.label || node._key}: ${node._val || "(blank)"}`;
      const countStr = `${node._count} item${node._count !== 1 ? "s" : ""}`;
      const pl = node._depth * 20;

      return (
        <React.Fragment key={gid}>
          <tr className="bg-indigo-50/40 border-b border-indigo-100/50 hover:bg-indigo-50 transition-colors group">
            <td
              colSpan={vc.length + 2}
              className="px-3 py-1.5"
              style={{ paddingLeft: `${pl + 12}px` }}
            >
              <div className="flex items-center text-xs">
                <button
                  onClick={() => toggleGroup(gid)}
                  className="w-5 h-5 flex items-center justify-center mr-2 rounded hover:bg-indigo-100 text-indigo-500 transition-colors"
                >
                  {isCol ? "▶" : "▼"}
                </button>
                <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1 items-center">
                  <span className="font-semibold text-gray-800">
                    {labelStr}
                  </span>
                  <span className="text-gray-400 font-medium">—</span>
                  <span className="text-indigo-600 font-medium bg-white px-2 py-0.5 rounded-full border border-indigo-100 shadow-sm">
                    {countStr}
                  </span>
                  {qtyStr && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="text-emerald-700 font-medium">
                        {qtyStr}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </td>
          </tr>
          {!isCol && node._children.map((c) => renderNode(c, vc))}
        </React.Fragment>
      );
    }

    const r = node;
    const isOdd = rowIndex % 2 === 1;
    const stripe = isOdd ? "bg-white" : "bg-gray-50/30";
    const sno = globalSnoStart + rowIndex + 1;
    rowIndex++;

    const isExpanded = expanded[r.id];

    return (
      <React.Fragment key={r.id}>
        <tr
          className={`${isExpanded ? "bg-blue-50/30" : stripe} hover:bg-indigo-50 transition-colors`}
        >
          <td
            className={`w-8 px-2 py-1 text-center select-none ${isExpanded ? "border-l-2 border-t-2 border-blue-400" : "border-r border-b border-gray-100"}`}
          >
            <button
              onClick={() => toggleExpand(r.id)}
              className="text-gray-400 hover:text-indigo-600 transition-colors p-0.5 rounded"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          </td>
          <td
            className={`py-0.5 text-center text-xs text-gray-400 select-none ${isExpanded ? "border-t-2 border-blue-400" : "border-r border-b border-gray-100"}`}
          >
            {sno}
          </td>

          {vc.map((col, cIdx) => {
            const isLast = cIdx === vc.length - 1;
            return (
              <td
                key={col.key}
                className={`px-2.5 py-0.5 whitespace-nowrap 
                  ${isExpanded ? `border-t-2 border-blue-400 ${isLast ? "border-r-2" : ""}` : `border-r border-b border-gray-100 ${isLast ? "border-r-0" : ""}`}
                  ${QTY_KEYS.includes(col.key) ? "col-qty" : ""}`}
              >
                {renderCellValue(r, col.key)}
              </td>
            );
          })}
        </tr>

        {isExpanded && (
          <tr>
            <td colSpan={vc.length + 2} className="p-0 border-0">
              <div className="border-x-2 border-b-2 border-blue-400 rounded-b-md shadow-sm bg-white">
                <ExpandedRowDetail row={r} />
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  }

  // ─── Excel export ───────────────────────────────────────────────────────────
  function exportExcel() {
    const keys = colOrder;
    const labels = keys.map(
      (k) => COLUMNS.find((c) => c.key === k)?.label || k,
    );

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

    const allKeys = ["sno", ...keys];
    const allLabels = ["S.No", ...labels];
    const allSheetRows = [];
    let dataRowCount = 0;

    function flattenNode(node, depth) {
      if (node._group) {
        const col = COLUMNS.find((c) => c.key === node._key);
        const groupRow = allKeys.map((_, ci) =>
          cell(ci === 1 ? `${col?.label || node._key}: ${node._val}` : "", {
            bold: true,
            fgColor: "F3F4F6",
            indent: depth,
          }),
        );
        allSheetRows.push({ cells: groupRow, isGroup: true, depth });
        node._children.forEach((child) => flattenNode(child, depth + 1));
      } else {
        const r = node;
        dataRowCount++;
        const bg = dataRowCount % 2 === 1 ? "FFFFFF" : "F9FAFB";
        const dataRow = allKeys.map((k) => {
          if (k === "sno")
            return cell(dataRowCount, { align: "center", fgColor: bg });
          let v = r[k];
          if (k === "docDate") v = fmtDate(v);
          if (QTY_KEYS.includes(k)) {
            return cell(parseFloat(v) || 0, {
              align: "right",
              fontColor: "15803D",
              bold: true,
              fgColor: bg,
              numFmt: k === "totalValue" ? EXCEL_NUM_FMT : "#,##0",
            });
          }
          return cell(String(v ?? ""), { fgColor: bg });
        });
        allSheetRows.push({ cells: dataRow, isGroup: false });

        // Expanded Row details
        if (r.boxes && r.boxes.length > 0) {
          // Meta row
          const charge = parseFloat(r.carriageCharge) || 0;
          const tax = parseFloat(r.carriageTax) || 0;
          let carriageFinalAmt = 0;
          if (r.carriageTaxType === "Percentage") {
            carriageFinalAmt = charge + (charge * tax) / 100;
          } else if (r.carriageTaxType === "Flat") {
            carriageFinalAmt = charge + tax;
          } else {
            carriageFinalAmt = charge + (charge * tax) / 100;
          }

          const metaRow = [
            cell(""),
            cell(`Delivery Date: ${fmtDate(r.deliveryDate) || "—"}`, { bold: true }),
            cell(`Vehicle No: ${r.vehicleNo || "—"}`, { bold: true }),
            cell(`Weight: ${fmt3(r.weightInKg || 0)}`, { bold: true }),
            cell(`Overall Discount Type: ${r.discountType || "—"}`, {
              bold: true,
            }),
            cell(`Overall Discount Value: ${fmt3(r.discountValue || 0)}`, {
              bold: true,
            }),
            cell(`Carriage Charges: ${charge > 0 ? fmt3(charge) : "—"}`, {
              bold: true,
            }),
            cell(`Carriage Tax Type: ${r.carriageTaxType || "—"}`, {
              bold: true,
            }),
            cell(
              `Carriage Final Amount: ${carriageFinalAmt > 0 ? fmt3(carriageFinalAmt) : "—"}`,
              { bold: true },
            ),
            cell(`Total Value: ${fmt3(r.totalValue || 0)}`, { bold: true }),
          ];
          allSheetRows.push({ cells: metaRow, isGroup: true });

          // Item headers
          const itemHeaders = [
            cell(""),
            cell("Box No", { bold: true, fgColor: "E5E7EB" }),
            cell("Model Name", { bold: true, fgColor: "E5E7EB" }),
            cell("Style No", { bold: true, fgColor: "E5E7EB" }),
            cell("HSN Code", { bold: true, fgColor: "E5E7EB" }),
            cell("Printing Design", { bold: true, fgColor: "E5E7EB" }),
            cell("Cutting Pattern", { bold: true, fgColor: "E5E7EB" }),
            cell("Color", { bold: true, fgColor: "E5E7EB" }),
            cell("Size", { bold: true, fgColor: "E5E7EB" }),
            cell("Price", { bold: true, fgColor: "E5E7EB", align: "right" }),
          ];
          if (!r.isCustomerExport) {
            itemHeaders.push(
              cell("Discount", {
                bold: true,
                fgColor: "E5E7EB",
                align: "right",
              }),
              cell("Taxable Amount", {
                bold: true,
                fgColor: "E5E7EB",
                align: "right",
              }),
              cell("Tax %", { bold: true, fgColor: "E5E7EB", align: "right" }),
              cell("Net Amount", {
                bold: true,
                fgColor: "E5E7EB",
                align: "right",
              }),
            );
          }
          itemHeaders.push(cell("QR Code", { bold: true, fgColor: "E5E7EB", align: "center" }));
          allSheetRows.push({ cells: itemHeaders, isGroup: true });

          r.boxes.forEach((box) => {
            let boxTotalWholesale = 0;
            let boxTotalDiscount = 0;
            let boxTotalTaxable = 0;
            let boxTotalNet = 0;

            box.items.forEach((item) => {
              let currentPrice = item.wholeSalePrice || 0;
              let itemDiscAmt = 0;
              let boxDiscAmt = 0;
              let overallDiscAmt = 0;

              if (item.discountValue) {
                if (item.discountType === "Percentage" || item.discountType === "%") {
                  itemDiscAmt = (currentPrice * item.discountValue) / 100;
                } else {
                  itemDiscAmt = item.discountValue;
                }
              }
              currentPrice -= itemDiscAmt;

              if (box.boxDiscountValue) {
                if (box.boxDiscountType === "Percentage" || box.boxDiscountType === "%") {
                  boxDiscAmt = (currentPrice * box.boxDiscountValue) / 100;
                } else {
                  boxDiscAmt = box.boxDiscountValue / (box.totalBoxItems || 1);
                }
              }
              currentPrice -= boxDiscAmt;

              if (r.discountValue) {
                if (r.discountType === "Percentage" || r.discountType === "%") {
                  overallDiscAmt = (currentPrice * r.discountValue) / 100;
                } else {
                  overallDiscAmt = r.discountValue / (r.totalItems || 1);
                }
              }
              currentPrice -= overallDiscAmt;

              const totalDiscount = itemDiscAmt + boxDiscAmt + overallDiscAmt;
              const taxPercent = item.taxPercent || 0;
              const taxAmt = (currentPrice * taxPercent) / 100;
              const netAmount = currentPrice + taxAmt;

              boxTotalWholesale += item.wholeSalePrice || 0;
              boxTotalDiscount += totalDiscount;
              boxTotalTaxable += currentPrice;
              boxTotalNet += netAmount;

              const rowData = [
                cell(""),
                cell(box.boxNo),
                cell(item.modelName),
                cell(item.styleNo),
                cell(item.hsn || "—"),
                cell(item.printingDesign || "—"),
                cell(item.cuttingPattern || "—"),
                cell(item.color || "—"),
                cell(item.size || "—"),
                cell(parseFloat(item.wholeSalePrice) || 0, { numFmt: EXCEL_NUM_FMT }),
              ];
              if (!r.isCustomerExport) {
                rowData.push(
                  cell(totalDiscount || 0, {
                    numFmt: EXCEL_NUM_FMT,
                    fontColor: "DC2626",
                  }),
                  cell(currentPrice || 0, {
                    numFmt: EXCEL_NUM_FMT,
                  }),
                  cell(taxPercent || 0, {
                    numFmt: EXCEL_NUM_FMT,
                  }),
                  cell(netAmount || 0, {
                    numFmt: EXCEL_NUM_FMT,
                    fontColor: "15803D",
                  }),
                );
              }
              rowData.push(cell(item.qrCode || "—", { align: "center" }));
              allSheetRows.push({ cells: rowData, isGroup: false });
            });

            // Footer row for box
            const footerRow = [
              cell(""),
              cell("Total:", { bold: true, align: "right" }),
              cell(""),
              cell(""),
              cell(""),
              cell(""),
              cell(""),
              cell(""),
              cell(""),
              cell(boxTotalWholesale, { bold: true, numFmt: EXCEL_NUM_FMT }),
            ];
            if (!r.isCustomerExport) {
              footerRow.push(
                cell(-Math.abs(boxTotalDiscount), {
                  bold: true,
                  numFmt: EXCEL_NUM_FMT,
                  fontColor: "DC2626",
                }),
                cell(boxTotalTaxable, { bold: true, numFmt: EXCEL_NUM_FMT }),
                cell("—", { align: "center" }),
                cell(boxTotalNet, {
                  bold: true,
                  numFmt: EXCEL_NUM_FMT,
                  fontColor: "15803D",
                }),
              );
            }
            footerRow.push(cell("")); // Empty cell for QR code in footer
            allSheetRows.push({ cells: footerRow, isGroup: true });
          });
        }
      }
    }

    if (groupKeys.length > 0) {
      buildGroups(sorted, groupKeys, groupDirs).forEach((n) =>
        flattenNode(n, 0),
      );
    } else {
      sorted.forEach((r) => flattenNode(r, 0));
    }

    const headerRow = allLabels.map((label) =>
      cell(label, {
        bold: true,
        fgColor: "F3F4F6",
        align: "center",
        fontSize: 10,
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

    ws["!cols"] = [
      { wch: 8 },  // A
      { wch: 25 }, // B
      { wch: 20 }, // C
      { wch: 30 }, // D
      { wch: 20 }, // E
      { wch: 20 }, // F
      { wch: 15 }, // G
      { wch: 15 }, // H
      { wch: 15 }, // I
      { wch: 15 }, // J
      { wch: 15 }, // K
      { wch: 15 }, // L
      { wch: 10 }, // M
      { wch: 15 }, // N
      { wch: 25 }, // O (QR Code)
    ];

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, "Sales Report");
    const today = new Date().toLocaleDateString("en-IN").replace(/\//g, "-");
    XLSXStyle.writeFile(wb, `Sales_Report_${today}.xlsx`);
  }

  if (isLoading || isFetching)
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading Sales Report…
      </div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm">
        Failed to load report. Please try again.
      </div>
    );

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .stock-report-print, .stock-report-print * { visibility: visible !important; }
          .stock-report-print { position: absolute; top: 0; left: 0; width: 100%; padding: 0; }
          .no-print { display: none !important; }
          .print-header { display: flex !important; }
          .purchase-report-table { overflow: visible !important; height: auto !important; max-height: none !important; border: none !important; }
          thead button { display: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; table-layout: auto !important; font-size: 8pt; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th, td { border: 1px solid #374151 !important; padding: 3px 5px !important; white-space: normal !important; word-break: break-word !important; width: auto !important; min-width: 0 !important; max-width: none !important; }
          th { background-color: #F3F4F6 !important; color: #000000 !important; outline: 1px solid #374151 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          td.col-qty { text-align: right !important; }
          @page { size: A4; margin: 8mm 10mm; }
        }
        @media screen { .print-header { display: none; } }
      `}</style>

      <div
        className="p-4 space-y-3 stock-report-print overflow-y-auto"
        style={{ height: "90vh" }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white py-0.5 px-2 rounded-lg no-print">
          <h2 className="text-base font-medium text-gray-800">Sales Report</h2>
          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="h-8 px-3 text-xs border border-green-300 rounded-lg text-green-600 hover:bg-green-50"
            >
              Download Excel
            </button>
            <button
              onClick={() => window.print()}
              className="h-8 px-3 text-xs border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50"
            >
              Print PDF
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-x-2 py-4 border-b-2 border-black/80 print-header mb-4">
          <div className="flex items-center gap-3">
            <img
              src={mpLogo}
              alt="MP Logo"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                QWYNT
              </h1>
              <div className="text-sm text-gray-500 font-medium">
                SALES REPORT
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", minWidth: "120px" }}>
            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">
              Date
            </div>
            <div className="text-sm font-semibold text-gray-800">
              {todayStr}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-2 no-print">
          {Object.entries(colFilters).map(([k, vals]) => {
            const col = COLUMNS.find((c) => c.key === k);
            const allV = uniqueVals[k] || [];
            const summary =
              vals.size === allV.length
                ? "All"
                : vals.size === 1
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

        <div
          className="min-h-10 bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-xl flex items-center px-3 py-2 gap-2 flex-wrap no-print"
          onDragOver={onGbDragOver}
          onDrop={onGbDrop}
          onDragLeave={() => (dragGbOver.current = false)}
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

        <div
          className="border border-gray-400 rounded-xl overflow-auto purchase-report-table"
          style={{ height: "60vh" }}
        >
          <table
            className="w-full table-fixed border-collapse"
            style={{ width: "1550px" }}
          >
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th
                  style={{ width: "40px", minWidth: "40px" }}
                  className="px-2 py-2.5 border-r border-b border-gray-200"
                />
                <th
                  style={{ width: "60px", minWidth: "60px" }}
                  className="px-2 py-2.5 text-center text-xs font-medium text-black border-r border-b border-gray-200 select-none"
                >
                  S.No
                </th>
                {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    draggable
                    onDragStart={(e) => onColDragStart(e, col.key)}
                    onDragEnd={onColDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onColDrop(e, col.key)}
                    style={{ width: col.w, minWidth: col.w }}
                    className="px-2.5 py-2.5 text-center text-xs font-medium text-black whitespace-nowrap cursor-grab select-none relative border-r border-b border-gray-200 last:border-r-0"
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

        <div className="flex items-center justify-between flex-wrap gap-3 text-xs text-gray-600 no-print">
          <span>
            Showing{" "}
            {paginated.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(
              safePage * PAGE_SIZE,
              (safePage - 1) * PAGE_SIZE + paginated.length,
            )}{" "}
            of {totalBackendItems} records
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
        </div>
      </div>
    </>
  );
}
