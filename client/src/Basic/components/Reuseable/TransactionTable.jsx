/**
 * ErpTable — Reusable ERP data-entry table
 *
 * Props:
 *  columns      : ColDef[]   — column definitions (see below)
 *  rows         : object[]   — row data array
 *  onRowChange  : (value, rowIndex, field) => void
 *  onAddRow     : () => void
 *  onRightClick : (e, rowIndex) => void   (optional)
 *  readOnly     : boolean
 *  footerExtra  : ReactNode  (optional, rendered after standard totals)
 *
 * ColDef shape:
 * {
 *   key        : string          — field name in row data
 *   label      : string          — header label
 *   width      : string          — tailwind width class e.g. "w-20"
 *   type       : "sno"           — serial number (auto)
 *             | "text"           — plain text display (read-only)
 *             | "number"         — editable number input
 *             | "select"         — FxSelect / dropdown
 *             | "selectAdd"      — FxSelectWithAdd
 *             | "computed"       — derived value display (readOnly)
 *             | "action"        — action button (Tax / View)
 *             | "rowAction"      — the Enter-to-add-row hidden input
 *   show?      : boolean | () => boolean  — hide column when false (default true)
 *   required?  : boolean         — shows red asterisk in header
 *   readOnly?  : boolean | (row, index) => boolean
 *   align?     : "left"|"center"|"right"  (default "right" for numbers)
 *
 *   // number-specific
 *   decimals?  : number          — toFixed precision (default 2)
 *   min?       : number
 *   validate?  : (value, row, allRows) => string | null  — return error msg or null
 *   onValidateFail?: (msg, rowIndex, field) => void
 *
 *   // select-specific
 *   options?   : { label, value }[] | (row, allRows) => { label, value }[]
 *   childComponent? : React component (for selectAdd)
 *   addNewModalWidth? : string
 *
 *   // computed-specific
 *   compute?   : (row) => any
 *
 *   // action-specific
 *   actionLabel? : ReactNode
 *   onAction?    : (rowIndex, row) => void
 *   disabled?    : (row) => boolean
 *
 *   // total footer
 *   total?     : boolean         — show column sum in footer (numbers only)
 *   totalCompute? : (rows) => any — custom footer value
 *   footerColSpan?: number       — colspan for label cell
 * }
 */

import React, { useRef, useState } from "react";

// ---------------------------------------------------------------------------
// tiny helpers (replace with your project's actual imports)
// ---------------------------------------------------------------------------
const cx = (...args) => args.filter(Boolean).join(" ");

function resolveShow(col) {
    if (col.show === undefined) return true;
    return typeof col.show === "function" ? col.show() : col.show;
}

function resolveReadOnly(col, row, index, globalReadOnly) {
    if (globalReadOnly) return true;
    if (typeof col.readOnly === "function") return col.readOnly(row, index);
    return col.readOnly ?? false;
}

function resolveOptions(col, row, rows) {
    if (!col.options) return [];
    return typeof col.options === "function" ? col.options(row, rows) : col.options;
}

// ---------------------------------------------------------------------------
// Sub-cells
// ---------------------------------------------------------------------------

function NumberCell({ col, row, rowIndex, rows, readOnly, onRowChange, focusedField, setFocusedField }) {
    const fieldKey = `${rowIndex}-${col.key}`;
    const isDisabled = resolveReadOnly(col, row, rowIndex, readOnly) || (row.stockQty ?? 0) > 0;
    const decimals = col.decimals ?? 2;

    return (
        <input
            id={`${col.key}-input-${rowIndex}`}
            type="number"
            min={col.min ?? 0}
            className="w-full text-right px-1 table-data-input text-[11px] outline-none h-full"
            disabled={isDisabled}
            onFocus={(e) => { e.target.select(); setFocusedField(fieldKey); }}
            value={
                focusedField === fieldKey
                    ? (row[col.key] ?? "")
                    : row[col.key] ? Number(row[col.key]).toFixed(decimals) : ""
            }
            onChange={(e) => onRowChange(e.target.value, rowIndex, col.key)}
            onBlur={(e) => {
                const val = e.target.value;
                // run custom validation
                if (col.validate) {
                    const err = col.validate(val, row, rows);
                    if (err) {
                        onRowChange("", rowIndex, col.key);
                        col.onValidateFail?.(err, rowIndex, col.key);
                        setFocusedField(null);
                        return;
                    }
                }
                onRowChange(val ? Number(val).toFixed(decimals) : "", rowIndex, col.key);
                setFocusedField(null);
            }}
            onKeyDown={(e) => {
                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                if (e.key === "Delete") onRowChange("", rowIndex, col.key);
            }}
        />
    );
}

function SelectCell({ col, row, rowIndex, rows, readOnly, onRowChange }) {
    const isReadOnly = resolveReadOnly(col, row, rowIndex, readOnly);
    const options = resolveOptions(col, row, rows);

    // Render as a styled read-only span when read-only, or a native <select>
    // In your real project swap this for <FxSelect> / <FxSelectWithAdd>
    if (isReadOnly) {
        const match = options.find((o) => o.value === row[col.key]);
        return (
            <span className="px-1 text-[11px]">{match?.label ?? ""}</span>
        );
    }

    return (
        <select
            className="w-full text-[11px] px-1 h-full outline-none bg-transparent"
            value={row[col.key] ?? ""}
            onChange={(e) => onRowChange(e.target.value, rowIndex, col.key)}
            onKeyDown={(e) => { if (e.key === "Delete") onRowChange("", rowIndex, col.key); }}
        >
            <option value="" />
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

function ComputedCell({ col, row }) {
    const value = col.compute ? col.compute(row) : row[col.key];
    return (
        <span className="px-1 text-[11px] text-right block">
            {value != null ? Number(value).toFixed(col.decimals ?? 2) : ""}
        </span>
    );
}

function ActionCell({ col, row, rowIndex, readOnly }) {
    const isDisabled = readOnly || (col.disabled ? col.disabled(row) : false);
    return (
        <button
            disabled={isDisabled}
            className={cx(
                "w-full text-center text-[11px] table-data-input py-0.5",
                isDisabled ? "text-gray-300 cursor-not-allowed" : "text-indigo-600 hover:text-indigo-800"
            )}
            onClick={() => col.onAction?.(rowIndex, row)}
            onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); col.onAction?.(rowIndex, row); }
            }}
        >
            {col.actionLabel ?? "View"}
        </button>
    );
}

function RowActionCell({ col, row, rowIndex, rows, readOnly, onAddRow, actionRefs }) {
    return (
        <input
            ref={(el) => { if (actionRefs) actionRefs.current[rowIndex] = el; }}
            className="w-full table-data-input bg-transparent outline-none"
            disabled={readOnly}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    if (rowIndex === rows.length - 1) onAddRow?.();
                    // focus next row's first editable cell if needed
                }
            }}
        />
    );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function FooterRow({ visibleCols, rows }) {
    // find first col with footerColSpan to build label cell
    let labelSpan = 1;
    let labelBuilt = false;
    const cells = [];

    for (let i = 0; i < visibleCols.length; i++) {
        const col = visibleCols[i];

        if (!labelBuilt) {
            if (col.footerColSpan) { labelSpan = col.footerColSpan; }
            // first col always starts the label
            if (i === 0) {
                cells.push(
                    <td key="label" className="text-right px-4 border border-gray-300 font-medium text-[12px]"
                        colSpan={col.footerColSpan ?? 1}>
                        Total
                    </td>
                );
                if (col.footerColSpan) { i += col.footerColSpan - 1; }
                labelBuilt = true;
                continue;
            }
        }

        if (col.type === "sno") {
            cells.push(<td key={col.key} className="border border-gray-300" />);
            continue;
        }
        if (col.type === "rowAction" || col.type === "action") {
            cells.push(<td key={col.key} className="border border-gray-300" colSpan={col.footerColSpan ?? 1} />);
            continue;
        }

        // total sum
        if (col.total || col.totalCompute) {
            const val = col.totalCompute
                ? col.totalCompute(rows)
                : rows.reduce((s, r) => s + (Number(r[col.key]) || 0), 0);
            cells.push(
                <td key={col.key} className="text-right border border-gray-300 px-1 font-medium text-[12px]">
                    {Number(val).toFixed(col.decimals ?? 2)}
                </td>
            );
        } else {
            cells.push(<td key={col.key} className="border border-gray-300" colSpan={col.footerColSpan ?? 1} />);
        }
    }

    return <tr className="bg-gray-50 h-6 font-medium text-gray-800">{cells}</tr>;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function TransactionTable({
    columns = [],
    rows = [],
    onRowChange,
    onAddRow,
    onRightClick,
    readOnly = false,
    footerExtra,
}) {
    const [focusedField, setFocusedField] = useState(null);
    const actionRefs = useRef([]);

    const visibleCols = columns.filter(resolveShow);

    const alignClass = (col) => {
        if (col.align) return `text-${col.align}`;
        if (col.type === "number" || col.type === "computed") return "text-right";
        if (col.type === "sno") return "text-center";
        return "text-left";
    };

    const renderCell = (col, row, rowIndex) => {
        switch (col.type) {
            case "sno":
                return <span className="text-[11px]">{rowIndex + 1}</span>;

            case "text":
                return (
                    <span className="px-1 text-[11px]">
                        {col.compute ? col.compute(row) : row[col.key] ?? ""}
                    </span>
                );

            case "number":
                return (
                    <NumberCell
                        col={col} row={row} rowIndex={rowIndex} rows={rows}
                        readOnly={readOnly} onRowChange={onRowChange}
                        focusedField={focusedField} setFocusedField={setFocusedField}
                    />
                );

            case "select":
            case "selectAdd":
                return (
                    <SelectCell
                        col={col} row={row} rowIndex={rowIndex} rows={rows}
                        readOnly={readOnly} onRowChange={onRowChange}
                    />
                );

            case "computed":
                return <ComputedCell col={col} row={row} />;

            case "action":
                return <ActionCell col={col} row={row} rowIndex={rowIndex} readOnly={readOnly} />;

            case "rowAction":
                return (
                    <RowActionCell
                        col={col} row={row} rowIndex={rowIndex} rows={rows}
                        readOnly={readOnly} onAddRow={onAddRow} actionRefs={actionRefs}
                    />
                );

            default:
                return <span className="px-1 text-[11px]">{row[col.key] ?? ""}</span>;
        }
    };

    return (
        <table className="w-full border-collapse table-fixed">
            {/* ── HEADER ── */}
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                <tr className="text-[12px]">
                    {visibleCols.map((col) => (
                        <th
                            key={col.key}
                            className={cx(col.width, "px-2 py-2 font-medium border border-gray-300", alignClass(col))}
                        >
                            {col.label}
                            {col.required && <span className="text-red-500">*</span>}
                        </th>
                    ))}
                </tr>
            </thead>

            {/* ── BODY ── */}
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr
                        key={rowIndex}
                        className={cx(
                            rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100",
                            "border border-blue-gray-200 cursor-pointer h-6"
                        )}
                        onContextMenu={(e) => { if (!readOnly) onRightClick?.(e, rowIndex); }}
                    >
                        {visibleCols.map((col) => (
                            <td
                                key={col.key}
                                className={cx(
                                    "border border-gray-300 text-[11px]",
                                    alignClass(col),
                                    col.cellClass
                                )}
                            >
                                {renderCell(col, row, rowIndex)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>

            {/* ── FOOTER ── */}
            <tfoot>
                <FooterRow visibleCols={visibleCols} rows={rows} />
                {footerExtra}
            </tfoot>
        </table>
    );
}