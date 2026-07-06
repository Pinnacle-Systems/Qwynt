// ─────────────────────────────────────────────────────────────────────────────
//  ExpandedRowDetail.jsx
//  Fix: each tab now renders ONE shared table for all documents.
//       This ensures all rows share the same column widths.
//       Doc info (docId, date, type) is shown as a spanning group header row
//       inside the same table — not as separate tables per doc.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { fmtDate, dueBadgeCls, formatQtyByUOM } from "../purchaseReportUtils";

const TABS = [
  { key: "po", label: (r) => `PO Items (${r.poItems?.length ?? 0})` },
  { key: "inward", label: (r) => `Inward (${r.inwardDocs?.length ?? 0})` },
  { key: "cancel", label: (r) => `Cancel (${r.cancelDocs?.length ?? 0})` },
  { key: "return", label: (r) => `Return (${r.returnDocs?.length ?? 0})` },
  { key: "bill", label: (r) => `Bill Entry (${r.billDocs?.length ?? 0})` },
];
function fmt3(val) {
  if (val === null || val === undefined) return "—";
  return Number(val).toFixed(3);
}
// Qty / price columns — right-aligned in tbody
const RIGHT_ALIGN = new Set([
  "PO Qty",
  "Inward Qty",
  "Cancel Qty",
  "Return Qty",
  "Balance Qty",
  "Pending to Inward",
  "Billed Qty",
  "Price",
  "Tax %",
  "Discount",
  "Item Discount",
  "Bill Discount", // new discount columns
]);

export default function ExpandedRowDetail({ row }) {
  const [tab, setTab] = useState("po");

  return (
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 text-xs">
      {/* meta */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 mb-3">
        <span>
          Remarks:{" "}
          <strong className="text-gray-700">{row.remarks || "—"}</strong>
        </span>
        <span>
          Balance Qty:{" "}
          <strong
            className={row.balanceQty > 0 ? "text-red-700" : "text-green-700"}
          >
            {row.balanceQty?.toFixed(3)}
          </strong>
        </span>
        <span>
          Due:{" "}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${dueBadgeCls(row.dueAlert)}`}
          >
            {row.dueStatus}
          </span>
        </span>
      </div>

      {/* tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
              tab === t.key
                ? "bg-blue-50 text-blue-700 border-blue-300 font-medium"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label(row)}
          </button>
        ))}
      </div>

      <div>
        {tab === "po" && <POItemsTab row={row} />}
        {tab === "inward" && <InwardTab row={row} />}
        {tab === "cancel" && <CancelTab row={row} />}
        {tab === "return" && <ReturnTab row={row} />}
        {tab === "bill" && <BillTab row={row} />}
      </div>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function itemKey(item) {
  const styleId = item.styleItemId ?? item.StyleItem?.id ?? "";
  const sizeId = item.sizeId ?? item.Size?.id ?? "";
  const colorId = item.colorId ?? item.Color?.id ?? "";
  const uomId = item.uomId ?? item.Uom?.id ?? "";
  return `${styleId}|${sizeId}|${colorId}|${uomId}`;
}

function sumMatchingQty(childItems, poItem, qtyField) {
  const key = itemKey(poItem);
  return childItems.reduce(
    (sum, child) =>
      itemKey(child) === key ? sum + (child[qtyField] || 0) : sum,
    0,
  );
}

function flatItems(docs) {
  return (docs || []).flatMap((d) => d.items || []);
}

function LinkedBadge({ poDocId, color = "green" }) {
  const cls = {
    green: "bg-green-50  text-green-700  border-green-200",
    red: "bg-red-50    text-red-700    border-red-200",
    amber: "bg-amber-50  text-amber-700  border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  }[color];
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[11px] border ${cls}`}
    >
      Linked to {poDocId}
    </span>
  );
}

// ─── SharedTable ──────────────────────────────────────────────────────────────
// One table for ALL documents in a tab — consistent column widths guaranteed.
// docs: array of { meta: ReactNode, rows: any[][] }
// headers: string[]
function SharedTable({ headers, docs, empty }) {
  const hasData = docs.some((d) => d.rows.length > 0);
  if (!hasData)
    return (
      <p className="text-xs text-gray-400 py-2">{empty || "No records"}</p>
    );

  let globalRowIndex = 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table
        className="w-full text-xs border-collapse"
        style={{ tableLayout: "fixed" }}
      >
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap border-b border-r border-gray-200 last:border-r-0 text-center"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map((doc, di) => (
            <React.Fragment key={di}>
              {/* doc group header row — only shown when meta exists (skipped for PO Items tab) */}
              {doc.meta && (
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td
                    colSpan={headers.length}
                    className="px-3 py-1.5 text-xs text-gray-500"
                  >
                    {doc.meta}
                  </td>
                </tr>
              )}
              {/* data rows */}
              {doc.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-3 py-2 text-gray-400 text-center"
                  >
                    No items
                  </td>
                </tr>
              ) : (
                doc.rows.map((cells, ri) => {
                  const stripe =
                    globalRowIndex++ % 2 === 0 ? "bg-white" : "bg-gray-50";
                  return (
                    <tr key={ri} className={stripe}>
                      {cells.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`px-3 py-2 border-b border-r border-gray-100 last:border-r-0 whitespace-nowrap ${
                            RIGHT_ALIGN.has(headers[ci])
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {cell ?? "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── tab: PO Items ────────────────────────────────────────────────────────────
function POItemsTab({ row }) {
  const isDone = [
    "Fully Received",
    "Cancelled",
    "Closed (Inward + Cancelled)",
  ].includes(row.status);
  const allInwardItems = flatItems(row.inwardDocs);
  const allCancelItems = flatItems(row.cancelDocs);
  const allReturnItems = flatItems(row.returnDocs);

  const rows = (row.poItems || []).map((item) => {
    const uomName = item.Uom?.name || "—";
    const qty = item.qty || 0;
    const iq = sumMatchingQty(allInwardItems, item, "inwardQty");
    const cq = sumMatchingQty(allCancelItems, item, "cancelQty");
    const rq = sumMatchingQty(allReturnItems, item, "returnQty");
    const bal = Math.max(0, qty - iq - cq + rq);
    const pend = Math.max(0, qty - iq - cq);

    return [
      item.StyleItem?.name || "—",
      item.Size?.name || "—",
      item.Color?.name || "—",
      item.Gsm?.name || "—",
      uomName,
      fmt3(qty),
      fmt3(iq),
      cq > 0 ? (
        <span className="font-semibold text-red-600">{fmt3(cq)}</span>
      ) : (
        <span className="text-gray-400">0</span>
      ),
      rq > 0 ? (
        <span className="font-semibold text-amber-600">{fmt3(rq)}</span>
      ) : (
        <span className="text-gray-400">0</span>
      ),
      <span
        className={`font-semibold ${bal > 0 ? (row.dueAlert === "overdue" ? "text-red-700" : "text-green-700") : "text-gray-400"}`}
      >
        {fmt3(bal)}
      </span>,
      !isDone && pend > 0 ? (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-full text-[11px] font-medium">
          {fmt3(pend)} pending
        </span>
      ) : (
        <span className="text-gray-400">—</span>
      ),
      `₹${item.price ?? 0}`,
    ];
  });

  // PO Items has no "per-doc" grouping — wrap in single doc entry with no meta
  return (
    <SharedTable
      headers={[
        "Item",
        "Size",
        "Color",
        "GSM",
        "UOM",
        "PO Qty",
        "Inward Qty",
        "Cancel Qty",
        "Return Qty",
        "Balance Qty",
        "Pending to Inward",
        "Price",
      ]}
      docs={[{ meta: null, rows }]}
      empty="No PO items"
    />
  );
}

// ─── tab: Inward ──────────────────────────────────────────────────────────────
function InwardTab({ row }) {
  // Against Invoice inwards show discount + tax (they act as a bill)
  // Delivery inwards show basic item info only
  const headers = [
    "Item",
    "Size",
    "Color",
    "GSM",
    "UOM",
    "PO Qty",
    "Inward Qty",
    "Price", // item-level price
    "Discount Type", // Percentage or Flat
    "Item Discount", // item-level discount value (% or ₹)
    "Tax %", // item-level tax
  ];

  const docs = (row.inwardDocs || []).map((doc) => ({
    meta: (
      <div className="flex flex-wrap gap-3 items-center">
        <span>
          Po Inward No: <strong className="text-gray-700">{doc.docId}</strong>
        </span>
        <span>
          Date:{" "}
          <strong className="text-gray-700">{fmtDate(doc.docDate)}</strong>
        </span>
        <span>
          Type: <strong className="text-gray-700">{doc.inwardType}</strong>
        </span>
        {/* Show receipt type badge — important for Against Invoice */}
        {doc.receiptType && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
              doc.receiptType?.toLowerCase() === "against invoice"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {doc.receiptType}
          </span>
        )}
        {doc.store && (
          <span>
            Location: <strong className="text-gray-700">{doc.store}</strong>
          </span>
        )}
        {doc.dcNo && (
          <span>
            DC No: <strong className="text-gray-700">{doc.dcNo}</strong>
          </span>
        )}
        {doc.invNo && (
          <span>
            Inv No: <strong className="text-gray-700">{doc.invNo}</strong>
          </span>
        )}
        {/* Header-level discount on PurchaseInward (Against Invoice) */}
        {doc.discountValue > 0 && (
          <span>
            Bill Discount:{" "}
            <strong className="text-red-600">
              {fmtDiscount(doc.discountValue, doc.discountType)}
            </strong>
          </span>
        )}
        {/* Net bill value for Against Invoice */}
        {doc.netBillValue > 0 && (
          <span>
            Net Bill:{" "}
            <strong className="text-gray-700">
              {fmtAmount(doc.netBillValue)}
            </strong>
          </span>
        )}
        <LinkedBadge poDocId={row.docId} color="green" />
      </div>
    ),
    rows: (doc.items || []).map((item) => {
      const uomName = item.Uom?.name || "—";
      return [
        item.StyleItem?.name || "—", // 1  Item
        item.Size?.name || "—", // 2  Size
        item.Color?.name || "—", // 3  Color
        item.Gsm?.name || "—", // 4  GSM
        uomName, // 5  UOM
        fmt3(item.poQty), // 6  PO Qty
        fmt3(item.inwardQty), // 7  Inward Qty
        fmtAmount(item.price), // 8  Price (₹ + 2dp)
        item.discountType || "—", // 9  Discount Type
        fmtDiscount(item.discountValue, item.discountType), // 10 Item Discount
        item.taxPercent != null
          ? `${Number(item.taxPercent).toFixed(3)}%`
          : "—", // 11 Tax %
      ];
    }),
  }));

  return (
    <SharedTable
      headers={headers}
      docs={docs}
      empty="No inward records for this PO"
    />
  );
}

// ─── tab: Cancel ──────────────────────────────────────────────────────────────
function CancelTab({ row }) {
  const headers = [
    "Item",
    "Size",
    "Color",
    "GSM",
    "UOM",
    "Cancel Qty",
    // "Ref PO",
    // "Inv No",
  ];

  const docs = (row.cancelDocs || []).map((doc) => ({
    meta: (
      <div className="flex flex-wrap gap-3 items-center">
        <span>
          Po Cancel No: <strong className="text-gray-700">{doc.docId}</strong>
        </span>
        <span>
          Date:{" "}
          <strong className="text-gray-700">{fmtDate(doc.docDate)}</strong>
        </span>
        {doc.poType && (
          <span>
            Type: <strong className="text-gray-700">{doc.poType}</strong>
          </span>
        )}
        <LinkedBadge poDocId={row.docId} color="red" />
      </div>
    ),
    rows: (doc.items || []).map((item) => {
      const uomName = item.Uom?.name || "—";
      return [
        item.StyleItem?.name || "—",
        item.Size?.name || "—",
        item.Color?.name || "—",
        item.Gsm?.name || "—",
        uomName,
        <span className="font-semibold text-red-600">
          {fmt3(item.cancelQty)}
        </span>,
        // item.poDocId || row.docId,

        // item.invNo || "—",
      ];
    }),
  }));

  return (
    <SharedTable
      headers={headers}
      docs={docs}
      empty="No cancel records for this PO"
    />
  );
}

// ─── tab: Return ──────────────────────────────────────────────────────────────
function ReturnTab({ row }) {
  const headers = [
    "Po No",
    "Item",
    "Size",
    "Color",
    "GSM",
    "UOM",
    "Return Qty",

    // "Inv No",
  ];

  const docs = (row.returnDocs || []).map((doc) => ({
    meta: (
      <div className="flex flex-wrap gap-3 items-center">
        <span>
          Po Return No: <strong className="text-gray-700">{doc.docId}</strong>
        </span>
        <span>
          Date:{" "}
          <strong className="text-gray-700">{fmtDate(doc.docDate)}</strong>
        </span>
        {doc.returnType && (
          <span>
            Type: <strong className="text-gray-700">{doc.returnType}</strong>
          </span>
        )}
        <LinkedBadge poDocId={row.docId} color="amber" />
      </div>
    ),
    rows: (doc.items || []).map((item) => {
      const uomName = item.Uom?.name || "—";
      return [
        item.PurchaseInward?.docId || "—",
        item.StyleItem?.name || "—",
        item.Size?.name || "—",
        item.Color?.name || "—",
        item.Gsm?.name || "—",
        uomName,
        <span className="font-semibold text-amber-600">
          {fmt3(item.returnQty)}
        </span>,

        // item.invNo || "—",
      ];
    }),
  }));

  return (
    <SharedTable
      headers={headers}
      docs={docs}
      empty="No return records for this PO"
    />
  );
}

// ─── helpers: format discount and amount ──────────────────────────────────────
function fmtDiscount(discountValue, discountType) {
  if (
    discountValue === null ||
    discountValue === undefined ||
    discountValue === 0
  )
    return "—";
  const val = Number(discountValue).toFixed(3);
  return discountType === "Percentage" ? `${val}%` : `₹${val}`;
}

function fmtAmount(val) {
  if (val === null || val === undefined) return "—";
  return `₹${Number(val).toFixed(3)}`;
}

// ─── tab: Bill Entry ──────────────────────────────────────────────────────────
function BillTab({ row }) {
  const headers = [
    "Inward No",
    "Item",
    "Size",
    "Color",
    "GSM",
    "UOM",
    "Billed Qty",
    "Price", // item-level price
    "Discount Type", // Percentage or Flat
    "Item Discount", // item-level discount value (% or ₹)
    "Tax %", // item-level tax
    // "Inv No",
    "DC No",
  ];

  const docs = (row.billDocs || []).map((doc) => ({
    meta: (
      <div className="flex flex-wrap gap-3 items-center">
        <span>
          Po Bill No: <strong className="text-gray-700">{doc.docId}</strong>
        </span>
        <span>
          Date:{" "}
          <strong className="text-gray-700">{fmtDate(doc.docDate)}</strong>
        </span>
        <span>
          Net Bill:{" "}
          <strong className="text-gray-700">
            {fmtAmount(doc.netBillValue)}
          </strong>
        </span>
        {doc.billType && (
          <span>
            Type: <strong className="text-gray-700">{doc.billType}</strong>
          </span>
        )}
        {/* Header-level discount on PurchaseBillEntry */}
        {doc.discountValue > 0 && (
          <span>
            Bill Discount:{" "}
            <strong className="text-red-600">
              {fmtDiscount(doc.discountValue, doc.discountType)}
            </strong>
          </span>
        )}
        <LinkedBadge poDocId={row.docId} color="purple" />
      </div>
    ),
    rows: (doc.items || []).map((item) => {
      const uomName = item.Uom?.name || "—";
      return [
        item.PurchaseInward?.docId || "—", // 13 Inward Doc
        item.StyleItem?.name || "—", // 1  Item
        item.Size?.name || "—", // 2  Size
        item.Color?.name || "—", // 3  Color
        item.Gsm?.name || "—", // 4  GSM
        uomName, // 5  UOM
        fmt3(item.inwardQty), // 6  Billed Qty
        fmtAmount(item.price), // 7  Price (₹ + 2dp)
        item.discountType || "—", // 8  Discount Type
        fmtDiscount(item.discountValue, item.discountType), // 9  Item Discount (% or ₹)
        item.taxPercent != null
          ? `${Number(item.taxPercent).toFixed(3)}%`
          : "—", // 10 Tax %
        // item.invNo || "—",
        item.dcNo || "—", // 12 DC No
      ];
    }),
  }));

  return (
    <SharedTable
      headers={headers}
      docs={docs}
      empty="No bill entry records for this PO"
    />
  );
}
